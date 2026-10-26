# TrustFi

TrustFi is an educational loan-application project with a Next.js frontend, an
Express/TypeScript API, PostgreSQL persistence through Prisma, OCR-assisted
document classification, and separate loan-risk and fraud-assessment paths.
An application submission is a request for review, not an automatic loan
approval.

## Architecture

- **Frontend:** Next.js 16, React 19, TypeScript, Zustand, Tailwind CSS.
- **Backend:** Node.js, Express 5, TypeScript, Prisma 6, PostgreSQL.
- **Document processing:** Multer receives uploads; Tesseract.js and the
  document-validation service extract/classify supported OCR documents.
- **Loan risk:** the backend risk service calculates an estimate from the
  submitted financial data and document-validation indicators.
- **Fraud assessment:** separate document/fraud signals. An incomplete
  assessment is represented as incomplete; a completed HIGH result blocks
  submission.
- **User access:** registration/OTP and session-related endpoints exist.
  Admin data endpoints require a signed administrator bearer token and a
  matching admin record. Loan creation, risk calculation, and lookup by email
  are not bound to a customer session, so applicant fields supplied by the
  client must not be treated as authenticated identity.

## Loan application flow

The application has seven steps: personal details, identity documents,
employment, banking, loan details, required uploads, and AI review/submission.
After a valid loan-risk API response, the final review and submit action appear
on Step 7. Required file presence is checked separately from OCR verification.

When the required applicant fields and files are present, an application with
incomplete OCR can be submitted for manual review. OCR failure, UNKNOWN
classification, missing extracted fields, or a document-type mismatch does
not prove a file is genuine and is not, by itself, an OCR verification pass.
Applicants must still supply the fields required for their selected loan type.
A completed HIGH fraud-risk assessment remains blocked. The backend saves a
submitted application with `PENDING` status; only a lender/admin decision can
approve or reject it.

### Document and assessment limitations

- OCR text and document-type checks are indicators for review, not proof of
  identity, document authenticity, account ownership, property ownership, or
  gold ownership.
- Property Ownership / Sale Deed uploads are accepted after successful file
  receipt without OCR classification. The upload reference is stored with a
  property-loan application; ownership and authenticity remain unverified.
- Selfies are not OCR-verified. A successful upload is only file receipt.
- Loan-risk calculation and fraud assessment are separate. Loan-risk scores,
  eligibility, rates, and EMI are estimates, not a bureau credit score or
  lender decision.
- The UI does not establish that FHE computation is implemented or executed.
  The blockchain helper currently returns placeholder transaction data; it
  does not demonstrate a real on-chain loan transaction.

## Requirements and configuration

- Node.js and npm versions compatible with the package manifests.
- A PostgreSQL database reachable by the backend.
- Install dependencies separately in `backend` and `frontend`.

Create `backend/.env` and `frontend/.env.local` locally. Use your own
development/test values; never commit secrets.

`backend/.env`:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
PORT=5000
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="replace-with-a-random-secret-at-least-32-bytes-long"
```

The backend also references optional integrations:

- Email/OTP: `EMAIL_USER`, `EMAIL_APP_PASSWORD`.
- Twilio Verify: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
  `TWILIO_VERIFY_SERVICE_SID`.
- Payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
- Admin email: `ADMIN_EMAIL`, `ADMIN_EMAIL_PASSWORD`.

Admin OTP verification issues a signed, 24-hour bearer token using
`JWT_SECRET`. Admin dashboard/user APIs and loan-list/decision APIs require
that token; the frontend stores it for the active browser session. Configure a
strong secret of at least 32 bytes and keep it private.

Configure only services you intend to use. Keep credentials out of source
control and logs.

`frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

`NEXT_PUBLIC_API_URL` is public configuration and must not contain a secret.
The backend allows localhost port 3000 by default. For another frontend
origin, configure `FRONTEND_URL`.

## Database setup and migrations

Before migrating, verify that `DATABASE_URL` points to the intended development
or test database. Do not run migration commands against production without an
approved backup and deployment process.

```powershell
cd D:\TrustFi\backend
npm install
npx prisma validate
npx prisma migrate status
```

Back up the intended database using its provider's supported backup/branch
mechanism. Apply committed migrations only after verifying the target:

```powershell
npx prisma migrate deploy
npx prisma migrate status
```

The `20261026090000_add_property_document_upload_id` migration adds one
nullable `TEXT` column, `LoanApplication.propertyDocumentUploadId`. It does
not alter or delete existing row values. Confirm the column and migration
status before testing property-loan submission.

**Observed database limitation:** during the latest read-only check of the
backend's configured Neon database, Prisma reported the migration as applied,
but `information_schema.columns` did not contain
`LoanApplication.propertyDocumentUploadId`. Do not submit a property-loan
application to this database until its branch/target and actual schema are
reconciled. No schema write was performed during that check.

## Run locally

In separate PowerShell terminals:

```powershell
cd D:\TrustFi\backend
npm install
npm run dev
```

```powershell
cd D:\TrustFi\frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The backend health endpoint is
`http://localhost:5000/`.

## Checks and known limitations

Available package scripts:

- Backend: `npm run build`; no backend test or lint script is declared.
- Frontend: `npm run build` and `npm run lint`.
- Focused backend OCR tests can be run from `backend` with:

  ```powershell
  $env:TS_NODE_TRANSPILE_ONLY = "true"
  node --test -r ts-node/register src/services/documentValidation.service.test.ts
  ```

Use a dedicated test database for API submission tests. Do not create test
applications in production. Local frontend/backend configuration must be
checked independently: the frontend API URL does not determine which
PostgreSQL database the backend uses.

TrustFi is a project/demo implementation, not a production lending, identity
verification, fraud-detection, privacy, or FHE service.
