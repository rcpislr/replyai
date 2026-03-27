# ReplyAI 🤖

**Yapay zeka destekli müşteri hizmetleri SaaS platformu**

E-ticaret satıcıları için müşteri mesajlarını otomatik olarak Trendyol, Hepsiburada ve Instagram'dan yanıtlayan sistem.

---

## ⚡ Quick Start

### Development Mode
```bash
# 1. Backend
cd apps/api
pnpm dev  # http://localhost:3001

# 2. Dashboard
cd apps/dashboard
pnpm dev  # http://localhost:3002

# 3. Admin
cd apps/admin
pnpm dev  # http://localhost:3003

# 4. Database Services (Docker)
cd infra/docker
docker-compose up -d  # PostgreSQL, Redis, Qdrant
```

### Production Mode
```bash
cd infra/docker
docker-compose -f docker-compose.production.yml up -d
# Access: http://localhost:3000
```

---

## 🏗️ Architecture

### Frontend
- **Dashboard** (Next.js) - Tenant panel
- **Admin** (Next.js) - Owner panel
- **Web** (Next.js) - Marketing site
- **UI Components** - Reusable components library

### Backend
- **API** (Node.js + Express) - REST API
- **Auth** - JWT + RBAC
- **AI Engine** - Mock AI (ready for real providers)
- **Platform Connectors** - Webhook handlers

### Data Layer
- **PostgreSQL** - Multi-tenant database
- **Redis** - Caching & queues
- **Qdrant** - Vector database for RAG
- **S3/R2** - File storage

---

## 📋 Features

### ✅ Implemented
- Multi-tenant architecture
- User authentication & authorization
- Message ingestion from platforms
- AI response generation (mock)
- Approval system with confidence scoring
- Knowledge base for AI context
- Modern responsive UI
- Real-time API integration

### 🚧 Ready to Implement
- Real AI provider integration (OpenRouter, OpenAI)
- Stripe payment processing
- Email notifications
- Analytics dashboard
- Team management
- API webhooks

---

## 📁 Project Structure

```
replyai/
├── apps/
│   ├── api/              Node.js backend
│   ├── dashboard/        Next.js tenant panel
│   ├── admin/            Next.js admin panel
│   └── web/              Next.js marketing
│
├── packages/
│   ├── shared/           Types & constants
│   ├── auth/             JWT + RBAC
│   ├── ai-engine/        AI providers
│   ├── platform-connectors/  Channel adapters
│   ├── knowledge-base/       RAG pipeline
│   ├── ui-base/          Shared components
│   ├── ui-dashboard/     Dashboard components
│   ├── payments/         Billing integration
│   └── api-client/       Frontend HTTP client
│
├── infra/docker/
│   ├── docker-compose.yml              Development
│   ├── docker-compose.production.yml   Production
│   ├── nginx.conf                      Router config
│   └── nginx.production.conf           Production config
│
└── PRODUCTION_GUIDE.md   Deployment instructions
```

---

## 🔑 Key Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### Messages
```
GET /api/messages
POST /api/messages/:id/approve
POST /api/messages/:id/reject
```

### Dashboard
```
GET /api/dashboard/stats
GET /api/dashboard/usage
```

---

## 🗄️ Database

**14 tables** with RLS (Row-Level Security):
- Users, Tenants, Subscriptions
- Platforms, Messages, KnowledgeBase
- PaymentTransactions, ApiKeys
- AuditLogs, SystemSettings, etc.

```bash
# Access database
docker exec -it replyai-db psql -U postgres -d replyai
```

---

## 🚀 Deployment

### Requirements
- Docker & Docker Compose
- 2+ CPU cores
- 4GB+ RAM
- 20GB+ storage

### Steps
1. Clone repository
2. Copy `.env.production`
3. Update secrets (JWT_SECRET, MASTER_KEY, API_KEYs)
4. Run: `docker-compose -f docker-compose.production.yml up -d`
5. Access: http://localhost:3000

### Scaling
- Use managed PostgreSQL (RDS, Supabase)
- Use managed Redis (ElastiCache, Upstash)
- Use managed Qdrant (Qdrant Cloud)
- Deploy API behind load balancer

---

## 👤 Demo Account

```
Email:    test@test.com
Password: password123
```

Or register a new account!

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Redis, Qdrant |
| ORM | Drizzle ORM |
| Auth | JWT, bcryptjs |
| Deployment | Docker, Docker Compose, Nginx |
| Monorepo | Turborepo, pnpm |

---

## 📞 Support

- Check `PRODUCTION_GUIDE.md` for detailed setup
- View logs: `docker logs <service-name>`
- Database queries: `docker exec -it replyai-db psql`
- API health: `curl http://localhost:3000/health`

---

## 📄 License

All rights reserved © 2024

---

**Built with ❤️ for Turkish e-commerce**

Made with Turborepo + Next.js + Node.js + PostgreSQL
