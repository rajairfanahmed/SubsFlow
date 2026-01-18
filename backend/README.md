# SubsFlow Backend

**Production-grade subscription management platform API**

[![CI](https://github.com/your-org/subsflow/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/subsflow/actions/workflows/ci.yml)
[![Security](https://github.com/your-org/subsflow/actions/workflows/security.yml/badge.svg)](https://github.com/your-org/subsflow/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **🔐 Authentication** - JWT-based auth with refresh tokens, email verification, password reset
- **💳 Stripe Integration** - Subscriptions, checkout, billing portal, webhooks
- **📧 Email Notifications** - SendGrid integration with templates
- **🎯 Tier-Based Access** - Content access control based on subscription tier
- **📊 Analytics** - Dashboard metrics, time series, conversion funnels
- **🔔 Notifications** - In-app notification system with priorities
- **🔄 Background Jobs** - Bull queue for async processing
- **📝 API Docs** - OpenAPI/Swagger documentation

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB 7+ |
| Cache | Redis 7+ |
| Payments | Stripe |
| Email | SendGrid |
| Queue | Bull (Redis) |
| Testing | Jest |

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+
- Redis 7+
- Stripe account
- SendGrid account

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/subsflow.git
cd subsflow/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npm run db:migrate

# Seed default plans
npm run db:seed

# Start development server
npm run dev
```

### Docker Development

```bash
# Start all services (MongoDB, Redis, API)
npm run docker:dev

# Stop services
npm run docker:down
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plans` | List all plans |
| GET | `/api/subscriptions/me` | Get user subscription |
| POST | `/api/billing/checkout-session` | Create checkout |
| GET | `/api/billing/portal` | Billing portal URL |

### Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | List published content |
| GET | `/api/content/:id` | Get content (tier-gated) |
| POST | `/api/content/:id/complete` | Mark as complete |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (admin) |
| GET | `/api/analytics/dashboard` | Dashboard metrics |
| GET | `/api/analytics/funnel` | Conversion funnel |

### Documentation
- **Swagger UI**: `http://localhost:5000/api/docs`
- **OpenAPI JSON**: `http://localhost:5000/api/docs/openapi.json`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests with coverage |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint check |
| `npm run db:seed` | Seed database |
| `npm run db:migrate` | Run migrations |

## Project Structure

```
src/
├── config/          # Configuration
├── controllers/     # Route handlers
├── docs/            # OpenAPI spec
├── jobs/            # Background jobs
├── middlewares/     # Express middlewares
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Helpers & utilities
├── validators/      # Zod schemas
├── webhooks/        # Stripe webhooks
├── app.ts           # Express app
└── server.ts        # Entry point
tests/
├── setup.ts         # Test configuration
├── factories.ts     # Test data factories
└── unit/            # Unit tests
```

## Environment Variables

See [.env.example](.env.example) for all configuration options.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment guide.

## License

MIT © SubsFlow Team
