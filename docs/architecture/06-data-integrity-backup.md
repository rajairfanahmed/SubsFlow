# SubsFlow Backend - Data Integrity & Backup Strategy

**Document Version:** 1.0  
**Last Updated:** 2026-01-13  
**Status:** Approved

---

## Table of Contents

1. [Data Validation](#data-validation)
2. [Referential Integrity](#referential-integrity)
3. [Audit Trail](#audit-trail)
4. [Backup Strategy](#backup-strategy)
5. [Disaster Recovery](#disaster-recovery)
6. [Data Encryption](#data-encryption)
7. [Privacy & Anonymization](#privacy--anonymization)

---

## Data Validation

### Application-Level Validation (Joi)

```typescript
// validation/subscription.validation.ts
import Joi from 'joi';

export const createSubscriptionSchema = Joi.object({
  planId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid plan ID format'
    }),
  couponCode: Joi.string()
    .alphanum()
    .max(20)
    .optional()
});

export const updatePaymentMethodSchema = Joi.object({
  paymentMethodId: Joi.string()
    .pattern(/^pm_/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Stripe payment method ID'
    })
});
```

### Database-Level Validation (MongoDB JSON Schema)

```javascript
// MongoDB collection validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "passwordHash", "name", "role", "status"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^\\S+@\\S+\\.\\S+$",
          description: "Must be a valid email"
        },
        role: {
          enum: ["subscriber", "content_manager", "admin"],
          description: "Must be a valid role"
        },
        status: {
          enum: ["active", "suspended", "deleted"],
          description: "Must be a valid status"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});
```

---

## Referential Integrity

### Cascade Delete Handler

```typescript
// hooks/user.hooks.ts
userSchema.pre('deleteOne', { document: true }, async function() {
  const userId = this._id;
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Cancel active subscription in Stripe
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing', 'past_due'] }
    }).session(session);
    
    if (subscription) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      await Subscription.updateOne(
        { _id: subscription._id },
        { status: 'canceled', canceledAt: new Date() },
        { session }
      );
    }
    
    // Soft delete related data
    await Notification.updateMany(
      { userId },
      { $set: { 'metadata.userDeleted': true } },
      { session }
    );
    
    // Anonymize analytics (don't delete for reporting)
    await AnalyticsEvent.updateMany(
      { userId },
      { $unset: { userId: 1 }, $set: { anonymized: true } },
      { session }
    );
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
```

### Orphan Prevention

```typescript
// jobs/integrity-check.job.ts
async function checkOrphanedSubscriptions(): Promise<void> {
  const orphans = await Subscription.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $match: { user: { $size: 0 } } },
    { $project: { _id: 1, stripeSubscriptionId: 1 } }
  ]);
  
  if (orphans.length > 0) {
    logger.warn('Orphaned subscriptions found', { count: orphans.length });
    // Alert admin for investigation
  }
}
```

---

## Audit Trail

### Audit Log Schema

```typescript
// models/audit-log.model.ts
const auditLogSchema = new Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'subscription_created',
      'subscription_upgraded',
      'subscription_downgraded',
      'subscription_canceled',
      'payment_succeeded',
      'payment_failed',
      'refund_processed',
      'user_suspended',
      'admin_action'
    ]
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  entityType: {
    type: String,
    enum: ['user', 'subscription', 'payment', 'content']
  },
  entityId: Schema.Types.ObjectId,
  previousState: Schema.Types.Mixed,
  newState: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

// Immutable - no updates allowed
auditLogSchema.pre('updateOne', function() {
  throw new Error('Audit logs cannot be modified');
});
```

### Audit Logging Middleware

```typescript
// middlewares/audit.middleware.ts
function createAuditMiddleware(action: string) {
  return async function(next: Function) {
    const doc = this;
    const originalDoc = await doc.constructor.findById(doc._id);
    
    await next();
    
    await AuditLog.create({
      action,
      userId: doc.userId,
      entityType: doc.constructor.modelName.toLowerCase(),
      entityId: doc._id,
      previousState: originalDoc?.toObject(),
      newState: doc.toObject()
    });
  };
}

subscriptionSchema.post('save', createAuditMiddleware('subscription_updated'));
```

---

## Backup Strategy

### Backup Schedule

| Type | Frequency | Retention | Storage |
|------|-----------|-----------|---------|
| **Full Backup** | Daily 02:00 UTC | 7 days | S3/GCS |
| **Incremental** | Hourly | 24 hours | S3/GCS |
| **Oplog Backup** | Continuous | 72 hours | S3/GCS |
| **Weekly Archive** | Sunday 03:00 UTC | 4 weeks | Glacier/Coldline |
| **Monthly Archive** | 1st of month | 12 months | Glacier/Coldline |

### Backup Configuration (MongoDB Atlas)

```yaml
# atlas-backup-policy.yaml
backupPolicy:
  # Continuous backup with point-in-time recovery
  continuousBackup:
    enabled: true
    retentionPeriod: 7  # days
    
  # Scheduled snapshots
  scheduledSnapshots:
    - frequency: daily
      retentionDays: 7
    - frequency: weekly
      retentionWeeks: 4
    - frequency: monthly
      retentionMonths: 12
      
  # Cross-region replication
  replication:
    enabled: true
    targetRegions:
      - us-west-2
      - eu-west-1
```

### Self-Hosted Backup Script

```bash
#!/bin/bash
# scripts/backup-mongodb.sh

DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/backups/mongodb"
S3_BUCKET="subsflow-backups"

# Create backup
mongodump \
  --uri="${MONGODB_URI}" \
  --out="${BACKUP_DIR}/${DATE}" \
  --gzip \
  --oplog

# Upload to S3
aws s3 sync \
  "${BACKUP_DIR}/${DATE}" \
  "s3://${S3_BUCKET}/daily/${DATE}" \
  --storage-class STANDARD_IA

# Cleanup old local backups (keep 3 days)
find ${BACKUP_DIR} -type d -mtime +3 -exec rm -rf {} \;

# Verify backup
mongorestore \
  --uri="${MONGODB_URI_TEST}" \
  --dir="${BACKUP_DIR}/${DATE}" \
  --gzip \
  --drop \
  --dryRun
```

---

## Disaster Recovery

### Recovery Objectives

| Metric | Target | Description |
|--------|--------|-------------|
| **RTO** | 1 hour | Time to restore service |
| **RPO** | 1 hour | Maximum data loss |
| **MTTR** | 30 minutes | Mean time to repair |

### Recovery Procedures

#### Scenario 1: Database Corruption

```bash
# 1. Stop application
docker-compose stop app

# 2. Restore from latest backup
mongorestore \
  --uri="${MONGODB_URI}" \
  --dir="/backups/mongodb/latest" \
  --gzip \
  --drop

# 3. Replay oplog to point-in-time
mongorestore \
  --uri="${MONGODB_URI}" \
  --oplogReplay \
  --oplogLimit="2026-01-13T10:00:00Z"

# 4. Verify data
node scripts/verify-data-integrity.js

# 5. Restart application
docker-compose up -d app
```

#### Scenario 2: Complete Region Failure

```bash
# 1. Update DNS to secondary region
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456 \
  --change-batch file://failover-dns.json

# 2. Promote replica to primary
mongo --host secondary-region \
  --eval "rs.stepDown()"

# 3. Reconfigure application
kubectl set env deployment/app \
  MONGODB_URI="${MONGODB_SECONDARY_URI}"

# 4. Notify stakeholders
./scripts/notify-incident.sh "Region failover complete"
```

### Backup Verification

```typescript
// jobs/backup-verification.job.ts
async function verifyBackup(): Promise<void> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Restore to test database
  await exec(`mongorestore --uri="${TEST_MONGODB_URI}" --drop ...`);
  
  // Run verification queries
  const testDb = mongoose.connection.useDb('subsflow_test');
  
  const userCount = await testDb.collection('users').countDocuments();
  const subCount = await testDb.collection('subscriptions').countDocuments();
  
  // Compare with production
  const prodUserCount = await User.countDocuments();
  
  if (Math.abs(userCount - prodUserCount) > 100) {
    throw new Error('Backup user count mismatch');
  }
  
  logger.info('Backup verification passed', { userCount, subCount });
}
```

---

## Data Encryption

### Encryption at Rest

```yaml
# MongoDB Atlas encryption config
encryptionAtRest:
  enabled: true
  awsKmsKeyId: "arn:aws:kms:us-east-1:123456:key/abc-123"
  # or
  gcpKmsKeyId: "projects/subsflow/locations/global/keyRings/db/cryptoKeys/main"
```

### Encryption in Transit

```typescript
// config/database.ts
const mongoOptions: ConnectOptions = {
  ssl: true,
  sslValidate: true,
  sslCA: fs.readFileSync('/path/to/ca.pem'),
  authMechanism: 'SCRAM-SHA-256'
};
```

### Field-Level Encryption

```typescript
// For sensitive fields (not PCI data - that's in Stripe)
const userSchema = new Schema({
  // ... other fields
  
  // Encrypted at application level
  twoFactorSecret: {
    type: String,
    set: (value: string) => encrypt(value, process.env.ENCRYPTION_KEY),
    get: (value: string) => decrypt(value, process.env.ENCRYPTION_KEY)
  }
});
```

---

## Privacy & Anonymization

### GDPR Data Export

```typescript
// services/user.service.ts
async exportUserData(userId: string): Promise<object> {
  const user = await User.findById(userId).lean();
  const subscriptions = await Subscription.find({ userId }).lean();
  const payments = await Payment.find({ userId }).lean();
  const notifications = await Notification.find({ userId }).lean();
  
  return {
    personal: {
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt
    },
    subscriptions: subscriptions.map(s => ({
      plan: s.planId,
      status: s.status,
      createdAt: s.createdAt
    })),
    payments: payments.map(p => ({
      amount: p.amount,
      currency: p.currency,
      date: p.createdAt
    })),
    communications: notifications.length
  };
}
```

### GDPR Data Deletion

```typescript
// services/user.service.ts
async deleteUserData(userId: string): Promise<void> {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // 1. Cancel active subscriptions
    // 2. Anonymize analytics
    await AnalyticsEvent.updateMany(
      { userId },
      { $unset: { userId: 1 }, $set: { anonymized: true } },
      { session }
    );
    
    // 3. Delete personal data
    await User.deleteOne({ _id: userId }, { session });
    await Notification.deleteMany({ userId }, { session });
    
    // 4. Keep anonymized payment records (legal requirement)
    await Payment.updateMany(
      { userId },
      { 
        $unset: { 
          'billingDetails.name': 1,
          'billingDetails.email': 1 
        },
        $set: { anonymized: true }
      },
      { session }
    );
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Data Retention Policy

| Data Type | Retention | Justification |
|-----------|-----------|---------------|
| User accounts | Until deletion requested | Service provision |
| Active subscriptions | Until canceled + 30 days | Service provision |
| Payment records | 7 years | Tax/legal requirements |
| Analytics events | 90 days | Performance optimization |
| Audit logs | 5 years | Compliance |
| Support tickets | 3 years | Service quality |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-13 | Backend Team | Initial release |
