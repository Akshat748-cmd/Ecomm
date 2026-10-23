# Precious Commerce Platform

A high-integrity ecommerce, bullion trading, fine jewellery, certified gemstones, sacred artefacts, and corporate gifting platform built with a modern separated **Frontend** and **Backend** architecture.

---

## 1. Repository Structure

```text
Precious-Commerce-Platform/
├── frontend/                   # React 19 + TypeScript + Vite + Tailwind CSS v4 Storefront & Admin
│   ├── src/                    # Components, Storefront, Admin, State (Zustand), API Client
│   ├── public/                 # Static assets, luxury product photography, and metadata
│   ├── package.json            # Frontend dependencies & scripts
│   ├── vite.config.ts          # Vite configuration with /api development proxy (:5173 -> :3001)
│   ├── tsconfig.json           # TypeScript configuration
│   ├── .env.example            # Example frontend environment variables
│   └── .env                    # Local frontend environment variables
│
├── backend/                    # Node.js / Express + TypeScript REST API
│   ├── src/
│   │   ├── controllers/        # Rates, Orders, Quotes, Payments, Inventory, Gifting, Logistics, Auth
│   │   ├── middleware/         # JWT Auth, RBAC Authorization, Centralized Error Handling
│   │   ├── database/           # Relational schema, seed data, and concurrency-safe database engine
│   │   ├── types/              # Backend TypeScript domain definitions
│   │   ├── config.ts           # Typed environment configuration
│   │   ├── app.ts              # Express application setup & route declarations
│   │   └── server.ts           # Server bootstrap listening on port 3001
│   ├── tests/                  # Automated integration tests for pricing, stock, PMLA PAN, etc.
│   ├── schema.sql              # Relational PostgreSQL DDL definitions
│   ├── package.json            # Backend dependencies & scripts
│   ├── tsconfig.json           # TypeScript configuration
│   ├── .env.example            # Example backend environment variables
│   └── .env                    # Local backend environment variables
│
├── docs/                       # Project Documentation & Authoritative Specifications
│   ├── ARCHITECTURE.md         # Architecture Decision Record & Technology Selection
│   ├── PRODUCTION_IMPLEMENTATION_PLAN.md # Requirements Traceability Matrix
│   └── mindmap.xmind           # Client mind map specification
│
├── package.json                # Root workspace configuration
└── README.md                   # Project documentation
```

---

## 2. Prerequisites

- **Node.js**: `v20.x` or later (tested with v20.19.6)
- **npm**: `v10.x` or later

---

## 3. Environment Configuration

### Frontend (`frontend/.env`)
Create `frontend/.env` (or copy from `frontend/.env.example`):
```env
VITE_API_URL=/api
VITE_PORT=5173
```

### Backend (`backend/.env`)
Create `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=3001
NODE_ENV=development
API_PREFIX=/api

# Relational Database URL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/precious_commerce

# JWT Authentication
JWT_SECRET=super_secure_development_secret_32_chars_min_precious_metals_2026
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bullion Feed Settings
MCX_API_URL=https://api.example.com/mcx/live-rates
LBMA_API_URL=https://api.example.com/lbma/live-rates
RATE_STALE_THRESHOLD_SECONDS=20

# Payment Gateway (Sandbox)
PAYMENT_GATEWAY_PROVIDER=razorpay_sandbox
PAYMENT_GATEWAY_KEY_ID=rzp_test_placeholder_key
PAYMENT_GATEWAY_KEY_SECRET=rzp_test_placeholder_secret
PAYMENT_WEBHOOK_SECRET=whsec_test_hmac_secret_placeholder

# Statutory & Compliance
PMLA_PAN_THRESHOLD_INR=200000
GST_RATE_BULLION=0.03
GSTIN_COMPANY=27AABCP1234F1Z8
```

---

## 4. Installation

Install all dependencies across the monorepo from the root:
```bash
npm install
```

---

## 5. Development Workflow

### Option A: Run from Root using Workspaces
- **Start Backend API** (`http://localhost:3001`):
  ```bash
  npm run dev:backend
  ```
- **Start Frontend Web Application** (`http://localhost:5173`):
  ```bash
  npm run dev:frontend
  ```

### Option B: Run Independently within Subdirectories
- **Frontend**:
  ```bash
  cd frontend
  npm run dev
  ```
- **Backend**:
  ```bash
  cd backend
  npm run dev
  ```

> **Proxy Note**: The frontend Vite dev server automatically proxies any request to `/api` directly to `http://localhost:3001/api`.

---

## 6. Running Tests

- **Run All Tests (Frontend + Backend)**:
  ```bash
  npm test
  ```
- **Run Frontend Tests Only**:
  ```bash
  npm run test:frontend
  ```
- **Run Backend Tests Only**:
  ```bash
  npm run test:backend
  ```

---

## 7. Production Build & Linting

- **Build Frontend Bundle**:
  ```bash
  npm run build:frontend
  ```
- **Build Backend TypeScript**:
  ```bash
  npm run build:backend
  ```
- **Run Frontend Linter**:
  ```bash
  npm run lint:frontend
  ```
