# 🛡️ Aarogya-Rakshak: Secure Sync Vault (Backend)

> **A lightweight, secure vault for optional data backup and family sharing.**

This is the backend service for the Aarogya-Rakshak mobile app (built for the iQOO Hackathon 2026). In accordance with our privacy-first philosophy, this backend **does not** process any documents, images, or AI inference. Its sole purpose is to serve as an optional, secure vault for encrypted user profiles and JSON calculation summaries.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma (or Sequelize)
- **Authentication:** JWT (JSON Web Tokens) & bcrypt

---

## 🗄️ Database Schema

The PostgreSQL database maintains the following core entities:

| Table | Fields | Description |
| :--- | :--- | :--- |
| **User** | `id`, `name`, `email`, `password_hash`, `created_at` | Core user account details. |
| **InsuranceProfile** | `id`, `user_id`, `provider_name`, `policy_number`, `base_sum_insured` | User's base health insurance information. |
| **EmergencySnapshot** | `id`, `user_id`, `hospital_name`, `total_estimate`, `estimated_out_of_pocket`, `sync_date`, `raw_json_summary` | Encrypted JSON blobs containing the offline-calculated financial summaries. |

---

## 🌐 API Endpoints

All API requests (except authentication) require a valid `Authorization: Bearer <token>` header.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user account. | ❌ |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT. | ❌ |
| `GET` | `/api/snapshots` | Fetch user's synced emergency snapshots. | ✅ |
| `POST` | `/api/snapshots` | Sync a new offline calculation JSON to the vault. | ✅ |

---

## 📋 Prerequisites

Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (Native or via Docker)

---

## 🚀 Setup & Run Instructions

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `server/` directory and populate it with the required values:

```env
PORT=3000
DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/aarogya_rakshak?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
```

### 3. Database Setup & Migration
Apply the database schema using your chosen ORM (assuming Prisma for this example):
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the Development Server
```bash
npm run dev
```
The API will be available at `http://localhost:3000`.

> [!TIP]  
> If you are testing the mobile app on a physical device, ensure your phone and computer are on the same local network, and replace `localhost` in your app's `API_BASE_URL` with your computer's local IP address (e.g., `192.168.1.100`).
