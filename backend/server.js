// Simple Express backend for the frontend's /api/send-email requests.
// Supports real SMTP via environment variables or a safe JSON transport for local testing.
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

// /api/send-email
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, and html or text' });
    }

    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: (process.env.SMTP_SECURE === 'true'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Fallback to jsonTransport so nothing is sent — safe for local dev.
      transporter = nodemailer.createTransport({ jsonTransport: true });
      console.warn('SMTP config not found. Using jsonTransport (emails will not be sent). Set SMTP_HOST/SMTP_USER/SMTP_PASS to enable sending.');
    }

    const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';
    const mailOptions = { from, to, subject, html, text };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email send result:', info);
    res.json({ success: true, info });
  } catch (err) {
    console.error('Error in /api/send-email:', err);
    res.status(500).json({ error: 'Internal server error', details: err && err.message ? err.message : String(err) });
  }
});

// Serve static (optional) - useful if you build the front-end into dist/
const distPath = path.join(__dirname, '..', 'dist');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
