// Sends the two booking emails — called ONLY from payment-successful.html,
// after Razorpay has confirmed a completed payment via redirect.
// No Razorpay API keys required; uses SMTP_EMAIL / SMTP_PASSWORD /
// ADMIN_EMAIL / WHATSAPP_GROUP_LINK from environment variables.

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, requirement, razorpay_payment_id } = req.body || {};

  if (!name || !phone || !email || !requirement) {
    return res.status(400).json({ error: 'All fields (name, phone, email, requirement) are required.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpEmail || !smtpPassword) {
    console.error('Missing SMTP_EMAIL / SMTP_PASSWORD env vars');
    return res.status(500).json({ error: 'Booking is not configured yet. Please try again later.' });
  }

  const whatsappGroupLink = process.env.WHATSAPP_GROUP_LINK || '#';
  const adminEmail = process.env.ADMIN_EMAIL || smtpEmail;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpEmail, pass: smtpPassword },
    });

    // Email to the customer
    const customerHtml = `
      <p><strong>Book a 45 minutes discovery call for your brand storytelling solutions @ Rs 1999.</strong></p>
      <p>Hi ${name},</p>
      <p>Your payment of Rs. 1,999 is confirmed and your 45-minute Discovery Call for Brand Storytelling Solutions is booked!</p>
      <p>Join our WhatsApp group here: <a href="${whatsappGroupLink}">${whatsappGroupLink}</a></p>
      <p>We'll be in touch shortly to lock in your call time.</p>
      <p>Best regards,<br>Mocha Story Lab</p>
    `;

    await transporter.sendMail({
      from: `"Mocha Storylab" <${smtpEmail}>`,
      replyTo: smtpEmail,
      to: email,
      subject: 'Your Discovery Call Booking is Confirmed',
      html: customerHtml,
    });

    // Email to the business owner / admin with full lead details
    const adminHtml = `
      <p><strong>New PAID Discovery Call booking.</strong></p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Phone:</strong> ${phone}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Requirement:</strong> ${requirement}</li>
        <li><strong>Razorpay Payment ID:</strong> ${razorpay_payment_id || 'Not provided'}</li>
      </ul>
      <p>You can verify this payment ID in your Razorpay Dashboard → Payments.</p>
    `;

    await transporter.sendMail({
      from: `"Mocha Storylab Bookings" <${smtpEmail}>`,
      to: adminEmail,
      subject: `New Discovery Call Lead - ${name}`,
      html: adminHtml,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending booking emails:', error);
    return res.status(500).json({ error: 'Could not process booking. Please try again.' });
  }
};
