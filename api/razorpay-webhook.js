// ⚠️ NOT CURRENTLY USED — requires Razorpay API Key ID + Secret, which this
// account does not have yet. Kept here in case you get full API access later.
// The active flow is api/book-discovery-call.js + discovery-modal.js.
// Razorpay calls this endpoint server-to-server the moment a payment on
// the Discovery Call payment link succeeds (event: payment_link.paid).
// This is what actually sends both emails -- NOT the browser redirect --
// so a booking is never lost even if the customer closes the tab right
// after paying.
//
// Configure this URL as a Webhook in Razorpay Dashboard -> Settings ->
// Webhooks, subscribed to the "payment_link.paid" event, and set the same
// secret there as RAZORPAY_WEBHOOK_SECRET below.

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Body parsing must be disabled so we can verify the signature against the
// exact raw bytes Razorpay sent -- a re-serialized JSON string will not
// reliably match the signature.
module.exports.config = {
  api: { bodyParser: false },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing RAZORPAY_WEBHOOK_SECRET env var');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const rawBody = await getRawBody(req);
  const signature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (!signature || signature !== expectedSignature) {
    console.error('Invalid Razorpay webhook signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const payload = JSON.parse(rawBody);

  if (payload.event !== 'payment_link.paid') {
    // Acknowledge other events without acting on them.
    return res.status(200).json({ received: true, ignored: payload.event });
  }

  try {
    const paymentLinkEntity = payload.payload.payment_link.entity;
    const paymentEntity = payload.payload.payment.entity;

    const notes = paymentLinkEntity.notes || {};
    const { name, phone, email, requirement } = notes;
    const amountPaid = (paymentEntity.amount / 100).toFixed(2);
    const paymentId = paymentEntity.id;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const whatsappGroupLink = process.env.WHATSAPP_GROUP_LINK || '#';
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;

    // Email to the customer
    const customerHtml = `
      <p><strong>Book a 30 minutes discovery call for your brand storytelling solutions @ Rs 1999.</strong></p>
      <p>Hi ${name || 'there'},</p>
      <p>Your payment of Rs. ${amountPaid} was successful and your 30-minute Discovery Call for Brand Storytelling Solutions is confirmed.</p>
      <p>Join our WhatsApp group here: <a href="${whatsappGroupLink}">${whatsappGroupLink}</a></p>
      <p>We'll be in touch shortly to lock in your call time.</p>
      <p>Best regards,<br>Mocha Story Lab</p>
    `;

    await transporter.sendMail({
      from: `"Mocha Storylab" <${process.env.SMTP_EMAIL}>`,
      replyTo: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Payment Successful - Your Discovery Call is Booked',
      html: customerHtml,
    });

    // Email to the business owner / admin with full lead details
    const adminHtml = `
      <p><strong>New Discovery Call booking - payment received.</strong></p>
      <ul>
        <li><strong>Name:</strong> ${name || '-'}</li>
        <li><strong>Phone:</strong> ${phone || '-'}</li>
        <li><strong>Email:</strong> ${email || '-'}</li>
        <li><strong>Requirement:</strong> ${requirement || '-'}</li>
        <li><strong>Amount paid:</strong> Rs. ${amountPaid}</li>
        <li><strong>Payment ID:</strong> ${paymentId}</li>
      </ul>
    `;

    await transporter.sendMail({
      from: `"Mocha Storylab Bookings" <${process.env.SMTP_EMAIL}>`,
      to: adminEmail,
      subject: `New Discovery Call Booking - ${name || 'Unknown'} - Payment Received`,
      html: adminHtml,
    });

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling Razorpay webhook:', error);
    // Still return 200 so Razorpay doesn't endlessly retry on our bug;
    // check server logs to catch failures manually while testing.
    return res.status(200).json({ received: true, error: 'internal_error' });
  }
};
