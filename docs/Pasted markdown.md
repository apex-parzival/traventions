# TRAVENTIONS — Comprehensive Architecture Plan

**Version:** 1.0  
**Prepared:** March 2026  
**Tech Stack Decision:** Next.js (Frontend) + Node.js/NestJS (API) + PostgreSQL RDS + S3  
**Hosting Strategy:** Local dev (native) → Cloud (AWS)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack & Tooling](#2-tech-stack--tooling)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Infrastructure Design](#4-infrastructure-design)
5. [Database Schema (PostgreSQL RDS)](#5-database-schema-postgresql-rds)
6. [S3 Bucket Structure](#6-s3-bucket-structure)
7. [API Layer Design](#7-api-layer-design)
8. [Authentication & RBAC Architecture](#8-authentication--rbac-architecture)
9. [GDS Integration Layer](#9-gds-integration-layer)
10. [Wallet & Financial Engine](#10-wallet--financial-engine)
11. [Background Jobs Architecture](#11-background-jobs-architecture)
12. [Real-time & WebSocket Architecture](#12-real-time--websocket-architecture)
13. [Notification & Communication Services](#13-notification--communication-services)
14. [Caching Strategy (Redis)](#14-caching-strategy-redis)
15. [Third-party Integrations Map](#15-third-party-integrations-map)
16. [Security Architecture](#16-security-architecture)
17. [Local Development Setup](#17-local-development-setup)
18. [Cloud Deployment Architecture (Post-Development)](#18-cloud-deployment-architecture-post-development)
19. [Environment Configuration](#19-environment-configuration)
20. [Data Flow Diagrams](#20-data-flow-diagrams)

---

## 1. System Overview

Traventions is a **B2B travel management SaaS platform** that enables Travel Management Companies (TMCs) to search, book, and manage flights, hotels, and ground transfers on behalf of their corporate clients.

### Platform Characteristics

| Dimension | Detail |
|---|---|
| Type | B2B SaaS — Multi-tenant |
| Tenancy Model | TMC = Tenant; all data strictly scoped by `tmc_id` |
| Users | 4 roles: Super Admin Ops, Super Admin Finance, TMC Admin, TMC Agent |
| Core Services | Flights, Hotels, Cabs & Transfers |
| GDS Integrations | Amadeus, Sabre, Traventions Proprietary |
| Payment Gateway | Stripe (card + 3DS), Bank Transfer, Net Banking, Check |
| Wallet Model | Double-entry prepaid wallet + postpaid credit per TMC |
| Currency | USD default; 8 currencies supported |
| Platform | Web only (desktop + tablet, min 768px) |

### High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│           Next.js Web App (Desktop + Tablet)                     │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼─────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│              NestJS REST API + WebSocket Server                  │
│         RBAC Middleware | JWT Auth | Rate Limiting               │
└──────┬──────────┬─────────┬──────────┬──────────┬───────────────┘
       │          │         │          │          │
  ┌────▼───┐ ┌────▼───┐ ┌──▼─────┐ ┌──▼─────┐ ┌─▼──────────┐
  │ Auth   │ │Booking │ │Finance │ │Support │ │ Admin Ops  │
  │Service │ │Service │ │Service │ │Service │ │  Service   │
  └────┬───┘ └────┬───┘ └──┬─────┘ └──┬─────┘ └─┬──────────┘
       │          │         │          │          │
┌──────▼──────────▼─────────▼──────────▼──────────▼────────────────┐
│                     DATA LAYER                                    │
│   PostgreSQL RDS (Primary) │ Redis (Cache+Jobs) │ S3 (Storage)   │
└───────────────────────────────────────────────────────────────────┘
       │          │         │
  ┌────▼───┐ ┌────▼───┐ ┌──▼───────────┐
  │Amadeus │ │ Sabre  │ │ Traventions  │
  │  GDS   │ │  GDS   │ │ Proprietary  │
  └────────┘ └────────┘ └──────────────┘
```

---

## 2. Tech Stack & Tooling

### Frontend
| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14+ (App Router) | SSR for SEO, RSC for performance, already in repo |
| Language | TypeScript | Type safety, matches existing repo |
| Styling | Tailwind CSS + shadcn/ui | Already configured in repo (`components.json`) |
| State Management | Zustand (global) + React Query (server state) | Lightweight, excellent cache management |
| Forms | React Hook Form + Zod | Performance, schema-driven validation |
| Charts | Recharts or Chart.js | Reporting dashboards |
| Real-time | Socket.io Client | WebSocket for live dashboards, tracking |
| PDF Viewer | react-pdf | KYC document inline preview |
| Maps | Mapbox GL JS or Google Maps React | Hotel maps, cab GPS tracking |
| Date Handling | date-fns | Timezone-safe date operations |

### Backend
| Layer | Technology | Rationale |
|---|---|---|
| Runtime | Node.js 20 LTS | Long-term support, stable |
| Framework | NestJS | Modular, DI, decorators, built-in guards |
| Language | TypeScript | Consistency with frontend |
| ORM | Prisma | Type-safe queries, migration management, schema visualization |
| API Style | REST + WebSocket | REST for CRUD, WS for real-time events |
| Validation | class-validator + class-transformer | NestJS-native, request DTOs |
| Job Queue | BullMQ (Redis-backed) | Reliable, retries, delays, scheduled jobs |
| Logging | Pino + Winston | Structured JSON logging |
| Testing | Jest + Supertest | Unit + integration tests |

### Infrastructure
| Layer | Technology | Dev | Production |
|---|---|---|---|
| Database | PostgreSQL 15 | AWS RDS dev instance (shared) | AWS RDS PostgreSQL (Multi-AZ) |
| Cache | Redis 7 | Native local install | AWS ElastiCache Redis |
| Storage | AWS S3 | AWS S3 dev bucket (shared) | AWS S3 |
| Server | Node.js process | `npm run dev` natively | AWS ECS Fargate or EC2 |
| Reverse Proxy | — | None needed locally | AWS ALB (Application Load Balancer) |
| CDN | — | None needed locally | AWS CloudFront |
| Secrets | .env files | Local `.env.local` | AWS Secrets Manager |
| Monitoring | Console | Local | CloudWatch + Sentry + Datadog |

---

## 3. Monorepo Structure

```
traventions/                          ← Root (existing repo)
├── apps/
│   ├── web/                          ← Next.js frontend (move existing app/ here)
│   │   ├── app/
│   │   │   ├── (auth)/               ← Login, register, forgot-password
│   │   │   ├── (dashboard)/          ← All authenticated routes
│   │   │   │   ├── admin/            ← Super Admin screens (I*, J*)
│   │   │   │   ├── bookings/         ← My Bookings (G*)
│   │   │   │   ├── cabs/             ← Cab module (E*)
│   │   │   │   ├── clients/          ← Client management (L*)
│   │   │   │   ├── flights/          ← Flight module (C*)
│   │   │   │   ├── hotels/           ← Hotel module (D*)
│   │   │   │   ├── profile/          ← Profile & settings (M*)
│   │   │   │   ├── reports/          ← Reporting (N*)
│   │   │   │   ├── support/          ← Support ticketing (H*)
│   │   │   │   ├── team/             ← Team management (K*)
│   │   │   │   └── wallet/           ← Wallet & finance (F*)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/                   ← shadcn/ui primitives
│   │   │   ├── shared/               ← Global shared components
│   │   │   ├── flights/              ← Flight-specific components
│   │   │   ├── hotels/
│   │   │   ├── cabs/
│   │   │   ├── wallet/
│   │   │   ├── support/
│   │   │   └── admin/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api/                  ← API client (axios/fetch wrappers)
│   │   │   ├── store/                ← Zustand stores
│   │   │   └── utils/
│   │   └── public/
│   │
│   └── api/                          ← NestJS backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/
│       │   │   ├── decorators/       ← @Roles, @Public, @CurrentUser
│       │   │   ├── guards/           ← JwtAuthGuard, RolesGuard, TmcScopeGuard
│       │   │   ├── interceptors/     ← LoggingInterceptor, TransformInterceptor
│       │   │   ├── filters/          ← GlobalExceptionFilter
│       │   │   ├── pipes/            ← ValidationPipe
│       │   │   └── middleware/       ← RequestLogger
│       │   ├── modules/
│       │   │   ├── auth/             ← JWT, 2FA, sessions
│       │   │   ├── users/            ← User CRUD, invitations
│       │   │   ├── tmc/              ← TMC registration, management
│       │   │   ├── kyc/              ← KYC document handling
│       │   │   ├── flights/          ← Flight search, booking, modifications
│       │   │   ├── hotels/           ← Hotel search, booking, on-request flow
│       │   │   ├── cabs/             ← Cab search, booking, GPS tracking
│       │   │   ├── wallet/           ← Wallet engine, recharge flows
│       │   │   ├── invoices/         ← Invoice generation, management
│       │   │   ├── credit/           ← Credit management, extension requests
│       │   │   ├── support/          ← Support tickets, SLA engine
│       │   │   ├── notifications/    ← Email, SMS, WhatsApp dispatch
│       │   │   ├── reports/          ← Report generation, scheduling
│       │   │   ├── admin/            ← Super Admin operations & finance
│       │   │   ├── gds/              ← GDS adapter layer (Amadeus, Sabre)
│       │   │   ├── payments/         ← Stripe integration, webhooks
│       │   │   └── storage/          ← S3 file operations
│       │   ├── database/
│       │   │   └── prisma/
│       │   │       ├── schema.prisma ← Single Prisma schema
│       │   │       ├── migrations/
│       │   │       └── seeds/
│       │   └── config/               ← Environment configs per service
│       └── test/
│
├── packages/
│   └── shared/                       ← Shared types, constants, validators
│       ├── src/
│       │   ├── types/                ← Shared TypeScript interfaces
│       │   ├── constants/            ← Shared enums, config keys
│       │   └── validators/           ← Shared Zod schemas
│       └── package.json
│
├── infrastructure/
│   └── scripts/
│       ├── setup-dev.sh              ← One-time local setup script
│       └── seed-dev.sh               ← Dev database seeding
│
├── architecture-planning/            ← Existing docs (unchanged)
├── plans/                            ← Architecture plans
├── .env.example
├── .gitignore
├── package.json                      ← Root workspace package.json
├── turbo.json                        ← Turborepo config
└── tsconfig.base.json
```

---

## 4. Infrastructure Design

### 4.1 Local Development Stack

**No Docker.** Everything runs natively on the developer's machine. The team connects to shared AWS dev resources for database and storage — no local emulation.

**What runs locally (native):**
- **API server** — `npm run dev:api` (NestJS on port 3001)
- **Web app** — `npm run dev:web` (Next.js on port 3000)
- **Redis** — Installed natively; only dependency that needs a local install

**What runs on AWS (shared dev):**
- **PostgreSQL** — Shared AWS RDS dev instance (all developers use the same DB)
- **S3** — Shared `traventions-private-dev` and `traventions-public-assets-dev` buckets

**Install Redis natively:**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis
```

**Environment Variables for Local Dev:**
```
# .env.local
DATABASE_URL=postgresql://user:pass@<RDS-DEV-ENDPOINT>:5432/traventions_dev
REDIS_URL=redis://localhost:6379
AWS_S3_PRIVATE_BUCKET=traventions-private-dev
AWS_S3_PUBLIC_BUCKET=traventions-public-assets-dev
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<dev-key>
AWS_SECRET_ACCESS_KEY=<dev-secret>
JWT_PRIVATE_KEY=<RS256 private key PEM>
JWT_PUBLIC_KEY=<RS256 public key PEM>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
AMADEUS_API_KEY=<sandbox-key>
AMADEUS_API_SECRET=<sandbox-secret>
SABRE_API_KEY=<sandbox-key>
SENDGRID_API_KEY=SG.xxx
TWILIO_ACCOUNT_SID=ACxxx
```

### 4.2 AWS Infrastructure (Post-Development)

```
┌─────────────────── AWS Region (us-east-1) ─────────────────────┐
│                                                                  │
│  ┌─── VPC ──────────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │         PUBLIC SUBNETS (2 AZs)                      │  │   │
│  │  │  ┌────────────────────┐   ┌────────────────────┐    │  │   │
│  │  │  │  ALB (HTTPS:443)   │   │  NAT Gateway       │    │  │   │
│  │  │  │  + CloudFront CDN  │   │                    │    │  │   │
│  │  │  └────────────────────┘   └────────────────────┘    │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  │                          │                                 │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │         PRIVATE SUBNETS (2 AZs)                      │  │   │
│  │  │  ┌──────────────┐   ┌──────────────┐                │  │   │
│  │  │  │  ECS Fargate  │   │  ECS Fargate  │                │  │   │
│  │  │  │  API Service  │   │  Web Service  │                │  │   │
│  │  │  └──────────────┘   └──────────────┘                │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │         DATA SUBNETS (2 AZs)                         │  │   │
│  │  │  ┌──────────────────────┐  ┌──────────────────────┐  │  │   │
│  │  │  │  RDS PostgreSQL       │  │  ElastiCache Redis    │  │  │   │
│  │  │  │  Multi-AZ Primary     │  │  Cluster              │  │  │   │
│  │  │  │  + Read Replica       │  │                       │  │  │   │
│  │  │  └──────────────────────┘  └──────────────────────┘  │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │  S3 Buckets│  │  Secrets   │  │ CloudWatch │  │  Route53  │  │
│  │  (Private) │  │  Manager   │  │  + Alerts  │  │  DNS      │  │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.3 RDS Configuration

| Setting | Dev | Production |
|---|---|---|
| Instance | db.t3.medium | db.r6g.large |
| Storage | 50 GB gp3 | 200 GB gp3 (auto-scale) |
| Multi-AZ | No | Yes |
| Read Replicas | 0 | 1 (for reports/analytics) |
| Backup Retention | 7 days | 35 days |
| Maintenance | Auto | Scheduled maintenance window |
| Encryption | Yes | Yes (AES-256) |
| SSL | Required | Required |

---

## 5. Database Schema (PostgreSQL RDS)

The full Prisma schema covering all 14 modules. All tenant-scoped tables include `tmc_id` with foreign key enforced at DB level.

### 5.1 Enums

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ─────────────────────────────────────────────────────

enum UserRole {
  SUPER_ADMIN_OPS
  SUPER_ADMIN_FINANCE
  TMC_ADMIN
  TMC_AGENT
}

enum TmcStatus {
  PENDING_REVIEW          // Application submitted, awaiting KYC review
  PENDING_DOCS            // Ops requested additional documents
  PENDING_FINANCE_SETUP   // Ops approved; Finance needs to set credit
  ACTIVE                  // Fully operational
  BLOCKED                 // Blocked by Finance (payment issues)
  REJECTED                // Application rejected
  ARCHIVED                // Soft-deleted
}

enum KycDocStatus {
  PENDING
  VERIFIED
  REJECTED
}

enum BookingStatus {
  DRAFT
  PENDING_PAYMENT
  CONFIRMED
  ON_HOLD               // Flight/hotel hold with TTL
  ON_REQUEST            // Hotel pending supplier confirmation
  CANCELLED
  COMPLETED
  EXPIRED               // Hold TTL expired
  REFUND_IN_PROGRESS
  REFUNDED
}

enum PaymentMethod {
  WALLET
  CREDIT
  CARD
  NET_BANKING
  BANK_TRANSFER
  CHECK_DEPOSIT
}

enum TransactionType {
  BOOKING_DEBIT
  REFUND_CREDIT
  WALLET_RECHARGE
  CREDIT_DEBIT
  ADJUSTMENT
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REVERSED
}

enum InvoiceStatus {
  DRAFT
  ISSUED
  PAID
  PARTIALLY_PAID
  OVERDUE
  DISPUTED
  WRITTEN_OFF
}

enum SupportTicketStatus {
  NEW
  ASSIGNED
  IN_PROGRESS
  PENDING_CUSTOMER
  RESOLVED
  CLOSED
}

enum SupportTicketPriority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum SupportTicketCategory {
  BOOKING_ISSUE
  PAYMENT_PROBLEM
  REFUND_QUERY
  MODIFICATION_REQUEST
  TECHNICAL_ISSUE
  GENERAL_INQUIRY
}

enum HotelConfirmationType {
  INSTANT
  ON_REQUEST
}

enum CabTransferType {
  AIRPORT_TRANSFER
  RAILWAY_TRANSFER
  CITY_CAB
  INTER_CITY
}

enum FareType {
  NET
  COMMISSIONABLE
  CONSOLIDATOR
  NDC
}

enum CabinClass {
  ECONOMY
  PREMIUM_ECONOMY
  BUSINESS
  FIRST
}

enum ReportFrequency {
  DAILY
  WEEKLY
  MONTHLY
}

enum ReportFormat {
  PDF
  EXCEL
  CSV
}

enum NotificationChannel {
  EMAIL
  SMS
  WHATSAPP
  IN_APP
}

enum CreditExtensionStatus {
  PENDING
  APPROVED
  REJECTED
  AUTO_APPROVED
}

enum WalletRechargeStatus {
  PENDING_VERIFICATION    // Bank transfer / Check awaiting Finance approval
  APPROVED
  REJECTED
}

enum SupplierSettlementStatus {
  PENDING
  RECONCILED
  SETTLED
  DISPUTED
}
```

### 5.2 Authentication & User Tables

```prisma
// ─── MODULE A: AUTH & USERS ─────────────────────────────────────

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  passwordHash      String
  role              UserRole
  displayName       String
  phone             String?
  avatarUrl         String?
  jobTitle          String?
  timezone          String    @default("UTC")
  isActive          Boolean   @default(true)
  isTwoFactorEnabled Boolean   @default(false)
  twoFactorSecret   String?   // Encrypted TOTP secret
  backupCodes       String[]  // Hashed backup codes
  passwordChangedAt DateTime  @default(now())
  passwordExpiresAt DateTime?
  lastLoginAt       DateTime?
  lastLoginIp       String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  tmcId             String?   // Null for Super Admins
  tmc               Tmc?      @relation(fields: [tmcId], references: [id])
  sessions          Session[]
  loginAttempts     LoginAttempt[]
  invitationsSent   Invitation[]    @relation("InvitedBy")
  passwordHistory   PasswordHistory[]
  auditLogs         AuditLog[]
  bookingsCreated   FlightBooking[] @relation("BookedByAgent")
  hotelBookingsCreated HotelBooking[] @relation("BookedByAgent")
  cabBookingsCreated  CabBooking[]  @relation("BookedByAgent")
  supportTickets    SupportTicket[] @relation("CreatedByUser")
  assignedTickets   SupportTicket[] @relation("AssignedToAgent")
  ticketMessages    TicketMessage[]
  reportSchedules   ReportSchedule[]
  internalNotes     InternalNote[]

  @@index([email])
  @@index([tmcId])
  @@index([role])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash    String   @unique  // Store hash of JWT jti
  ipAddress    String?
  userAgent    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  revokedAt    DateTime?
  isRemembered Boolean  @default(false) // "Remember device" → 30-day session

  @@index([userId])
  @@index([tokenHash])
}

model LoginAttempt {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  email     String   // Track by email even if user not found
  ipAddress String
  success   Boolean
  reason    String?  // e.g., "invalid_password", "account_locked"
  createdAt DateTime @default(now())

  @@index([email])
  @@index([userId])
}

model PasswordHistory {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  passwordHash String
  createdAt    DateTime @default(now())

  @@index([userId])
}

model Invitation {
  id          String   @id @default(cuid())
  email       String
  role        UserRole @default(TMC_AGENT)
  tmcId       String
  tmc         Tmc      @relation(fields: [tmcId], references: [id])
  invitedById String
  invitedBy   User     @relation("InvitedBy", fields: [invitedById], references: [id])
  tokenHash   String   @unique
  expiresAt   DateTime // 72 hours
  acceptedAt  DateTime?
  declinedAt  DateTime?
  createdAt   DateTime @default(now())

  @@index([email])
  @@index([tmcId])
  @@index([tokenHash])
}
```

### 5.3 TMC & KYC Tables

```prisma
// ─── MODULE A/I: TMC MANAGEMENT ─────────────────────────────────

model Tmc {
  id                 String    @id @default(cuid())
  tmcCode            String    @unique // e.g., TMC-00042
  companyName        String
  companyType        String    // Travel Agency, Corporate, Consolidator, Tour Operator
  registrationNumber String
  iataNumber         String?
  iataVerified       Boolean   @default(false)
  taxId              String?
  gstNumber          String?   // India only
  vatNumber          String?   // EU only
  abn               String?   // Australia only
  website            String?
  industry           String?
  employeeCount      String?   // "25-50" range
  incorporatedAt     DateTime?
  country            String    // ISO 3166-1 alpha-2
  status             TmcStatus @default(PENDING_REVIEW)
  blockedReason      String?
  blockedAt          DateTime?
  blockedById        String?
  approvedAt         DateTime?
  approvedById       String?
  rejectedAt         DateTime?
  rejectedReason     String?
  creditLimit        Decimal   @default(0) @db.Decimal(15, 2)
  creditPeriodDays   Int       @default(30)
  creditUtilized     Decimal   @default(0) @db.Decimal(15, 2)
  walletBalance      Decimal   @default(0) @db.Decimal(15, 2)
  walletBlockedAmount Decimal  @default(0) @db.Decimal(15, 2)
  preferredCurrency  String    @default("USD")
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  // Contact / Address (Primary contact, registered during application)
  contactFirstName   String
  contactLastName    String
  contactEmail       String
  contactPhone       String
  contactJobTitle    String
  addressLine1       String
  addressLine2       String?
  city               String
  state              String
  postalCode         String
  addressCountry     String

  // Relations
  users              User[]
  invitations        Invitation[]
  kycDocuments       KycDocument[]
  kyc_config_country String        @default("OTHER") // For dynamic KYC requirements
  flightBookings     FlightBooking[]
  hotelBookings      HotelBooking[]
  cabBookings        CabBooking[]
  wallet             Wallet?
  invoices           Invoice[]
  creditExtensionRequests CreditExtensionRequest[]
  supportTickets     SupportTicket[]
  clients            Client[]
  supplierSettlements SupplierSettlement[]
  internalNotes      InternalNote[]
  walletRecharges    WalletRecharge[]
  auditLogs          AuditLog[]

  @@index([status])
  @@index([country])
  @@index([tmcCode])
}

model KycDocument {
  id            String       @id @default(cuid())
  tmcId         String
  tmc           Tmc          @relation(fields: [tmcId], references: [id])
  documentType  String       // "business_registration", "pan_card", "tax_id", etc.
  documentLabel String       // Human-readable label
  fileName      String
  s3Key         String       // S3 object key for retrieval
  s3Bucket      String
  fileSize      Int          // bytes
  mimeType      String
  status        KycDocStatus @default(PENDING)
  verifiedById  String?
  verifiedAt    DateTime?
  rejectedById  String?
  rejectedAt    DateTime?
  rejectionReason String?
  adminNotes    String?
  isRequired    Boolean      @default(true)
  uploadedAt    DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([tmcId])
  @@index([status])
}

model KycCountryConfig {
  id              String   @id @default(cuid())
  countryCode     String   @unique // ISO 3166-1 alpha-2
  countryName     String
  requiredDocTypes String[] // List of required document type strings
  optionalDocTypes String[]
  verificationNotes String?
  externalApiName  String?  // "ASIC", "GST_INDIA", "VIES_EU", "IRS_US"
  updatedById     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model InternalNote {
  id         String   @id @default(cuid())
  tmcId      String
  tmc        Tmc      @relation(fields: [tmcId], references: [id])
  authorId   String
  author     User     @relation(fields: [authorId], references: [id])
  content    String   @db.Text
  priority   String   @default("NORMAL") // NORMAL, IMPORTANT, CRITICAL
  isCritical Boolean  @default(false)     // Pin-to-top critical note (client feedback March 2026)
  isPinned   Boolean  @default(false)
  visibility String   @default("FINANCE_ONLY") // FINANCE_ONLY | ALL_ADMINS
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([tmcId])
  @@index([isCritical])
}

model AuditLog {
  id          String   @id @default(cuid())
  actorId     String?
  actor       User?    @relation(fields: [actorId], references: [id])
  actorEmail  String   // Denormalized for historical accuracy
  actorRole   String
  tmcId       String?
  tmc         Tmc?     @relation(fields: [tmcId], references: [id])
  action      String   // e.g., "TMC_APPROVED", "BOOKING_CANCELLED", "CREDIT_MODIFIED"
  entityType  String   // e.g., "Tmc", "FlightBooking", "User"
  entityId    String
  changes     Json?    // Before/after diff as JSON
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([tmcId])
  @@index([actorId])
  @@index([action])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

### 5.4 Passenger & Client Tables

```prisma
// ─── MODULE L: CLIENT & PASSENGER MANAGEMENT ────────────────────

model Client {
  id              String   @id @default(cuid())
  tmcId           String
  tmc             Tmc      @relation(fields: [tmcId], references: [id])
  companyName     String
  contactPerson   String
  email           String?
  phone           String?
  address         String?
  referenceNotes  String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  travellers      Traveller[]
  flightBookings  FlightBooking[]
  hotelBookings   HotelBooking[]
  cabBookings     CabBooking[]

  @@index([tmcId])
  @@index([companyName])
}

// Saved passenger/traveller profiles for auto-fill (additional-requirements.md)
model Traveller {
  id               String   @id @default(cuid())
  tmcId            String
  clientId         String?
  client           Client?  @relation(fields: [clientId], references: [id])
  title            String?  // Mr, Mrs, Ms, Dr, Prof
  firstName        String
  middleName       String?
  lastName         String
  email            String?
  phone            String?
  dateOfBirth      DateTime?
  gender           String?
  nationality      String?  // ISO 3166-1 alpha-2
  passportNumber   String?  // Encrypted at rest
  passportExpiry   DateTime?
  passportCountry  String?
  idType           String?  // passport, national_id, drivers_license
  idNumber         String?  // Encrypted
  // Extended travel preferences (client feedback March 2026)
  seatPreference   String?  // window, aisle, any
  mealPreference   String?  // VGML, KSML, etc.
  dietaryRequirements String[]
  frequentFlyerPrograms Json? // [{airline: "EK", number: "xxx"}]
  specialAssistance String[]
  employeeId       String?
  costCentre       String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([tmcId])
  @@index([email])
  @@index([lastName, firstName])
}
```

### 5.5 Flight Booking Tables

```prisma
// ─── MODULE C: FLIGHT BOOKINGS ──────────────────────────────────

model FlightBooking {
  id                  String        @id @default(cuid())
  bookingRef          String        @unique // TRV-FL-XXXXXXXX
  tmcId               String
  tmc                 Tmc           @relation(fields: [tmcId], references: [id])
  clientId            String?
  client              Client?       @relation(fields: [clientId], references: [id])
  agentId             String
  agent               User          @relation("BookedByAgent", fields: [agentId], references: [id])
  status              BookingStatus @default(PENDING_PAYMENT)
  gdsProvider         String        // amadeus, sabre, traventions
  pnr                 String?       // GDS PNR
  gdsBookingRef       String?       // GDS internal reference
  region              String        @default("GLOBAL") // GLOBAL, NORTH_AMERICA, MIDDLE_EAST
  fareType            FareType
  cabinClass          CabinClass
  tripType            String        // ONE_WAY, ROUND_TRIP, MULTI_CITY
  totalAmount         Decimal       @db.Decimal(15, 2)
  baseFare            Decimal       @db.Decimal(15, 2)
  taxes               Decimal       @db.Decimal(15, 2)
  ancillariesAmount   Decimal       @default(0) @db.Decimal(15, 2)
  commissionAmount    Decimal       @default(0) @db.Decimal(15, 2)
  commissionPercent   Decimal       @default(0) @db.Decimal(5, 2)
  processingFee       Decimal       @default(0) @db.Decimal(15, 2)
  currency            String        @default("USD")
  paymentMethod       PaymentMethod?
  paymentTransactionId String?
  holdTtl             DateTime?     // Hold booking expiry
  holdReminderSent24h Boolean       @default(false)
  holdReminderSent6h  Boolean       @default(false)
  holdReminderSent2h  Boolean       @default(false)
  cancelledAt         DateTime?
  cancellationReason  String?
  refundAmount        Decimal?      @db.Decimal(15, 2)
  refundMethod        String?
  refundStatus        String?       // pending, processing, completed
  refundTransactionId String?
  contactEmail        String
  contactPhone        String
  clientRef           String?       // Client PO/reference number
  gstDetails          Json?         // {companyName, gstNumber, address}
  eticketS3Key        String?       // S3 key for generated e-ticket PDF
  eticketGeneratedAt  DateTime?
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  segments            FlightSegment[]
  passengers          BookingPassenger[]
  ancillaries         FlightAncillary[]
  modifications       FlightModification[]
  documents           BookingDocument[]
  walletTransaction   WalletTransaction? @relation(fields: [walletTransactionId], references: [id])
  walletTransactionId String?     @unique

  @@index([tmcId])
  @@index([agentId])
  @@index([status])
  @@index([pnr])
  @@index([bookingRef])
  @@index([holdTtl])
  @@index([createdAt])
}

model FlightSegment {
  id                String        @id @default(cuid())
  bookingId         String
  booking           FlightBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  segmentOrder      Int
  flightNumber      String
  airline           String        // IATA airline code
  airlineName       String
  operatingAirline  String?       // For codeshares
  origin            String        // IATA airport code
  originCity        String
  originCountry     String
  originTerminal    String?
  destination       String
  destinationCity   String
  destinationCountry String
  destinationTerminal String?
  departureAt       DateTime
  arrivalAt         DateTime
  durationMinutes   Int
  aircraft          String?
  cabinClass        CabinClass
  fareBasis         String?
  isOvernight       Boolean       @default(false)
  baggage           Json?         // {checked: "23kg", cabin: "7kg", infant: "10kg"}

  @@index([bookingId])
}

model BookingPassenger {
  id                String        @id @default(cuid())
  flightBookingId   String?
  flightBooking     FlightBooking? @relation(fields: [flightBookingId], references: [id])
  hotelBookingId    String?
  hotelBooking      HotelBooking? @relation(fields: [hotelBookingId], references: [id])
  cabBookingId      String?
  cabBooking        CabBooking?   @relation(fields: [cabBookingId], references: [id])
  passengerType     String        // adult, child, infant
  title             String
  firstName         String
  middleName        String?
  lastName          String
  dateOfBirth       DateTime?
  gender            String?
  nationality       String?
  passportNumber    String?       // Encrypted
  passportExpiry    DateTime?
  passportCountry   String?
  frequentFlyerProgram String?
  frequentFlyerNumber  String?
  mealPreference    String?
  specialAssistance String[]
  ktn               String?       // Known Traveller Number (US routes)
  seatNumber        String?
  seatPrice         Decimal?      @db.Decimal(10, 2)
  saveTraveller     Boolean       @default(false)
  travellerId       String?       // Link to saved Traveller profile

  @@index([flightBookingId])
  @@index([hotelBookingId])
}

model FlightAncillary {
  id                String        @id @default(cuid())
  bookingId         String
  booking           FlightBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  passengerId       String?
  segmentId         String?
  type              String        // seat, meal, baggage, insurance, priority_boarding, lounge
  description       String
  code              String?       // SSR code
  amount            Decimal       @db.Decimal(10, 2)
  currency          String        @default("USD")

  @@index([bookingId])
}

model FlightModification {
  id                String        @id @default(cuid())
  bookingId         String
  booking           FlightBooking @relation(fields: [bookingId], references: [id])
  type              String        // date_change, name_correction
  status            String        // pending, completed, failed
  requestedById     String
  platformFee       Decimal?      @db.Decimal(10, 2)
  airlinePenalty    Decimal?      @db.Decimal(10, 2)
  fareDifference    Decimal?      @db.Decimal(10, 2)
  totalCharge       Decimal?      @db.Decimal(10, 2)
  details           Json?         // Old values, new values
  gdsConfirmation   String?
  createdAt         DateTime      @default(now())
  completedAt       DateTime?

  @@index([bookingId])
}
```

### 5.6 Hotel Booking Tables

```prisma
// ─── MODULE D: HOTEL BOOKINGS ───────────────────────────────────

model HotelBooking {
  id                  String                @id @default(cuid())
  bookingRef          String                @unique // TRV-HT-XXXXXXXX
  tmcId               String
  tmc                 Tmc                   @relation(fields: [tmcId], references: [id])
  clientId            String?
  client              Client?               @relation(fields: [clientId], references: [id])
  agentId             String
  agent               User                  @relation("BookedByAgent", fields: [agentId], references: [id])
  status              BookingStatus         @default(PENDING_PAYMENT)
  confirmationType    HotelConfirmationType @default(INSTANT)
  hotelId             String
  hotelName           String
  hotelChain          String?
  hotelAddress        String
  hotelCity           String
  hotelCountry        String
  hotelStarRating     Int?
  supplierHotelId     String                // Supplier's hotel identifier
  supplierBookingRef  String?               // Supplier's booking reference
  hcn                 String?               // Hotel Confirmation Number (MANDATORY per BRD)
  hcnReceivedAt       DateTime?
  voucherS3Key        String?               // S3 key — only generated after HCN received
  voucherGeneratedAt  DateTime?
  checkInDate         DateTime
  checkOutDate        DateTime
  nights              Int
  roomCount           Int
  nationality         String                // Guest nationality affects pricing
  totalAmount         Decimal               @db.Decimal(15, 2)
  baseFare            Decimal               @db.Decimal(15, 2)
  taxes               Decimal               @db.Decimal(15, 2)
  cityTaxNote         String?               // "AED 10 per room per night payable at hotel"
  commissionAmount    Decimal               @default(0) @db.Decimal(15, 2)
  commissionPercent   Decimal               @default(0) @db.Decimal(5, 2)
  paymentMethod       PaymentMethod?
  paymentHeld         Boolean               @default(false) // On-request: payment held
  paymentTransactionId String?
  cancelledAt         DateTime?
  cancellationReason  String?
  refundAmount        Decimal?              @db.Decimal(15, 2)
  refundStatus        String?
  clientRef           String?
  contactEmail        String
  contactPhone        String
  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt

  rooms               HotelRoomBooking[]
  passengers          BookingPassenger[]
  modifications       HotelModification[]
  documents           BookingDocument[]
  walletTransactionId String?     @unique

  @@index([tmcId])
  @@index([agentId])
  @@index([status])
  @@index([bookingRef])
  @@index([hcn])
  @@index([checkInDate])
}

model HotelRoomBooking {
  id                  String       @id @default(cuid())
  hotelBookingId      String
  hotelBooking        HotelBooking @relation(fields: [hotelBookingId], references: [id], onDelete: Cascade)
  roomNumber          Int          // Room 1, 2, 3...
  roomType            String
  roomName            String
  bedConfiguration    String?
  maxOccupancy        Int?
  ratePlan            String       // room_only, bed_breakfast, half_board, full_board
  boardBasis          String?
  pricePerNight       Decimal      @db.Decimal(12, 2)
  totalPrice          Decimal      @db.Decimal(12, 2)
  cancellationPolicy  Json?        // {type, description, deadlines}
  specialRequests     Json?        // All special request fields from D5
  guestNames          Json         // [{title, firstName, lastName}]

  @@index([hotelBookingId])
}

model HotelModification {
  id              String       @id @default(cuid())
  bookingId       String
  booking         HotelBooking @relation(fields: [bookingId], references: [id])
  type            String       // date_change, room_change, guest_update
  status          String
  requestedById   String
  details         Json?
  priceDifference Decimal?     @db.Decimal(10, 2)
  supplierConfirmation String?
  createdAt       DateTime     @default(now())
  completedAt     DateTime?

  @@index([bookingId])
}
```

### 5.7 Cab Booking Tables

```prisma
// ─── MODULE E: CAB BOOKINGS ──────────────────────────────────────

model CabBooking {
  id                  String         @id @default(cuid())
  bookingRef          String         @unique // TRV-CB-XXXXXXXX
  tmcId               String
  tmc                 Tmc            @relation(fields: [tmcId], references: [id])
  clientId            String?
  client              Client?        @relation(fields: [clientId], references: [id])
  agentId             String
  agent               User           @relation("BookedByAgent", fields: [agentId], references: [id])
  status              BookingStatus  @default(CONFIRMED)
  transferType        CabTransferType
  supplierBookingRef  String?
  supplierName        String
  vehicleType         String         // sedan, suv, luxury_sedan, van
  vehicleExample      String?        // "Toyota Camry or similar"
  passengerCount      Int
  luggageCount        Int            @default(0)
  pickupAddress       String
  pickupLat           Decimal?       @db.Decimal(10, 8)
  pickupLng           Decimal?       @db.Decimal(11, 8)
  dropAddress         String
  dropLat             Decimal?       @db.Decimal(10, 8)
  dropLng             Decimal?       @db.Decimal(11, 8)
  additionalStops     Json?          // [{address, lat, lng}]
  pickupAt            DateTime
  estimatedDurationMin Int?
  estimatedDistanceKm  Decimal?      @db.Decimal(10, 2)
  finalDistanceKm     Decimal?       @db.Decimal(10, 2) // Post-trip for inter-city
  flightNumber        String?        // For airport transfers
  flightTrackingEnabled Boolean      @default(false)
  driverName          String?
  driverPhone         String?
  vehiclePlate        String?
  driverAssignedAt    DateTime?
  tripStartedAt       DateTime?
  tripCompletedAt     DateTime?
  baseFare            Decimal        @db.Decimal(12, 2)
  tollsAndFees        Decimal        @default(0) @db.Decimal(10, 2)
  tax                 Decimal        @default(0) @db.Decimal(10, 2)
  addonsAmount        Decimal        @default(0) @db.Decimal(10, 2)
  totalAmount         Decimal        @db.Decimal(15, 2)
  finalAmount         Decimal?       @db.Decimal(15, 2) // Adjusted post-trip (inter-city)
  commissionAmount    Decimal        @default(0) @db.Decimal(15, 2)
  commissionPercent   Decimal        @default(0) @db.Decimal(5, 2)
  paymentMethod       PaymentMethod?
  paymentTransactionId String?
  pickupInstructions  String?
  dropoffInstructions String?
  driverNotes         String?
  contactEmail        String
  contactPhone        String
  cancelledAt         DateTime?
  cancellationReason  String?
  cancellationFeePercent Decimal?    @db.Decimal(5, 2)
  refundAmount        Decimal?       @db.Decimal(15, 2)
  refundStatus        String?
  voucherS3Key        String?
  clientRef           String?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  addons              CabAddon[]
  passengers          BookingPassenger[]
  documents           BookingDocument[]
  walletTransactionId String?     @unique

  @@index([tmcId])
  @@index([agentId])
  @@index([status])
  @@index([bookingRef])
  @@index([pickupAt])
}

model CabAddon {
  id         String     @id @default(cuid())
  bookingId  String
  booking    CabBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  type       String     // wifi, child_seat, wheelchair, meet_greet, extra_stop, pet, privacy, refreshments
  description String
  price      Decimal    @db.Decimal(10, 2)
  metadata   Json?      // Child age/weight for child_seat, stop address for extra_stop

  @@index([bookingId])
}

model BookingDocument {
  id                String        @id @default(cuid())
  flightBookingId   String?
  flightBooking     FlightBooking? @relation(fields: [flightBookingId], references: [id])
  hotelBookingId    String?
  hotelBooking      HotelBooking? @relation(fields: [hotelBookingId], references: [id])
  cabBookingId      String?
  cabBooking        CabBooking?   @relation(fields: [cabBookingId], references: [id])
  type              String        // eticket, voucher, receipt, invoice
  fileName          String
  s3Key             String
  s3Bucket          String
  generatedAt       DateTime      @default(now())
  expiresAt         DateTime?     // For pre-signed URLs

  @@index([flightBookingId])
  @@index([hotelBookingId])
  @@index([cabBookingId])
}
```

### 5.8 Wallet & Financial Tables

```prisma
// ─── MODULE F/J: WALLET & FINANCIAL SYSTEM ──────────────────────

model Wallet {
  id             String   @id @default(cuid())
  tmcId          String   @unique
  tmc            Tmc      @relation(fields: [tmcId], references: [id])
  balance        Decimal  @default(0) @db.Decimal(15, 2)
  blockedAmount  Decimal  @default(0) @db.Decimal(15, 2)
  currency       String   @default("USD")
  isBlocked      Boolean  @default(false)
  blockedReason  String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  transactions   WalletTransaction[]
  recharges      WalletRecharge[]

  @@index([tmcId])
}

model WalletTransaction {
  id                String            @id @default(cuid())
  walletId          String
  wallet            Wallet            @relation(fields: [walletId], references: [id])
  tmcId             String
  type              TransactionType
  status            TransactionStatus @default(COMPLETED)
  amount            Decimal           @db.Decimal(15, 2)
  currency          String            @default("USD")
  balanceBefore     Decimal           @db.Decimal(15, 2)
  balanceAfter      Decimal           @db.Decimal(15, 2)
  description       String
  referenceId       String?           // Booking ID, Recharge ID, etc.
  referenceType     String?           // FlightBooking, WalletRecharge, etc.
  paymentMethod     PaymentMethod?
  externalTxnId     String?           // Stripe charge ID, bank ref, etc.
  idempotencyKey    String?           @unique // Prevent double processing
  reversedTxnId     String?           // Link to original if this is a reversal
  flightBooking     FlightBooking?
  createdAt         DateTime          @default(now())

  @@index([walletId])
  @@index([tmcId])
  @@index([type])
  @@index([status])
  @@index([referenceId])
  @@index([createdAt])
}

model WalletRecharge {
  id                 String              @id @default(cuid())
  rechargeRef        String              @unique // BT-YYYY-MM-DD-XXXX
  tmcId              String
  tmc                Tmc                 @relation(fields: [tmcId], references: [id])
  walletId           String
  wallet             Wallet              @relation(fields: [walletId], references: [id])
  requestedById      String              // TMC Admin who initiated
  amount             Decimal             @db.Decimal(15, 2)
  currency           String              @default("USD")
  method             PaymentMethod
  status             WalletRechargeStatus @default(PENDING_VERIFICATION)
  processingFeePercent Decimal?          @db.Decimal(5, 2)
  processingFeeAmount  Decimal?          @db.Decimal(10, 2)
  // Bank Transfer specific
  bankReferenceCode  String?             // System-generated reference for TMC to include in transfer
  receiptS3Key       String?             // Uploaded payment proof
  // Card specific
  stripePaymentIntentId String?
  stripeChargeId     String?
  // Check specific
  checkNumber        String?
  bankName           String?
  // Verification
  verifiedById       String?
  verifiedAt         DateTime?
  rejectedById       String?
  rejectedAt         DateTime?
  rejectionReason    String?
  creditedAt         DateTime?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  walletTransaction  WalletTransaction?

  @@index([tmcId])
  @@index([status])
  @@index([rechargeRef])
}

model CreditExtensionRequest {
  id                String                @id @default(cuid())
  requestRef        String                @unique
  tmcId             String
  tmc               Tmc                   @relation(fields: [tmcId], references: [id])
  requestedById     String
  currentLimit      Decimal               @db.Decimal(15, 2)
  requestedLimit    Decimal               @db.Decimal(15, 2)
  justification     String                @db.Text
  supportingDocS3Keys String[]
  status            CreditExtensionStatus @default(PENDING)
  reviewedById      String?
  reviewedAt        DateTime?
  approvedLimit     Decimal?              @db.Decimal(15, 2) // May differ from requested
  reviewNote        String?
  isAutoApproved    Boolean               @default(false) // BR-033: 2x if 100% on-time history
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt

  @@index([tmcId])
  @@index([status])
}

model Invoice {
  id              String        @id @default(cuid())
  invoiceNumber   String        @unique  // INV-YYYY-XXXX
  tmcId           String
  tmc             Tmc           @relation(fields: [tmcId], references: [id])
  templateOwner   String        @default("TRAVENTIONS") // TRAVENTIONS | TMC (dual template management - client feedback)
  invoiceDate     DateTime
  dueDate         DateTime
  creditPeriodDays Int
  status          InvoiceStatus @default(ISSUED)
  subtotal        Decimal       @db.Decimal(15, 2)
  taxAmount       Decimal       @default(0) @db.Decimal(15, 2)
  taxRate         Decimal       @default(0) @db.Decimal(5, 2)
  totalAmount     Decimal       @db.Decimal(15, 2)
  paidAmount      Decimal       @default(0) @db.Decimal(15, 2)
  currency        String        @default("USD")
  pdfS3Key        String?
  notes           String?
  overdueReminderCount Int      @default(0)
  lastReminderSentAt DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  lineItems       InvoiceLineItem[]
  payments        InvoicePayment[]

  @@index([tmcId])
  @@index([status])
  @@index([dueDate])
}

model InvoiceLineItem {
  id                String  @id @default(cuid())
  invoiceId         String
  invoice           Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description       String
  bookingRef        String?
  serviceType       String? // flight, hotel, cab
  quantity          Int     @default(1)
  unitPrice         Decimal @db.Decimal(12, 2)
  totalPrice        Decimal @db.Decimal(12, 2)
  commissionAmount  Decimal @default(0) @db.Decimal(10, 2)

  @@index([invoiceId])
}

model InvoicePayment {
  id              String   @id @default(cuid())
  invoiceId       String
  invoice         Invoice  @relation(fields: [invoiceId], references: [id])
  recordedById    String
  amount          Decimal  @db.Decimal(15, 2)
  currency        String   @default("USD")
  paymentDate     DateTime
  method          String   // wire_transfer, bank_transfer, credit_card, check, adjustment
  transactionRef  String?
  receiptS3Key    String?
  notes           String?
  allocations     Json?    // [{invoiceId, amount}] for partial payments
  createdAt       DateTime @default(now())

  @@index([invoiceId])
}

model SupplierSettlement {
  id              String                   @id @default(cuid())
  settlementRef   String                   @unique
  tmcId           String?
  tmc             Tmc?                     @relation(fields: [tmcId], references: [id])
  supplierName    String                   // Amadeus, Sabre, HotelBeds, iWay
  supplierType    String                   // flight, hotel, cab
  periodStart     DateTime
  periodEnd       DateTime
  bookingCount    Int
  grossAmount     Decimal                  @db.Decimal(15, 2)
  commissionTotal Decimal                  @db.Decimal(15, 2)
  netPayable      Decimal                  @db.Decimal(15, 2)
  currency        String                   @default("USD")
  status          SupplierSettlementStatus @default(PENDING)
  invoiceRef      String?                  // Supplier's invoice reference
  reconciliationNotes String?
  paymentProofS3Key String?
  settledAt       DateTime?
  settledById     String?
  createdAt       DateTime                 @default(now())
  updatedAt       DateTime                 @updatedAt

  @@index([status])
  @@index([supplierName])
}
```

### 5.9 Support & Ticketing Tables

```prisma
// ─── MODULE H: SUPPORT & TICKETING ──────────────────────────────

model SupportTicket {
  id                String                @id @default(cuid())
  ticketRef         String                @unique // TKT-XXXXXX
  tmcId             String
  tmc               Tmc                   @relation(fields: [tmcId], references: [id])
  createdById       String
  createdBy         User                  @relation("CreatedByUser", fields: [createdById], references: [id])
  assignedToId      String?
  assignedTo        User?                 @relation("AssignedToAgent", fields: [assignedToId], references: [id])
  status            SupportTicketStatus   @default(NEW)
  priority          SupportTicketPriority @default(MEDIUM)
  category          SupportTicketCategory
  subject           String
  description       String                @db.Text
  // Linked booking (any service type)
  linkedFlightBookingId String?
  linkedHotelBookingId  String?
  linkedCabBookingId    String?
  // Contact preferences
  preferredContact  String                @default("EMAIL") // EMAIL, PHONE, WHATSAPP, PLATFORM
  alternateContact  String?
  // SLA tracking
  slaDeadline       DateTime
  slaBreached       Boolean               @default(false)
  slaBreachedAt     DateTime?
  firstResponseAt   DateTime?
  // Escalation
  isEscalated       Boolean               @default(false)
  escalatedAt       DateTime?
  escalatedToId     String?
  escalationReason  String?
  autoEscalated     Boolean               @default(false)
  // Resolution
  resolvedAt        DateTime?
  autoCloseAt       DateTime?             // 48h after resolution if no response (BR-076)
  closedAt          DateTime?
  // AI features
  aiCategoryConfidence Decimal?           @db.Decimal(5, 4) // AI categorization confidence score
  isDuplicate       Boolean               @default(false)
  duplicateOfId     String?
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt

  messages          TicketMessage[]
  attachments       TicketAttachment[]
  escalationHistory TicketEscalation[]

  @@index([tmcId])
  @@index([status])
  @@index([priority])
  @@index([assignedToId])
  @@index([createdById])
  @@index([slaDeadline])
  @@index([ticketRef])
}

model TicketMessage {
  id          String        @id @default(cuid())
  ticketId    String
  ticket      SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
  content     String        @db.Text
  isInternal  Boolean       @default(false) // Internal notes not visible to customer
  isSystem    Boolean       @default(false) // System-generated messages (auto-escalation, etc.)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  attachments TicketAttachment[]

  @@index([ticketId])
}

model TicketAttachment {
  id        String         @id @default(cuid())
  ticketId  String
  ticket    SupportTicket  @relation(fields: [ticketId], references: [id])
  messageId String?
  message   TicketMessage? @relation(fields: [messageId], references: [id])
  fileName  String
  s3Key     String
  s3Bucket  String
  mimeType  String
  fileSize  Int
  createdAt DateTime       @default(now())

  @@index([ticketId])
}

model TicketEscalation {
  id              String        @id @default(cuid())
  ticketId        String
  ticket          SupportTicket @relation(fields: [ticketId], references: [id])
  escalatedById   String
  reason          String
  escalatedToRole String        // TMC_ADMIN, SUPER_ADMIN_OPS
  createdAt       DateTime      @default(now())

  @@index([ticketId])
}

model SlaConfiguration {
  id                String @id @default(cuid())
  priority          SupportTicketPriority @unique
  responseTimeHours Int    // BR-070 through BR-073
  resolutionTimeHours Int
  updatedById       String?
  updatedAt         DateTime @updatedAt
}
```

### 5.10 Reporting Tables

```prisma
// ─── MODULE N: REPORTING ─────────────────────────────────────────

model ReportSchedule {
  id              String          @id @default(cuid())
  tmcId           String?         // Null = platform-wide (Super Admin)
  createdById     String
  createdBy       User            @relation(fields: [createdById], references: [id])
  reportType      String          // booking, revenue, commission, support
  name            String
  frequency       ReportFrequency
  dayOfWeek       Int?            // 0-6 for weekly
  dayOfMonth      Int?            // 1-31 for monthly
  deliveryHour    Int             @default(9) // Hour of day (0-23)
  timezone        String          @default("UTC")
  formats         ReportFormat[]
  recipientEmails String[]
  filters         Json?           // {dateRange, serviceType, agentId, etc.}
  isActive        Boolean         @default(true)
  lastRunAt       DateTime?
  nextRunAt       DateTime?
  failureCount    Int             @default(0)
  isSuspended     Boolean         @default(false)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  executions      ReportExecution[]

  @@index([tmcId])
  @@index([nextRunAt])
  @@index([isActive])
}

model ReportExecution {
  id              String        @id @default(cuid())
  scheduleId      String?
  schedule        ReportSchedule? @relation(fields: [scheduleId], references: [id])
  tmcId           String?
  requestedById   String?
  reportType      String
  status          String        @default("PENDING") // PENDING, PROCESSING, COMPLETED, FAILED
  format          ReportFormat
  filters         Json?
  rowCount        Int?
  fileSizeBytes   Int?
  s3Key           String?
  errorMessage    String?
  startedAt       DateTime      @default(now())
  completedAt     DateTime?
  emailedAt       DateTime?

  @@index([scheduleId])
  @@index([tmcId])
  @@index([status])
}
```

### 5.11 Platform Configuration Tables

```prisma
// ─── MODULE I8: PLATFORM CONFIGURATION ──────────────────────────

model PlatformConfig {
  id          String   @id @default(cuid())
  section     String   // gds_keys, feature_toggles, commission_rates, etc.
  key         String
  value       String   @db.Text // JSON or plain value
  description String?
  updatedById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([section, key])
  @@index([section])
}

model EmailTemplate {
  id          String   @id @default(cuid())
  name        String   @unique
  subject     String
  bodyHtml    String   @db.Text
  bodyText    String?  @db.Text
  variables   String[] // List of variable names used
  owner       String   @default("TRAVENTIONS") // TRAVENTIONS | TMC (dual ownership - client feedback)
  tmcId       String?  // If TMC-owned template override
  isActive    Boolean  @default(true)
  updatedById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([name])
  @@index([owner])
}

model NotificationPreference {
  id        String   @id @default(cuid())
  userId    String   @unique
  email     Json     @default("{}") // {bookingConfirmed: true, walletLow: true, ...}
  sms       Json     @default("{}")
  whatsapp  Json     @default("{}")
  inApp     Json     @default("{}")
  updatedAt DateTime @updatedAt
}

model ExchangeRate {
  id         String   @id @default(cuid())
  fromCurrency String  // USD
  toCurrency   String
  rate         Decimal @db.Decimal(18, 8)
  source       String  @default("openexchangerates")
  fetchedAt    DateTime @default(now())

  @@index([fromCurrency, toCurrency])
  @@index([fetchedAt])
}
```

---

## 6. S3 Bucket Structure

### 6.1 Bucket Organization

**Two primary S3 buckets** (separate for security and lifecycle policies):

#### Bucket 1: `traventions-private-{env}` — Sensitive Documents
All objects require IAM auth; no public access; server-side encryption (AES-256).

```
traventions-private-{env}/
│
├── kyc/                              # KYC Documents (7-year retention)
│   └── {tmcId}/
│       └── {documentId}/
│           └── {original-filename}.pdf
│
├── etickets/                         # Generated E-ticket PDFs
│   └── {tmcId}/
│       └── {bookingRef}/
│           └── eticket-{timestamp}.pdf
│
├── hotel-vouchers/                   # Hotel voucher PDFs
│   └── {tmcId}/
│       └── {bookingRef}/
│           └── voucher-{timestamp}.pdf
│
├── cab-vouchers/                     # Cab voucher PDFs
│   └── {tmcId}/
│       └── {bookingRef}/
│           └── voucher-{timestamp}.pdf
│
├── invoices/                         # Invoice PDFs
│   └── {tmcId}/
│       └── {invoiceNumber}/
│           └── invoice-{invoiceNumber}.pdf
│
├── receipts/                         # Payment receipts
│   └── {tmcId}/
│       └── {transactionId}/
│           └── receipt-{timestamp}.pdf
│
├── wallet-recharge-proofs/           # Bank transfer proofs
│   └── {tmcId}/
│       └── {rechargeRef}/
│           └── proof-{timestamp}.{ext}
│
├── supplier-settlements/             # Settlement payment proofs
│   └── {supplierName}/
│       └── {settlementRef}/
│           └── payment-proof.pdf
│
├── support-attachments/              # Support ticket attachments
│   └── {tmcId}/
│       └── {ticketRef}/
│           └── {messageId}/
│               └── {filename}.{ext}
│
├── reports/                          # Generated report files
│   └── {tmcId}/
│       └── {year}/{month}/
│           └── {reportType}-{timestamp}.{pdf|xlsx|csv}
│
└── avatars/                          # User profile photos
    └── {userId}/
        └── avatar-{timestamp}.{jpg|png}
```

#### Bucket 2: `traventions-public-assets-{env}` — Static Assets
CloudFront distribution; public read on specific prefixes.

```
traventions-public-assets-{env}/
│
├── email-assets/                     # Images used in HTML emails
│   ├── logo.png
│   └── icons/
│
└── platform-assets/                  # Platform static files
    ├── airline-logos/
    │   └── {IATA_CODE}.png
    └── hotel-logos/
        └── {hotelChain}.png
```

### 6.2 S3 Lifecycle Policies

| Path | Transition to IA | Transition to Glacier | Expiration |
|---|---|---|---|
| `kyc/` | 90 days | 365 days | Never (7-year legal hold) |
| `etickets/` | 30 days | 180 days | 7 years |
| `invoices/` | 90 days | 365 days | 7 years |
| `reports/` | 30 days | 90 days | 1 year |
| `support-attachments/` | 60 days | 180 days | 3 years |
| `wallet-recharge-proofs/` | 60 days | 180 days | 7 years |

### 6.3 S3 Access Patterns

```typescript
// S3 Access via NestJS StorageService
class StorageService {
  // Upload KYC document — TMC self-service during registration
  uploadKycDocument(tmcId: string, documentId: string, file: Buffer, mimeType: string): Promise<string>

  // Generate pre-signed URL for KYC doc download — Admin only
  getKycDocumentUrl(s3Key: string, expirySeconds: number = 3600): Promise<string>

  // Upload generated e-ticket PDF
  uploadEticket(tmcId: string, bookingRef: string, pdf: Buffer): Promise<string>

  // Generate pre-signed download URL for e-ticket
  getDownloadUrl(s3Key: string, filename: string, expirySeconds: number = 86400): Promise<string>

  // Upload wallet recharge proof (TMC uploads receipt)
  uploadRechargeProof(tmcId: string, rechargeRef: string, file: Buffer, mimeType: string): Promise<string>
}
```

---

## 7. API Layer Design

### 7.1 API Structure Overview

**Base URL:** `https://api.traventions.com/v1` (prod) | `http://localhost:3001/v1` (dev)

All endpoints return:
```json
{
  "success": true,
  "data": {...},
  "meta": { "pagination": {...}, "timestamp": "..." }
}
```

Errors:
```json
{
  "success": false,
  "error": { "code": "TMC_BLOCKED", "message": "...", "details": [...] },
  "statusCode": 403
}
```

### 7.2 Complete API Endpoint Map

#### Auth Module (`/v1/auth`)
```
POST   /auth/login                          # JWT + role-based redirect
POST   /auth/logout                         # Revoke session token
POST   /auth/refresh                        # Refresh access token
POST   /auth/forgot-password                # Send reset email
POST   /auth/reset-password                 # Validate token + set new password
POST   /auth/setup-2fa                      # Generate TOTP secret + QR code
POST   /auth/verify-2fa                     # Verify TOTP code
POST   /auth/disable-2fa                    # Disable 2FA (with re-auth)
POST   /auth/accept-invitation              # Accept invite token + set password
POST   /auth/unlock-account                 # Admin manual unlock
```

#### TMC Registration & Management (`/v1/tmc`)
```
POST   /tmc/register/step-1                 # Company details
POST   /tmc/register/step-2                 # KYC document upload
POST   /tmc/register/step-3                 # Admin credentials
POST   /tmc/register/step-4                 # Review & submit
GET    /tmc/kyc-config?country={code}       # Dynamic KYC requirements by country
GET    /tmc/registration/:appId/status      # Application status
```

#### Admin Operations (`/v1/admin/ops`) — SA-Ops only
```
GET    /admin/ops/tmc-applications          # Queue with filters
GET    /admin/ops/tmc-applications/:id      # Full application detail
PUT    /admin/ops/tmc-applications/:id/approve
PUT    /admin/ops/tmc-applications/:id/reject
PUT    /admin/ops/tmc-applications/:id/request-docs
GET    /admin/ops/tmcs                      # All active TMCs
GET    /admin/ops/tmcs/:tmcId               # TMC detail
POST   /admin/ops/tmcs/:tmcId/notes         # Add internal note
PUT    /admin/ops/tmcs/:tmcId/notes/:noteId # Update note
GET    /admin/ops/platform-config           # All config sections
PUT    /admin/ops/platform-config/:section  # Update config section
GET    /admin/ops/platform-config/kyc-country # All KYC country configs
PUT    /admin/ops/platform-config/kyc-country/:countryCode
GET    /admin/ops/system-health             # Real-time health metrics
GET    /admin/ops/audit-logs                # Audit trail with filters
```

#### Admin Finance (`/v1/admin/finance`) — SA-Finance only
```
GET    /admin/finance/tmc-financials        # All TMCs financial overview
GET    /admin/finance/tmc-financials/:tmcId # Single TMC financial detail
PUT    /admin/finance/tmc-financials/:tmcId/credit   # Set/modify credit limit
POST   /admin/finance/tmc-financials/:tmcId/block
POST   /admin/finance/tmc-financials/:tmcId/unblock
POST   /admin/finance/tmc-financials/:tmcId/send-reminder
GET    /admin/finance/wallet-recharges      # Pending verification queue
PUT    /admin/finance/wallet-recharges/:id/approve
PUT    /admin/finance/wallet-recharges/:id/reject
GET    /admin/finance/credit-extensions     # Pending extension requests
PUT    /admin/finance/credit-extensions/:id/approve
PUT    /admin/finance/credit-extensions/:id/reject
GET    /admin/finance/overdue               # Overdue payments
POST   /admin/finance/overdue/:tmcId/record-payment
GET    /admin/finance/supplier-settlements  # Settlements list
POST   /admin/finance/supplier-settlements/:id/settle
GET    /admin/finance/invoices              # All invoices (cross-TMC)
GET    /admin/finance/reports               # Financial reports
```

#### Flights (`/v1/flights`)
```
GET    /flights/airports/search?q={query}
POST   /flights/search                      # Multi-GDS search
POST   /flights/flexible-search             # ±7 day price calendar
GET    /flights/fare-rules/:offerId
POST   /flights/booking                     # Create booking (4-step)
GET    /flights/booking/:id
POST   /flights/booking/:id/hold
PUT    /flights/booking/:id/complete-hold   # Pay for held booking
POST   /flights/booking/:id/cancel
PUT    /flights/booking/:id/change-date
PUT    /flights/booking/:id/correct-name
GET    /flights/booking/:id/eticket         # Download PDF (pre-signed URL)
GET    /flights/booking/:id/refund-status
```

#### Hotels (`/v1/hotels`)
```
GET    /hotels/search?q={query}&...         # 5 search types
GET    /hotels/:hotelId
GET    /hotels/:hotelId/rooms
POST   /hotels/booking                      # Create booking
GET    /hotels/booking/:id
GET    /hotels/booking/:id/voucher          # Blocked until HCN received
POST   /hotels/booking/:id/cancel
PUT    /hotels/booking/:id/modify
GET    /hotels/booking/:id/refund-status
POST   /hotels/booking/:id/hcn             # Webhook/manual: set HCN
GET    /geocoding/search?q={address}        # Address/landmark geocoding
```

#### Cabs (`/v1/cabs`)
```
GET    /cabs/search?...
POST   /cabs/booking
GET    /cabs/booking/:id
GET    /cabs/booking/:id/tracking           # GPS tracking data
PUT    /cabs/booking/:id/modify-pickup
POST   /cabs/booking/:id/cancel
GET    /cabs/booking/:id/refund-status
GET    /cabs/booking/:id/voucher
GET    /flights/status/:flightNumber/:date  # Flight tracking for airport transfers
```

#### Wallet & Finance (`/v1/wallet`)
```
GET    /wallet                              # TMC's own wallet
GET    /wallet/transactions                 # Paginated with filters
GET    /wallet/transactions/:id
POST   /wallet/recharge/bank-transfer
POST   /wallet/recharge/card               # Stripe payment intent
POST   /wallet/recharge/check
GET    /wallet/recharge/:id/status
GET    /wallet/invoices
GET    /wallet/invoices/:id
GET    /wallet/invoices/:id/download        # Pre-signed PDF URL
POST   /wallet/credit/extension-request
GET    /wallet/credit/extension-request/:id
```

#### Bookings (Unified) (`/v1/bookings`)
```
GET    /bookings                            # Unified list: flights + hotels + cabs
GET    /bookings/:id                        # Resolves to appropriate detail
POST   /bookings/:id/email-documents        # Email selected documents
```

#### Support (`/v1/support`)
```
GET    /support/tickets                     # List with filters
POST   /support/tickets
GET    /support/tickets/:id
POST   /support/tickets/:id/reply
PUT    /support/tickets/:id/assign
PUT    /support/tickets/:id/escalate
PUT    /support/tickets/:id/resolve
PUT    /support/tickets/:id/close
PUT    /support/tickets/:id/priority
GET    /support/metrics                     # SLA + performance metrics
```

#### Team Management (`/v1/team`)
```
GET    /team/agents                         # TMC's team
POST   /team/agents/invite                  # Send invitation
GET    /team/agents/:id
PUT    /team/agents/:id
PUT    /team/agents/:id/deactivate
POST   /team/agents/:id/resend-invitation
```

#### Clients (`/v1/clients`)
```
GET    /clients
POST   /clients
GET    /clients/:id
PUT    /clients/:id
DELETE /clients/:id
GET    /clients/:id/travellers              # Saved traveller profiles
POST   /clients/:id/travellers
PUT    /clients/:id/travellers/:travellerId
```

#### Profile (`/v1/profile`)
```
GET    /profile
PUT    /profile
PUT    /profile/change-password
POST   /profile/avatar
PUT    /profile/notifications               # Notification preferences
GET    /profile/2fa/setup                   # Get QR code
POST   /profile/2fa/setup                   # Verify TOTP and enable
DELETE /profile/2fa                         # Disable 2FA
```

#### Reports (`/v1/reports`)
```
GET    /reports/booking
GET    /reports/revenue
GET    /reports/commission
GET    /reports/support
GET    /reports/schedules
POST   /reports/schedules
PUT    /reports/schedules/:id
DELETE /reports/schedules/:id
POST   /reports/schedules/:id/run-now
GET    /reports/history                     # Generated report history
GET    /reports/history/:id/download
POST   /reports/history/:id/email
```

#### Payments (`/v1/payments`)
```
POST   /payments/intent                     # Create Stripe payment intent
POST   /payments/confirm                    # Confirm payment
POST   /webhooks/stripe                     # Stripe webhook handler
```

#### Exchange Rates (`/v1/exchange-rates`)
```
GET    /exchange-rates                      # Current rates (USD base)
```

#### WebSocket Namespaces
```
WS     /ws/dashboard                        # Real-time dashboard KPIs
WS     /ws/cab-tracking/:bookingId          # Live GPS driver tracking
WS     /ws/payment-status                   # Payment processing status
WS     /ws/support                          # Real-time ticket updates
```

---

## 8. Authentication & RBAC Architecture

### 8.1 JWT Strategy

```
Access Token:  15-minute expiry
Refresh Token: 7-day expiry (30-day if "remember device")
Storage:       httpOnly cookies (Secure + SameSite=Strict)
Rotation:      Refresh tokens rotated on each use
Revocation:    Session table with tokenHash; checked on every request
```

### 8.2 2FA Implementation

```
Library:     otplib (TOTP RFC 6238)
Secret:      32-byte random, encrypted with AES-256 before storing
QR Code:     qrcode library → base64 PNG sent to client
Backup Codes: 10 × 8-char alphanumeric, bcrypt hashed, single-use
Enforcement: Mandatory for SA-Ops + SA-Finance (cannot skip)
             Optional for TMC Admin; not available for TMC Agent
```

### 8.3 RBAC Permission Matrix

```
Role                  | Scope          | Booking | Finance | Admin | Config
─────────────────────────────────────────────────────────────────────────────
SUPER_ADMIN_OPS       | Platform-wide  |  CREATE | VIEW    | FULL  | FULL
SUPER_ADMIN_FINANCE   | Platform-wide  |  VIEW   | FULL    | VIEW  | NONE
TMC_ADMIN             | Own TMC only   |  FULL   | OWN     | NONE  | NONE
TMC_AGENT             | Own + TMC read |  CREATE | VIEW    | NONE  | NONE
```

### 8.4 TMC Scope Guard

Every API request from TMC roles is automatically filtered through a `TmcScopeGuard`:

```typescript
@Injectable()
export class TmcScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // Super Admins bypass: can access all TMC data
    if (user.role.startsWith('SUPER_ADMIN')) return true;
    // TMC roles: inject tmcId filter on all queries
    request.tmcFilter = { tmcId: user.tmcId };
    // TMC_AGENT: additionally filter own bookings
    if (user.role === 'TMC_AGENT') {
      request.agentFilter = { agentId: user.id };
    }
    return true;
  }
}
```

---

## 9. GDS Integration Layer

### 9.1 GDS Abstraction

All GDS providers implement a common `IGdsAdapter` interface:

```typescript
interface IGdsAdapter {
  searchFlights(params: FlightSearchParams): Promise<FlightOffer[]>
  getFlexiblePrices(params: FlexibleSearchParams): Promise<DatePriceGrid>  // BR-044
  getFareRules(offerId: string): Promise<FareRules>
  priceOffer(offerId: string): Promise<PricedOffer>
  getSeatMap(offerId: string): Promise<SeatMap>
  createBooking(params: BookingParams): Promise<GdsBookingResult>
  holdBooking(params: HoldParams): Promise<HoldResult>
  cancelBooking(pnr: string): Promise<CancelResult>
  modifyDate(pnr: string, params: DateChangeParams): Promise<ModifyResult>
  correctName(pnr: string, params: NameCorrectParams): Promise<ModifyResult>
  getBookingStatus(pnr: string): Promise<BookingStatus>
}
```

### 9.2 Region-Based Routing (BR-045)

```
Region Selector → Backend routing (client feedback March 2026: region selector is API routing, NOT a filter)

GLOBAL       → Amadeus primary + Traventions proprietary fallback
NORTH_AMERICA → Sabre primary + Traventions consolidator fares
MIDDLE_EAST  → Amadeus primary + Traventions ME proprietary
```

### 9.3 GDS Response Normalization

All GDS responses are normalized to a unified `FlightOffer` format with 4 fare types:
- `NET` — Base platform price
- `COMMISSIONABLE` — Airline-allowed agent commission (1-3%)
- `CONSOLIDATOR` — Platform-negotiated bulk fares
- `NDC` — New Distribution Capability fares (5-10%)

Commission display is **role-gated**: only `TMC_ADMIN` and `TMC_AGENT` see commission data.

### 9.4 Fare Caching

```
Redis key:  flight_search:{routeHash}:{cabinClass}:{region}:{date}
TTL:        5 minutes
On booking: Invalidate + re-price via GDS
Structure:  {offers: FlightOffer[], cachedAt: ISO8601, gdsProvider: string}
```

---

## 10. Wallet & Financial Engine

### 10.1 Double-Entry Ledger

Every wallet debit/credit is atomic using PostgreSQL transactions:

```sql
BEGIN;
  -- 1. Lock wallet row
  SELECT balance, blocked_amount FROM wallets WHERE tmc_id = $1 FOR UPDATE;

  -- 2. Check sufficient balance
  -- Available = balance - blocked_amount
  -- If available < amount → ROLLBACK with error

  -- 3. Update wallet
  UPDATE wallets
  SET balance = balance - $amount,
      updated_at = NOW()
  WHERE tmc_id = $1;

  -- 4. Insert transaction record
  INSERT INTO wallet_transactions
  (wallet_id, tmc_id, type, amount, balance_before, balance_after, ...)
  VALUES (...);

COMMIT;
```

### 10.2 Wallet Balance Thresholds (BR-022, BR-023, BR-024)

```
$100  → BLOCKED: All new bookings disabled; persistent red banner
$500  → CRITICAL: Red banner; SMS + email alert to TMC Admin
$1000 → WARNING: Amber banner; email alert to TMC Admin
```

### 10.3 Hold Booking Funds Flow

For on-request hotels and flight holds:
1. Payment taken immediately but `blocked_amount` incremented (not balance reduced)
2. On confirmation: `blocked_amount` decremented, `balance` decremented
3. On rejection/expiry: `blocked_amount` decremented only (funds restored to available)

### 10.4 Credit System

```
Available Credit = credit_limit - credit_utilized
Total Available  = (wallet.balance - wallet.blocked_amount) + available_credit

Auto-block on 30-day overdue: Nightly cron checks invoice due dates
Auto-approve extension:       If 100% on-time payment history → 2× limit (BR-033)
```

---

## 11. Background Jobs Architecture

### 11.1 BullMQ Queue Structure

```
Queues (all backed by Redis):

flight-hold-expiry       → Check + auto-cancel expired holds
                           Schedule: Continuous polling every 60s

notification             → Email, SMS, WhatsApp dispatch
                           Workers: 5 concurrent

report-generation        → Async large report processing
                           Workers: 3 concurrent (heavy CPU)

hotel-status-polling     → Poll supplier for on-request hotel confirmations
                           Schedule: Every 15 min for pending bookings

invoice-overdue-check    → Nightly: flag overdue, trigger reminders
                           Schedule: Daily at 02:00 UTC

wallet-threshold-alerts  → Check wallet balances, send alerts
                           Schedule: Every 30 min

hold-booking-reminders   → 24h, 6h, 2h reminders before TTL (BR-040-042)
                           Schedule: Continuous

report-scheduler         → Trigger scheduled reports
                           Schedule: Every minute (checks nextRunAt)

exchange-rate-refresh    → Refresh exchange rates
                           Schedule: Every hour

pdf-generation           → Generate e-tickets, vouchers, invoices async
                           Workers: 5 concurrent

cab-driver-assignment    → Trigger driver assignment notifications
                           Schedule: Event-driven
```

### 11.2 Hold Booking TTL System

```
On hold created:
  → Store Redis key: hold:{bookingId} with TTL = airline TTL - 15min safety buffer
  → Schedule BullMQ delayed job for: TTL-24h (email reminder)
  → Schedule BullMQ delayed job for: TTL-6h  (email reminder)
  → Schedule BullMQ delayed job for: TTL-2h  (SMS reminder)
  → Schedule BullMQ delayed job for: TTL      (auto-cancel)

On TTL job fires:
  → Cancel booking in GDS
  → Update status to EXPIRED
  → Release blocked wallet funds
  → Send notification to agent
```

---

## 12. Real-time & WebSocket Architecture

### 12.1 Socket.io Namespaces

```typescript
// Dashboard namespace — real-time KPI updates every 30s
namespace: /ws/dashboard
events: {
  'dashboard:update' → { type: 'sa-ops' | 'sa-finance' | 'tmc-admin' | 'tmc-agent', data: {...} }
  'ticket:new'       → New ticket assigned to agent
  'wallet:low'       → Wallet threshold crossed
}

// Cab tracking namespace — GPS updates every 10s when driver active
namespace: /ws/cab-tracking
rooms:     booking-{bookingId}
events: {
  'location:update' → { lat, lng, eta, timestamp }
  'driver:assigned' → Driver details payload
  'trip:started'    → Trip status change
}

// Payment namespace — Stripe payment status
namespace: /ws/payment
rooms:     payment-{paymentIntentId}
events: {
  'payment:success' → Booking confirmation
  'payment:failed'  → Error details
  'payment:3ds'     → 3DS redirect URL
}

// Support namespace — real-time ticket updates
namespace: /ws/support
rooms:     ticket-{ticketId}, tmc-{tmcId}
events: {
  'ticket:message'  → New message in thread
  'ticket:updated'  → Status/priority change
  'ticket:assigned' → Assignment notification
}
```

### 12.2 Redis Pub/Sub for Horizontal Scaling

```
When multiple API instances run:
  BullMQ events → Redis Pub/Sub → Socket.io Redis adapter → All connected WS clients
  
  socket.io-redis (adapter) ensures events broadcast across all server instances
```

---

## 13. Notification & Communication Services

### 13.1 Email Service (SendGrid / AWS SES)

```typescript
// Template-driven email with Handlebars
templates: {
  registration_confirmation,
  tmc_approved,
  tmc_rejected,
  sub_user_invitation,     // 72-hour token
  booking_confirmed,       // With e-ticket attachment
  hotel_voucher,           // Blocked until HCN received
  hold_reminder_24h,
  hold_reminder_6h,
  hold_expired,
  password_reset,          // 30-min token
  password_changed,
  wallet_low_warning,
  wallet_critical,
  wallet_blocked,
  credit_extension_approved,
  credit_extension_rejected,
  invoice_due_reminder,
  invoice_overdue,
  tmc_blocked,
  tmc_unblocked,
  report_ready,
  on_request_confirmed,    // With HCN + voucher
  on_request_rejected
}
```

### 13.2 SMS Service (Twilio / AWS SNS)

```
Triggers:
  - Wallet balance critical ($500) — BR-024
  - Hold booking 2h before expiry — BR-042
  - Invoice overdue reminders
  - Driver assigned notification (to passenger)
  - OTP for Net Banking payments
```

### 13.3 WhatsApp Business API (Meta) — Phase 1 One-Way

```
Notification types (outbound only per BR-078):
  - Booking confirmation summary
  - Modification confirmed
  - Cancellation confirmed
  - Support ticket created/updated
  - Driver assigned

Templates must be pre-approved by Meta.
Opt-out tracked in NotificationPreference table.
Fallback: Email if WhatsApp fails (non-blocking).
```

---

## 14. Caching Strategy (Redis)

### 14.1 Cache Key Patterns

```
# GDS Search Results (5-min TTL)
flight_search:{sha256_of_params}          → FlightOffer[]

# Flexible Date Prices (5-min TTL)
flex_prices:{origin}:{dest}:{dateRange}:{cabin} → DatePriceGrid

# Hotel Search Results (5-min TTL)
hotel_search:{sha256_of_params}           → HotelResult[]

# IATA Airport Lookup (24-hour TTL)
airport:{query}                           → AirportSuggestion[]

# Exchange Rates (1-hour TTL)
exchange_rates:{baseCurrency}             → {[currency]: rate}

# Dashboard KPIs (30-sec TTL)
dashboard:sa-ops:{userId}                 → SAOpsDashboardData
dashboard:sa-finance:{userId}             → SAFinanceDashboardData
dashboard:tmc-admin:{tmcId}               → TmcAdminDashboardData
dashboard:tmc-agent:{userId}              → TmcAgentDashboardData

# Session Blacklist (JWT revocation)
session_revoked:{tokenHash}               → "1" (TTL = token expiry)

# Rate Limiting
rate_limit:auth:{ip}                      → attempt count
rate_limit:password_reset:{email}         → request count (max 3/hr)

# Hold Booking TTL
hold:{bookingId}                          → TTL countdown (airline-defined)
```

### 14.2 Cache Invalidation

- **On booking confirmation:** Invalidate GDS search cache for that route/date
- **On wallet recharge:** No cache needed (wallet read from DB directly)
- **Dashboard:** 30-second TTL + WebSocket push on key events

---

## 15. Third-party Integrations Map

```
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FLIGHT GDS                                                      │
│  ├── Amadeus API     (OAuth2)     → Flights (Global + ME)        │
│  ├── Sabre API       (SOAP/REST)  → Flights (North America)      │
│  └── Traventions API (Internal)  → Consolidator + NDC fares      │
│                                                                  │
│  HOTEL APIs                                                      │
│  └── Hotelbeds / Amadeus Hotels  → Hotel search + booking        │
│                                                                  │
│  CAB APIs                                                        │
│  └── iWay / Mozio               → Ground transfers + GPS         │
│                                                                  │
│  PAYMENT                                                         │
│  └── Stripe                     → Card, 3DS, Webhooks, Refunds   │
│                                                                  │
│  COMMUNICATION                                                   │
│  ├── SendGrid / AWS SES         → Transactional email            │
│  ├── Twilio / AWS SNS           → SMS notifications              │
│  └── Meta WhatsApp Business API → One-way notifications          │
│                                                                  │
│  MAPS & LOCATION                                                 │
│  ├── Google Maps / Mapbox       → Hotel maps, cab GPS display    │
│  ├── Geocoding API              → Address → coordinates (hotels) │
│  └── FlightAware / AeroAPI      → Live flight tracking (cabs)    │
│                                                                  │
│  CURRENCY                                                        │
│  └── OpenExchangeRates          → 8-currency live rates          │
│                                                                  │
│  AI/NLP (Sprint 5)                                               │
│  └── OpenAI GPT-4 API           → Ticket categorization          │
│                                                                  │
│  EXTERNAL VERIFICATION                                           │
│  ├── IATA Validation API        → IATA number verification       │
│  ├── GST India API              → GST number verification        │
│  ├── ASIC API (Australia)       → ABN verification               │
│  └── VIES (EU)                  → VAT number verification        │
│                                                                  │
│  STORAGE                                                         │
│  └── AWS S3                     → All file storage               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 16. Security Architecture

### 16.1 Authentication Security

| Control | Implementation |
|---|---|
| Password hashing | bcrypt (cost factor 12) |
| JWT signing | RS256 (asymmetric, private key stored in Secrets Manager) |
| Session revocation | Redis blacklist on logout/password change |
| Brute force protection | 5 attempts → 30-min lockout (BR-003/BR-004) |
| Password reset rate limit | 3 requests/hour per email (BR-A7) |
| 2FA enforcement | Mandatory SA-Ops + SA-Finance; optional TMC Admin |
| New device detection | Email alert on unrecognized IP (BR-013) |
| Password expiry | 90 days SA / 120 days TMC (BR-008/BR-009) |
| Password history | Last 3 passwords checked (BR-010) |
| HTTPS | TLS 1.3 minimum |

### 16.2 Data Protection

| Data Type | Protection |
|---|---|
| Passwords | bcrypt hash; never stored plain |
| Passport numbers | AES-256 application-level encryption before DB storage |
| National ID numbers | AES-256 application-level encryption |
| TOTP secrets | AES-256 encryption |
| Credit card numbers | Never stored — Stripe handles tokenization |
| KYC documents | S3 server-side encryption (AES-256) + IAM-only access |
| Database | RDS encryption at rest (AES-256) |
| In transit | TLS 1.3 enforced on all connections |
| PII masking in logs | Passport/ID numbers masked; emails partially masked |

### 16.3 API Security

```
Rate limiting:     express-rate-limit (Redis-backed for distributed)
  - Auth routes:   10 req/min per IP
  - Search routes: 60 req/min per user
  - General:       200 req/min per user

CORS:              Whitelist allowed origins per environment
Helmet.js:         Security headers (CSP, HSTS, X-Frame-Options)
SQL Injection:     Prisma parameterized queries (no raw SQL user input)
XSS:               Input sanitization via class-validator; CSP headers
CSRF:              SameSite=Strict cookies + CSRF token for state-changing ops
File upload:       Type validation (mime-type + extension), size limits, virus scan
```

### 16.4 TMC Data Isolation

```
All Prisma queries for TMC-scoped resources automatically include:
  WHERE tmc_id = :currentUserTmcId

Enforced at application layer via TmcScopeGuard.
Enforced at DB layer via Row-Level Security (PostgreSQL RLS) as secondary control.
```

### 16.5 Audit Logging

All admin actions are immutably logged to the `AuditLog` table:
- Actor ID, role, email
- Action performed (enum)
- Entity type + ID
- Before/after JSON diff
- IP address + user agent
- Timestamp (UTC)

Retention: 2 years minimum.

---

## 17. Local Development Setup

### 17.1 Prerequisites

```bash
# Required tools
node >= 20.x
npm >= 10.x
redis (natively installed)
aws-cli (configured with dev credentials)
```

### 17.2 First-Time Setup

```bash
# 1. Clone and install
git clone <repo>
cd traventions
npm install

# 2. Copy environment files
cp .env.example .env.local
# Fill in: DATABASE_URL (shared RDS dev), AWS keys, Stripe test keys, etc.

# 3. Start Redis (native — must be installed first)
# macOS:  brew services start redis
# Linux:  sudo systemctl start redis

# 4. Run database migrations
cd apps/api
npx prisma migrate dev

# 5. Seed development data
npx prisma db seed

# 6. Start all services
npm run dev  # Starts both web (3000) and api (3001) via Turborepo
```

### 17.3 Development Data Seeds

```typescript
// seeds/dev.seed.ts creates:
// - 2 Super Admin accounts (Ops + Finance)
// - 3 TMC organizations (Active, Pending, Blocked states)
// - 5 TMC Admins + 10 TMC Agents
// - Sample flight/hotel/cab bookings
// - Wallet transactions and invoices
// - Support tickets (various priorities/statuses)
// - Exchange rates
// - KYC country configs
```

---

## 18. Cloud Deployment Architecture (Post-Development)

### 18.1 ECS Fargate Service Configuration

| Service | CPU | Memory | Min Tasks | Max Tasks | Auto-scale trigger |
|---|---|---|---|---|---|
| API Service | 1 vCPU | 2 GB | 2 | 10 | CPU > 70% |
| Web Service | 0.5 vCPU | 1 GB | 2 | 6 | Request count |
| Worker Service | 1 vCPU | 2 GB | 1 | 5 | BullMQ queue depth |

### 18.2 CI/CD Pipeline (GitHub Actions)

```yaml
# On PR:
  - lint (eslint + prettier)
  - type-check (tsc --noEmit)
  - unit tests (jest)
  - integration tests (jest + test DB)
  - build check (turbo build)

# On merge to develop:
  - Run all PR checks
  - Build Docker images
  - Push to ECR (tagged: develop-{sha})
  - Deploy to staging (ECS)
  - Run E2E smoke tests (Playwright)
  - Notify Slack

# On tag (v1.x.x):
  - Build production Docker images
  - Push to ECR (tagged: {version})
  - Deploy to production (blue/green via ECS)
  - Run production smoke tests
  - Notify Slack
```

### 18.3 Database Migration Strategy

```
# Never run auto-migrations in production
# Process:
1. PR includes migration file
2. Reviewer checks migration for data safety
3. On release: Run `prisma migrate deploy` during deployment (before new code starts)
4. Maintain rollback SQL scripts for each migration
5. Blue/green deployment allows rollback without data loss
```

---

## 19. Environment Configuration

### 19.1 Required Environment Variables

```bash
# ── DATABASE ──────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/traventions

# ── REDIS ──────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── JWT ────────────────────────────────────────────────
JWT_PRIVATE_KEY=<RS256 private key PEM>
JWT_PUBLIC_KEY=<RS256 public key PEM>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ── AWS ────────────────────────────────────────────────
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_PRIVATE_BUCKET=traventions-private-dev
AWS_S3_PUBLIC_BUCKET=traventions-public-assets-dev

# ── STRIPE ─────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# ── EMAIL ──────────────────────────────────────────────
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@traventions.com
EMAIL_SUPPORT=support@traventions.com

# ── SMS ────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+1...

# ── WHATSAPP ───────────────────────────────────────────
META_WHATSAPP_PHONE_ID=
META_WHATSAPP_ACCESS_TOKEN=

# ── GDS ────────────────────────────────────────────────
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
AMADEUS_BASE_URL=https://test.api.amadeus.com  # sandbox

SABRE_API_KEY=
SABRE_API_SECRET=
SABRE_BASE_URL=https://api.cert.sabre.com      # sandbox

TRAVENTIONS_GDS_URL=
TRAVENTIONS_GDS_API_KEY=

# ── HOTELS ─────────────────────────────────────────────
HOTELBEDS_API_KEY=
HOTELBEDS_API_SECRET=
HOTELBEDS_BASE_URL=https://api.test.hotelbeds.com

# ── CABS ───────────────────────────────────────────────
IWAY_API_KEY=
IWAY_BASE_URL=

# ── MAPS ───────────────────────────────────────────────
GOOGLE_MAPS_API_KEY=
MAPBOX_ACCESS_TOKEN=

# ── FLIGHT TRACKING ────────────────────────────────────
FLIGHTAWARE_API_KEY=

# ── CURRENCY ───────────────────────────────────────────
OPENEXCHANGERATES_APP_ID=

# ── AI ─────────────────────────────────────────────────
OPENAI_API_KEY=sk-...

# ── APP ────────────────────────────────────────────────
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:3001
PORT=3001
ENCRYPTION_KEY=<32-byte AES key for PII encryption>
SENTRY_DSN=https://...
```

---

## 20. Data Flow Diagrams

### 20.1 Flight Booking Flow

```
Agent         Web App        API Server      GDS          Stripe      DB/Redis
  │              │                │             │              │           │
  │ Search form  │                │             │              │           │
  │─────────────►│                │             │              │           │
  │              │ POST /flights/search          │              │           │
  │              │───────────────►│             │              │           │
  │              │                │ Search all GDS             │           │
  │              │                │────────────►│              │           │
  │              │                │◄────────────│              │           │
  │              │                │ Cache results (5min TTL)   │           │
  │              │                │──────────────────────────────────────►│
  │              │◄───────────────│             │              │           │
  │ Results with │                │             │              │           │
  │ fare types   │                │             │              │           │
  │◄─────────────│                │             │              │           │
  │              │                │             │              │           │
  │ Book (step 4)│                │             │              │           │
  │─────────────►│                │             │              │           │
  │              │ POST /payments/intent         │              │           │
  │              │───────────────►│             │              │           │
  │              │                │ Create PaymentIntent        │           │
  │              │                │──────────────────────────►│           │
  │              │                │◄──────────────────────────│           │
  │              │◄───────────────│             │              │           │
  │ 3DS if needed│                │             │              │           │
  │─────────────►│                │             │              │           │
  │              │ POST /payments/confirm        │              │           │
  │              │───────────────►│             │              │           │
  │              │                │ Confirm charge              │           │
  │              │                │──────────────────────────►│           │
  │              │                │                             │ Webhook   │
  │              │                │◄──────────────────────────│           │
  │              │                │ Create PNR in GDS          │           │
  │              │                │────────────►│              │           │
  │              │                │◄────────────│              │           │
  │              │                │ Debit wallet (atomic txn)             │
  │              │                │──────────────────────────────────────►│
  │              │                │ Generate e-ticket PDF → S3            │
  │              │                │──────────────────────────────────────►│
  │              │                │ Send confirmation email               │
  │              │◄───────────────│             │              │           │
  │ Confirmation │                │             │              │           │
  │ page + PNR   │                │             │              │           │
```

### 20.2 On-Request Hotel Flow

```
Agent     Web App      API          Supplier    Ops Admin    DB
  │          │           │             │             │          │
  │ Book     │           │             │             │          │
  │─────────►│           │             │             │          │
  │          │ Create booking          │             │          │
  │          │──────────►│             │             │          │
  │          │           │ Hold payment (blocked_amount++)      │
  │          │           │────────────────────────────────────►│
  │          │           │ Submit request to supplier          │
  │          │           │────────────►│             │          │
  │          │◄──────────│             │             │          │
  │ Pending  │           │             │             │          │
  │ screen   │           │             │             │          │
  │◄─────────│           │             │ Supplier confirms     │
  │          │           │◄────────────│             │          │
  │          │           │ HCN received → update booking       │
  │          │           │────────────────────────────────────►│
  │          │           │ Charge wallet (confirmed)           │
  │          │           │────────────────────────────────────►│
  │          │           │ Generate voucher PDF (HCN included) │
  │          │           │────────────────────────────────────►│
  │          │           │ Notify Ops Admin (BR-049)           │
  │          │           │──────────────────────────►│         │
  │          │           │ Notify Agent (email + WhatsApp)     │
  │          │◄──────────│             │             │          │
  │ HCN +    │           │             │             │          │
  │ Voucher  │           │             │             │          │
```

### 20.3 Wallet Recharge (Bank Transfer) Flow

```
TMC Admin   Web App    API Server   Redis/DB   SA-Finance   Stripe
    │           │           │           │           │           │
    │ Initiate  │           │           │           │           │
    │ recharge  │           │           │           │           │
    │──────────►│           │           │           │           │
    │           │ POST /wallet/recharge/bank-transfer           │
    │           │──────────►│           │           │           │
    │           │           │ Generate reference code           │
    │           │           │ Create WalletRecharge (PENDING)  │
    │           │           │──────────►│           │           │
    │           │◄──────────│           │           │           │
    │ Show bank │           │           │           │           │
    │ details + │           │           │           │           │
    │ ref code  │           │           │           │           │
    │           │           │           │           │           │
    │ [Makes bank transfer offline]      │           │           │
    │           │           │           │           │           │
    │ Upload    │           │           │           │           │
    │ receipt   │           │           │           │           │
    │──────────►│           │           │           │           │
    │           │ Upload to S3 + update WalletRecharge          │
    │           │──────────►│           │           │           │
    │           │           │ Notify SA-Finance      │           │
    │           │           │──────────────────────►│           │
    │           │           │           │           │           │
    │           │           │           │     SA-Finance reviews│
    │           │           │           │           │           │
    │           │           │           │     PUT /wallet-recharges/:id/approve
    │           │           │◄──────────────────────│           │
    │           │           │ Credit wallet (atomic txn)        │
    │           │           │──────────►│           │           │
    │           │           │ Send email + in-app to TMC Admin  │
    │           │           │──────────►│           │           │
    │           │◄──────────│           │           │           │
    │ Balance   │           │           │           │           │
    │ updated   │           │           │           │           │
```

---

## Appendix A: Sprint 1 Implementation Checklist

Per the project sprint plan, the following must be completed first:

- [ ] **Monorepo setup** — Turborepo, workspace packages, shared types
- [ ] **Redis local install** — Native Redis install; connect to shared RDS dev + S3 dev
- [ ] **Prisma schema** — Full schema above, initial migration, dev seed
- [ ] **NestJS app bootstrap** — App module, global exception filter, validation pipe
- [ ] **Auth module** — JWT RS256, refresh tokens, session table, httpOnly cookies
- [ ] **2FA module** — otplib TOTP, QR code generation, backup codes
- [ ] **RBAC** — RolesGuard, TmcScopeGuard, @Roles decorator
- [ ] **TMC registration** — 4-step registration API, KYC S3 upload
- [ ] **KYC config** — Dynamic country requirements endpoint
- [ ] **Password security** — bcrypt, history check, expiry logic
- [ ] **Account lockout** — 5-attempt lockout, 30-min auto-unlock
- [ ] **Session expiry** — 30-min inactivity, WebSocket heartbeat
- [ ] **Dashboard APIs** — All 4 dashboard data endpoints
- [ ] **WebSocket** — Socket.io setup, dashboard namespace
- [ ] **Email service** — SendGrid/SES setup, registration + invitation templates
- [ ] **CI/CD** — GitHub Actions lint + test + build pipeline

---

## Appendix B: Key Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| ORM | Prisma | Type-safe, excellent migration tooling, schema-first |
| Frontend State | Zustand + React Query | Minimal boilerplate; React Query handles server cache |
| Job Queue | BullMQ | Mature, Redis-backed, excellent DX, retry + delay support |
| PDF Generation | Puppeteer (server-side) | Pixel-perfect PDFs from HTML templates |
| GDS Abstraction | Adapter pattern | Swap GDS providers without changing booking logic |
| Wallet Concurrency | PostgreSQL `SELECT FOR UPDATE` | Prevents negative balance race conditions |
| Cookie vs LocalStorage | httpOnly cookies | XSS protection for JWT tokens |
| Tenant Isolation | tmcId on every table + RLS | Defense in depth; prevents data leaks |
| S3 Access | IAM roles + pre-signed URLs | No credentials in client; time-limited access |
| Email Templates | DB-stored templates | Dual SA + TMC template ownership (client feedback) |

---

_Document Version: 1.0 | Architecture Team | March 2026_