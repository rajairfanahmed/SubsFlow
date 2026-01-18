# SubsFlow Backend Architecture Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-13  
**Platform:** SubsFlow - Subscription Management for Creators

---

## Document Index

### Phase 1: Project Foundation ✅

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 1 | [Requirements Analysis](./01-requirements-analysis.md) | Functional requirements, 30+ edge cases, compliance, KPIs | ✅ Complete |
| 2 | [Technology Stack](./02-technology-stack.md) | MongoDB, Node.js, Redis, Docker justification | ✅ Complete |
| 3 | [System Architecture](./03-system-architecture.md) | Layered architecture, data flows, security | ✅ Complete |

### Phase 2: Data Layer Design ✅

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 4 | [MongoDB Schema Design](./04-mongodb-schema.md) | Collections, TypeScript interfaces, indexes | ✅ Complete |
| 5 | [Transaction Design](./05-transaction-design.md) | ACID patterns, idempotency, locking | ✅ Complete |
| 6 | [Data Integrity & Backup](./06-data-integrity-backup.md) | Backup strategy, disaster recovery, GDPR | ✅ Complete |

### Phase 3: Authentication & Authorization (Pending)

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 7 | Authentication System | Registration, JWT, password reset | ⏳ Pending |
| 8 | Authorization & Access Control | RBAC, permissions matrix | ⏳ Pending |
| 9 | Security Hardening | Rate limiting, input validation | ⏳ Pending |

### Phase 4-17: (Pending)

Full implementation documentation for:
- Stripe Integration (Steps 10-14)
- SendGrid Integration (Steps 15-17)
- Subscription Business Logic (Steps 18-22)
- Content Access Control (Steps 23-25)
- Notification System (Steps 26-28)
- Analytics & Reporting (Steps 29-31)
- Background Jobs (Steps 32-34)
- Error Handling & Logging (Steps 35-37)
- API Design (Steps 38-40)
- Testing Strategy (Steps 41-45)
- Docker & Containerization (Steps 46-48)
- CI/CD Pipeline (Steps 49-51)
- Deployment & Operations (Steps 52-55)
- Documentation & Runbooks (Steps 56-59)

---

## Quick Reference

### Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | 20 LTS |
| Framework | Express.js | 4.x |
| Database | MongoDB | 7.0 |
| Cache | Redis | 7.2 |
| Payments | Stripe | v2024-12 |
| Email | SendGrid | v3 |
| Queue | Bull | 4.x |

### Key Architecture Decisions

1. **MongoDB over PostgreSQL**: Schema flexibility for subscription metadata
2. **Express over NestJS**: Maximum flexibility, largest ecosystem
3. **Redis for caching**: Sub-millisecond subscription status checks
4. **Stripe Checkout**: Hosted payment UI, lowest PCI burden
5. **Bull for jobs**: Reliable background processing with Redis

### Service Credentials

> ⚠️ **These are TEST keys only. Never commit production keys.**

| Service | Key Type | Reference |
|---------|----------|-----------|
| Stripe | Publishable | `pk_test_51Soaot...` |
| Stripe | Secret | `sk_test_51Soaot...` |
| SendGrid | API Key | `SG.UPfB3hVZ...` |
| MongoDB | Connection | `mongodb://localhost:27017/` |

---

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in credentials
3. Run `docker-compose up -d` to start MongoDB and Redis
4. Run `npm install` to install dependencies
5. Run `npm run dev` to start the development server

---

## Contact

For questions about this architecture, contact the Backend Architecture Team.
