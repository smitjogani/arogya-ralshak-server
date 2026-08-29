# 🛡️ Aarogya-Rakshak: Secure Cloud Vault (Backend)

> **A robust, secure backend acting as a Tier-2 Cloud Fallback and E2EE Profile Sync Mechanism.**

In alignment with the Aarogya-Rakshak privacy-first philosophy, this application relies on a **Hybrid Architecture**. The Flutter client will always attempt to perform OCR and Calculation on-device. However, if the device is low-powered, or if the bill is extremely complex, the app falls back to this Node.js server. 

To guarantee privacy, the server utilizes strict **End-to-End Encryption (E2EE)**.

---

## 🛠️ Tech Stack & Architecture

- **Environment:** Node.js, Express, TypeScript
- **Architecture:** Feature-based Modular Monolith
- **Database:** PostgreSQL (3NF normalized, ACID compliant)
- **AI Integration:** Google Gemini & Google Cloud Vision (For Tier-2 Fallback)
- **Background Jobs:** BullMQ with Redis
- **Security:** AES-256-GCM Payload Encryption

---

## 🔌 API Integration Guide for Flutter Developers

### The E2EE Contract (CRITICAL)
For maximum privacy, **every single API request and response body is encrypted**. 
You cannot send standard JSON. You must encrypt the JSON on the phone using AES-256-GCM before transmitting it.

**Request Format:**
```json
{
  "encryptedData": "iv(12 bytes hex):authTag(16 bytes hex):encryptedPayload(hex)"
}
```

**Response Format:**
The server will respond with exactly the same format. You must decrypt it locally on the phone using the shared `AES_ENCRYPTION_KEY`.

### Available Endpoints

#### 1. Authentication Module
- `POST /api/v1/auth/register`: Create a new user account.
- `POST /api/v1/auth/login`: Authenticate and receive a JWT token.

#### 2. Policy Module (Requires JWT)
- `POST /api/v1/policy`: Save the user's Health Insurance limitations (Sum Insured, Room Rent Cap, Co-Pay, Deductibles).

#### 3. Analysis Module (Requires JWT & E2EE)
- `POST /api/v1/analysis/process-document`: The Tier-2 Fallback endpoint.
  - **What it does:** Accepts a medical bill image. Runs Google Cloud Vision OCR. Passes text to Gemini to extract red flags and line items. Runs the Deterministic Calculation Engine to estimate Out-Of-Pocket expenses.
  - **Returns:** An encrypted JSON snapshot containing the total estimate, questions to ask, and coverage breakdowns.

---

## 🚀 Docker Deployment

You can now spin up the entire backend (Express, Postgres, and Redis) using Docker.

1. Create your `.env` file based on `.env.example`.
2. Run the stack:
```bash
docker compose up --build -d
```
3. View logs:
```bash
docker compose logs -f backend
```
