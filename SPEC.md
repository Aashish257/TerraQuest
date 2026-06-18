# TerraQuest Backend Setup Specification

## 1. Project Identity
- **Name**: TerraQuest (formerly Travell)
- **Base Directory**: `e:/Travell/backend`

## 2. Dependencies & Purpose

### Main Dependencies
- `express` (v4): HTTP server framework for routing, middlewares, and requests.
- `mongoose` (v8): Object Data Modeling (ODM) library for MongoDB.
- `dotenv` (latest): Loading environment variables from `.env` files.
- `zod` (latest): Runtime type validation and schema-based validation for request payloads and environment variables.
- `cors` (latest): Middleware to enable Cross-Origin Resource Sharing (CORS) with frontend.
- `bcrypt` (latest): Hashing user passwords securely.
- `jsonwebtoken` (latest): Generating and verifying JWT access tokens.
- `express-rate-limit` (latest): Protecting endpoints against brute-force attacks and rate abuse.

### Dev Dependencies
- `typescript` (v5): Typed superset of JavaScript.
- `@types/express`, `@types/cors`, `@types/bcrypt`, `@types/jsonwebtoken`, `@types/node`, `@types/jest`, `@types/supertest`: TypeScript type definitions.
- `ts-node-dev` (latest): Fast development runner that compiles on-the-fly and restarts automatically.
- `jest` (latest): Unit and integration testing framework.
- `ts-jest` (latest): Jest transformer for TypeScript.
- `supertest` (latest): Testing HTTP servers.
- `mongodb-memory-server` (latest): In-memory MongoDB for clean, independent unit/integration tests without external DB dependencies.

---

## 3. Directory Layout
The backend directory structure will look as follows:
```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts               # Database connection
│   │   └── env.ts              # Env validation
│   ├── models/                 # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Destination.ts
│   │   ├── GuideProfile.ts
│   │   ├── HiddenPlace.ts
│   │   ├── Trip.ts
│   │   ├── TripMember.ts
│   │   ├── BudgetEntry.ts
│   │   ├── Review.ts
│   │   └── AIPlan.ts
│   ├── middleware/             # Express middlewares
│   │   └── errorHandler.ts     # Global error handler
│   ├── app.ts                  # Express app definition
│   └── server.ts               # Server startup listener
├── tests/
│   ├── setup.ts                # In-memory MongoDB testing environment
│   └── unit/
│       └── db.test.ts          # Test verification of schemas & DB connection
├── tsconfig.json               # TS configuration
├── jest.config.json            # Jest configuration
├── .env.example                # Example environment file
└── package.json                # Project script and dependencies
```

---

## 4. Database Schema Requirements
All Mongoose schemas must be mapped to TypeScript interfaces, validate required fields, have logical indexing, and enforce proper constraints. See `Doc/02-DATABASE-SCHEMAS.md` for schema structures.

---

## 5. Environment Validation
Validate the following environment variables at application startup:
- `PORT` (Number, default 5000)
- `NODE_ENV` (Enum: development, production, test)
- `MONGODB_URI` (String, required)
- `JWT_SECRET` (String, required)
- `JWT_EXPIRES_IN` (String, required, default 7d)
- `FRONTEND_URL` (String, required)
