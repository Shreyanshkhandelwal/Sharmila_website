const nodemailer = require('nodemailer');

function paymentLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['rzp.io', 'rzp.in', 'pages.razorpay.com', 'razorpay.com'].includes(url.hostname)
      && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    return res.status(200).json({
      monthly: paymentLink(process.env.MAGAZINE_MONTHLY_PAYMENT_LINK),
      yearly: paymentLink(process.env.MAGAZINE_YEARLY_PAYMENT_LINK),
    });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    return res.status(503).json({ error: 'Email signup is temporarily unavailable. Please try again later.' });
  }
  try {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 10000, socketTimeout: 15000,
    });
    await transport.sendMail({
      from: process.env.SMTP_EMAIL,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL,
      subject: 'MochaInk Magazine — new reader signup',
      text: `Reader email: ${email}\nSource: MochaInk Magazine membership popup\nThe reader requested magazine membership updates. This is not a paid subscription.`,
    });
    return res.status(200).json({ message: 'Thank you! Your email has been received for MochaInk Magazine membership updates.' });
  } catch {
    return res.status(502).json({ error: 'We could not save your email. Please try again.' });
  }
};
