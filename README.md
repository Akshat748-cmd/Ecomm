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

## 3. Installation

Install all dependencies across the monorepo from the root:
```bash
npm install
```

---

## 4. Development Workflow

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

## 5. Running Tests

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

## 6. Production Build & Linting

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
