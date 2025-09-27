Backend for PM Internship Smart Allocation Engine
------------------------------------------------

This backend exposes:
  - GET  /api/ping         -> simple health check
  - POST /api/send-email  -> send email (expects JSON: { to, subject, html, text })

How to run (locally):
1. cd backend
2. npm install
3. Create a .env file from .env.example if you want real SMTP sending.
4. npm start

Notes:
- Vite dev server is configured to proxy '/api' to http://localhost:3001 (see vite.config.ts).
- If SMTP settings are missing, the server will use a jsonTransport and will not actually send emails;
  the email payload will be returned in the response for testing.
