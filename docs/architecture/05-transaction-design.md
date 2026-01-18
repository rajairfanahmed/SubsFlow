# SubsFlow Backend - Database Transaction Design

**Document Version:** 1.0  
**Last Updated:** 2026-01-13  
**Status:** Approved

---

## Table of Contents

1. [Transaction Overview](#transaction-overview)
2. [Operations Requiring Transactions](#operations-requiring-transactions)
3. [Transaction Patterns](#transaction-patterns)
4. [Idempotency Implementation](#idempotency-implementation)
5. [Locking Strategies](#locking-strategies)
6. [Retry Logic](#retry-logic)
7. [Isolation Levels](#isolation-levels)

---

## Transaction Overview

MongoDB supports multi-document ACID transactions since version 4.0. SubsFlow uses transactions for **financial operations only** to ensure data consistency while maintaining performance for non-critical operations.

### When to Use Transactions

| Use Case | Transaction Required | Reason |
|----------|---------------------|--------|
| Create subscription + payment | ✅ Yes | Financial consistency |
| Update subscription status | ✅ Yes | Webhook idempotency |
| Process refund | ✅ Yes | Payment integrity |
| Update user profile | ❌ No | Non-critical |
| Log analytics event | ❌ No | Eventually consistent is fine |
| Send notification | ❌ No | Retry handles failures |

---

## Operations Requiring Transactions

### 1. Subscription Creation

```typescript
// services/subscription.service.ts
async createSubscription(
  userId: string,
  stripeSubscription: Stripe.Subscription
): Promise<ISubscription> {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' }
    });

    // 1. Create subscription record
    const [subscription] = await Subscription.create([{
      userId,
      planId: stripeSubscription.metadata.planId,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: stripeSubscription.customer,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    }], { session });

    // 2. Record initial payment
    await Payment.create([{
      userId,
      subscriptionId: subscription._id,
      stripePaymentIntentId: stripeSubscription.latest_invoice?.payment_intent,
      amount: stripeSubscription.items.data[0].price.unit_amount,
      currency: stripeSubscription.currency,
      status: 'succeeded'
    }], { session });

    // 3. Update user's Stripe customer ID if not set
    await User.updateOne(
      { _id: userId, stripeCustomerId: { $exists: false } },
      { $set: { stripeCustomerId: stripeSubscription.customer } },
      { session }
    );

    await session.commitTransaction();
    return subscription;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### 2. Subscription Status Update (Webhook)

```typescript
// webhooks/stripe.webhook.ts
async handleSubscriptionUpdated(
  event: Stripe.Event
): Promise<void> {
  const stripeSubscription = event.data.object as Stripe.Subscription;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Check idempotency
    const processed = await ProcessedEvent.findOne({
      eventId: event.id
    }).session(session);

    if (processed) {
      await session.abortTransaction();
      return; // Already processed
    }

    // Update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: stripeSubscription.id },
      {
        $set: {
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        }
      },
      { session, new: true }
    );

    // Mark event as processed
    await ProcessedEvent.create([{
      eventId: event.id,
      eventType: event.type,
      processedAt: new Date()
    }], { session });

    await session.commitTransaction();

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### 3. Refund Processing

```typescript
// services/payment.service.ts
async processRefund(
  paymentId: string,
  amount: number,
  reason: string
): Promise<IPayment> {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Get payment
    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) throw new NotFoundError('Payment not found');
    if (payment.status === 'refunded') throw new ConflictError('Already refunded');

    // 2. Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: amount,
      reason: 'requested_by_customer'
    });

    // 3. Update payment record
    payment.status = amount >= payment.amount ? 'refunded' : 'partially_refunded';
    payment.refundedAmount = (payment.refundedAmount || 0) + amount;
    payment.refundReason = reason;
    await payment.save({ session });

    // 4. Create audit log
    await AuditLog.create([{
      action: 'refund_processed',
      userId: payment.userId,
      entityType: 'payment',
      entityId: payment._id,
      details: { amount, reason, stripeRefundId: refund.id }
    }], { session });

    await session.commitTransaction();
    return payment;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## Transaction Patterns

### Pattern 1: Read-Modify-Write

```typescript
// Prevents lost updates
async incrementEngagement(contentId: string): Promise<void> {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    await Content.findByIdAndUpdate(
      contentId,
      { $inc: { 'engagement.views': 1 } },
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

### Pattern 2: Saga Pattern (Multi-Service)

```typescript
// For operations spanning external services
async upgradeSubscription(
  subscriptionId: string,
  newPlanId: string
): Promise<void> {
  const session = await mongoose.startSession();
  let stripeUpdated = false;

  try {
    session.startTransaction();

    // 1. Update local record (pending)
    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { $set: { pendingPlanId: newPlanId } },
      { session, new: true }
    );

    // 2. Update Stripe (external)
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [{ price: newPlanId }],
      proration_behavior: 'create_prorations'
    });
    stripeUpdated = true;

    // 3. Confirm local update
    await Subscription.findByIdAndUpdate(
      subscriptionId,
      { 
        $set: { planId: newPlanId },
        $unset: { pendingPlanId: 1 }
      },
      { session }
    );

    await session.commitTransaction();

  } catch (error) {
    await session.abortTransaction();
    
    // Compensating action: Revert Stripe if needed
    if (stripeUpdated) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{ price: subscription.planId }] // Revert
      });
    }
    
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## Idempotency Implementation

### Processed Events Collection

```typescript
// models/processed-event.model.ts
const processedEventSchema = new Schema({
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  eventType: String,
  processedAt: {
    type: Date,
    default: Date.now
  }
});

// TTL: Remove after 7 days
processedEventSchema.index(
  { processedAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);
```

### Webhook Handler with Idempotency

```typescript
// webhooks/stripe.webhook.ts
async handleWebhook(req: Request, res: Response): Promise<void> {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    STRIPE_WEBHOOK_SECRET
  );

  // Quick idempotency check (outside transaction for performance)
  const alreadyProcessed = await ProcessedEvent.exists({ eventId: event.id });
  if (alreadyProcessed) {
    res.status(200).json({ received: true, status: 'already_processed' });
    return;
  }

  // Process with transaction (includes second idempotency check)
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event);
        break;
      // ... other handlers
    }
    res.status(200).json({ received: true });
  } catch (error) {
    // Log but return 200 to prevent Stripe retries for business errors
    logger.error('Webhook processing error', { eventId: event.id, error });
    res.status(200).json({ received: true, error: error.message });
  }
}
```

---

## Locking Strategies

### Optimistic Locking with Version Field

```typescript
// models/subscription.model.ts
const subscriptionSchema = new Schema({
  // ... other fields
  __v: { type: Number, select: true } // Version key
});

// Usage
async updateSubscription(id: string, updates: object): Promise<ISubscription> {
  const subscription = await Subscription.findById(id);
  
  Object.assign(subscription, updates);
  
  try {
    return await subscription.save(); // Throws on version conflict
  } catch (error) {
    if (error.name === 'VersionError') {
      throw new ConflictError('Subscription was modified by another process');
    }
    throw error;
  }
}
```

### Distributed Lock with Redis

```typescript
// utils/lock.ts
import Redlock from 'redlock';

const redlock = new Redlock([redisClient], {
  driftFactor: 0.01,
  retryCount: 3,
  retryDelay: 200,
  retryJitter: 100
});

async function withLock<T>(
  resource: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const lock = await redlock.acquire([`locks:${resource}`], ttl);
  
  try {
    return await fn();
  } finally {
    await lock.release();
  }
}

// Usage: Prevent concurrent subscription updates
await withLock(
  `subscription:${subscriptionId}`,
  5000, // 5 second lock
  async () => {
    await processSubscriptionUpdate(subscriptionId);
  }
);
```

---

## Retry Logic

### Exponential Backoff

```typescript
// utils/retry.ts
interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 5000 }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on validation or auth errors
      if (error instanceof ValidationError || error instanceof AuthError) {
        throw error;
      }

      if (attempt < options.maxAttempts) {
        const delay = Math.min(
          options.baseDelayMs * Math.pow(2, attempt - 1),
          options.maxDelayMs
        );
        await sleep(delay + Math.random() * 100); // Add jitter
      }
    }
  }

  throw lastError;
}

// Usage
const subscription = await withRetry(
  () => createSubscriptionWithTransaction(userId, stripeData),
  { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 2000 }
);
```

### Retry Schedule Table

| Attempt | Delay | Total Elapsed |
|---------|-------|---------------|
| 1 | Immediate | 0ms |
| 2 | 100ms | 100ms |
| 3 | 200ms | 300ms |
| 4 | 400ms | 700ms |
| 5 | 800ms | 1.5s |

---

## Isolation Levels

### MongoDB Read/Write Concerns

| Operation | Read Concern | Write Concern |
|-----------|--------------|---------------|
| Financial transactions | `snapshot` | `majority` |
| User profile updates | `local` | `1` |
| Analytics writes | `local` | `1` |
| Critical reads | `linearizable` | N/A |

### Configuration

```typescript
// Transaction options for financial operations
const FINANCIAL_TRANSACTION_OPTIONS: TransactionOptions = {
  readConcern: { level: 'snapshot' },
  writeConcern: { w: 'majority', j: true },
  readPreference: 'primary'
};

// Non-critical operations
const STANDARD_WRITE_OPTIONS = {
  writeConcern: { w: 1 }
};
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-13 | Backend Team | Initial release |
