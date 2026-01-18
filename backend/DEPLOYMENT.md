# SubsFlow Production Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- MongoDB Atlas account (or self-hosted MongoDB)
- Redis instance (or Redis Cloud)
- Stripe account with API keys
- SendGrid account with API key
- Domain with SSL certificate

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.production
   ```

2. **Configure environment variables** in `.env.production`

3. **Generate secure JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

## Deployment Options

### Option 1: Docker Compose (Single Server)

```bash
# Build and start services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f api

# Scale API containers
docker-compose up -d --scale api=3
```

### Option 2: Kubernetes

1. **Create namespace:**
   ```bash
   kubectl create namespace subsflow
   ```

2. **Create secrets:**
   ```bash
   kubectl create secret generic subsflow-secrets \
     --from-env-file=.env.production \
     -n subsflow
   ```

3. **Apply manifests:**
   ```bash
   kubectl apply -f k8s/ -n subsflow
   ```

## Database Setup

1. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

2. **Seed initial data:**
   ```bash
   npm run db:seed
   ```

## Health Checks

- **Liveness:** `GET /api/health/live`
- **Readiness:** `GET /api/health/ready`

## Monitoring

### Prometheus Metrics

Add to your Prometheus configuration:
```yaml
scrape_configs:
  - job_name: 'subsflow-api'
    static_configs:
      - targets: ['api:5000']
    metrics_path: '/metrics'
```

### Logging

Logs are output in JSON format. Configure your log aggregator to parse:
- `level`: log level (info, warn, error)
- `requestId`: correlation ID
- `timestamp`: ISO8601 timestamp

## Backup Strategy

### MongoDB Backup

```bash
# Daily backup script
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="$MONGODB_URI" /backups/20240101
```

### Scheduled Backups

Add to crontab:
```
0 2 * * * /opt/scripts/backup-mongodb.sh
```

## Scaling Considerations

1. **Horizontal scaling:** Run multiple API containers behind a load balancer
2. **Redis:** Use Redis Cluster for high availability
3. **MongoDB:** Use replica sets for read scaling
4. **CDN:** Use CloudFront/Cloudflare for static assets

## Security Checklist

- [ ] All secrets stored in environment variables
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Security headers configured (Helmet.js)
- [ ] Database access restricted by IP
- [ ] API keys rotated regularly
