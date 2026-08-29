# 🛡️ Aarogya-Rakshak: Secure Cloud Vault (Backend)

> **A highly secure, highly normalized cloud vault for user profiles and encrypted financial snapshots.**

The backend for Aarogya-Rakshak acts exclusively as a secure sync mechanism and profile manager. **It does not perform any OCR or AI processing.** All sensitive document parsing happens on the client, and the backend only stores the final deterministic output, heavily encrypted.

---

## 🛠️ Tech Stack & Architecture

- **Environment:** Node.js, Express, TypeScript
- **Architecture:** Feature-based Modular Monolith
- **Database:** PostgreSQL (3NF normalized, ACID compliant)
- **ORM:** Prisma
- **Observability:** Centralized JSON structured logging using `pino`

---

## 🔒 Security & Validation Pipeline

The API is fortified at multiple levels to ensure data integrity and privacy:

### 1. Level 1 (API Boundary)
- **Zod DTO Validation:** All incoming requests are strictly validated against Zod schemas.
- **Middleware Protections:** Secured with `helmet` for HTTP headers, `cors` for origin control, and `express-rate-limit` for DDoS protection.
- **Authentication:** JWT-based auth (Access/Refresh tokens) with `bcrypt` (or `argon2`) password hashing.
- **Global Error Handling:** Custom `AppError` classes are intercepted by a global middleware to prevent stack trace leaks and standardize error responses.

### 2. Level 2 (DB Boundary)
- Prisma schema enforces foreign key cascades, unique indexes, and strong typing.

### 3. Data Privacy
- **AES-256 GCM Encryption:** The `encryptedJsonSummary` payload from the client is encrypted using Node's native `crypto` module *before* insertion into the database, providing an additional layer of security at rest beyond standard DB encryption.

---

## 🗄️ Database Schema Blueprint

The database is normalized to support high concurrency (5,000+ users) and robust relations.

- **`User`**: `id` (UUID), `email`, `passwordHash`, `fullName`
- **`Policy`**: `id`, `userId`, `providerName`, `policyNumber`, `sumInsured`, `roomRentLimit`, `coPayPercentage`, `deductible`
- **`FinancialAnalysis`**: `id`, `userId`, `policyId`, `hospitalName`, `totalBilledAmount`, `estimatedInsuranceCover`, `estimatedOutOfPocket`, `encryptedJsonSummary` (AES payload), `status`
- **Child Tables**: `BillLineItem`, `RedFlag`, `SuggestedQuestion` (Normalized 1-to-N relationships to `FinancialAnalysis` with cascading deletes).

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Create a `.env` file in the root of the `server/` directory:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aarogya_rakshak?schema=public"
JWT_SECRET="your_jwt_secret"
AES_ENCRYPTION_KEY="your_32_byte_aes_key" # Must be exactly 32 bytes for AES-256
```

### 3. Start Local PostgreSQL (via Docker)
To spin up a local PostgreSQL instance for development:
```bash
docker run --name aarogya-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### 4. Initialize the Database
Push the Prisma schema to the database and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Server
```bash
npm run dev
```
