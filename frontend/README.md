# TrustFi frontend

The frontend is a Next.js application. For architecture, environment setup,
database migration safety, the loan workflow, OCR/fraud limitations, and demo
instructions, see the [project README](../README.md).

## Local development

Create `.env.local` with the backend API URL (do not put secrets in
`NEXT_PUBLIC_*` variables):

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

Then run:

```powershell
npm install
npm run dev
```

Run `npm run build` for the production build or `npm run lint` for ESLint.
