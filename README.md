# SocietyCare - AI-Powered Smart Society Management System

A full-stack, production-ready web application for housing society management with AI-powered service request handling, dual dashboards, and integrated payment management.

## Features

### Resident Portal
- Create service requests via **text or voice** with AI processing
- **AI Speech-to-Text** conversion (supports Hindi and English)
- **Automatic translation** to English and **AI-powered summarization**
- Track request lifecycle: Pending → Assigned → In Progress → Completed
- Confirm service and provide feedback/ratings
- **Emergency SOS** button for urgent situations
- **Visitor management** with QR-based entry passes
- **Online payments** for maintenance fees (Razorpay integration)
- View payment history and download receipts
- Manage profile and family members
- Receive push notifications for updates

### Admin Dashboard
- View analytics with charts (request trends, category distribution)
- Manage all service requests with filters and search
- Assign service personnel to requests
- Manage resident database and staff directory
- Create and manage **announcements**
- Configure **maintenance fee structure** with late fee calculation
- Track payment collection and record offline payments

### Staff Module
- View assigned tasks with resident details
- Update task status (Accept → In Progress → Completed)
- Upload proof of service (photo/digital signature)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Tailwind CSS, Recharts, React Router v6 |
| Backend | Node.js, Express.js, Sequelize ORM |
| Database | PostgreSQL 15 |
| Auth | JWT + OTP (email-based) |
| AI | OpenAI API (Speech-to-Text, Translation, Summarization) |
| Payments | Razorpay |
| Notifications | Firebase Cloud Messaging |
| File Storage | Local/AWS S3 |
| Containerization | Docker + Docker Compose |
| API Docs | Swagger/OpenAPI |

## Project Structure

```
societycare/
├── backend/
│   ├── config/          # Database, Firebase, Swagger config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, error handling, file upload
│   ├── models/          # Sequelize models (10 tables)
│   ├── routes/          # Express routes with Swagger docs
│   ├── services/        # AI, email, notification services
│   ├── migrations/      # SQL schema migration
│   ├── seeders/         # Test data seeder
│   ├── uploads/         # File uploads directory
│   ├── server.js        # Express app entry point
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React context (Auth)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client (Axios)
│   │   └── App.js       # Router setup
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Database Schema (ER Diagram)

```
Users ──< FamilyMembers
Users ──< ServiceRequests ──< Assignments >── ServicePersonnel
Users ──< Payments
Users ──< Feedback >── ServiceRequests
Users ──< Visitors
Users ──< Notifications
Users ──< Announcements
MaintenanceFees (standalone config table)
```

**Tables:** Users, FamilyMembers, ServiceRequests, ServicePersonnel, Assignments, Payments, Announcements, Notifications, Feedbacks, Visitors, MaintenanceFees

## Quick Start

### Using Docker (Recommended)

```bash
# Clone and start all services
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
# API Docs: http://localhost:5000/api/docs
```

### Manual Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

#### Backend Setup

```bash
cd backend
cp .env.example .env    # Configure your environment variables
npm install
npm run dev             # Starts on http://localhost:5000
```

#### Frontend Setup

```bash
cd frontend
npm install
npm start               # Starts on http://localhost:3000
```

#### Database Setup

```bash
# Create PostgreSQL database
createdb societycare

# Run migrations (auto-sync in dev mode, or use SQL file)
psql -d societycare -f backend/migrations/001_create_schema.sql

# Seed test data
cd backend && node seeders/seed.js
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@societycare.com | Admin@123 |
| Resident | rajesh@example.com | Pass@123 |
| Staff | ramesh@example.com | Staff@123 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/verify-otp | Verify email OTP |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/profile | Update profile |

### Service Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/service-requests | Create request (with files) |
| GET | /api/service-requests/my | Get my requests |
| GET | /api/service-requests | Get all (admin) |
| PUT | /api/service-requests/:id/status | Update status |
| PUT | /api/service-requests/:id/confirm | Confirm service |
| POST | /api/service-requests/:id/feedback | Submit feedback |
| POST | /api/service-requests/emergency/sos | Emergency SOS |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Dashboard stats |
| POST | /api/admin/assign | Assign personnel |
| GET | /api/admin/residents | List residents |
| POST | /api/admin/personnel | Add staff |
| POST | /api/admin/announcements | Create announcement |
| POST | /api/admin/maintenance-fees | Set fee structure |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments/create-order | Create Razorpay order |
| POST | /api/payments/verify | Verify payment |
| GET | /api/payments/my | Payment history |
| POST | /api/payments/offline | Record offline payment |

### Visitors
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/visitors | Register visitor (QR) |
| PUT | /api/visitors/:id/check-in | Check-in |
| PUT | /api/visitors/:id/check-out | Check-out |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get notifications |
| PUT | /api/notifications/read-all | Mark all read |
| POST | /api/chatbot | AI chatbot |
| GET | /api/health | Health check |

## Environment Variables

See `backend/.env.example` for all configuration options including:
- Database connection
- JWT secret
- Razorpay API keys
- Firebase credentials
- SMTP email config
- AWS S3 config
- AI API keys

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  Express Backend  │────▶│   PostgreSQL    │
│  (Tailwind CSS) │     │  (REST API)       │     │   Database      │
└─────────────────┘     └──────┬───────────┘     └─────────────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              ┌──────────┐ ┌────────┐ ┌──────────┐
              │ AI APIs  │ │Firebase│ │ Razorpay │
              │(OpenAI)  │ │  FCM   │ │ Payment  │
              └──────────┘ └────────┘ └──────────┘
```

## Workflow

1. **Resident** registers/logs in → Dashboard
2. Creates **service request** (text/voice) → AI processes (translate, summarize, categorize)
3. **Admin** receives notification → Assigns **service personnel**
4. **Staff** accepts task → visits resident → marks complete with proof
5. **Resident** confirms service → provides feedback/rating
6. Monthly **maintenance fees** → automated reminders → online payment → receipt

## License

MIT
