// ⚠️ NOT CURRENTLY USED — requires Razorpay API Key ID + Secret, which this
// account does not have yet. Kept here in case you get full API access later.
// The active flow is api/book-discovery-call.js + discovery-modal.js.
// Creates a Razorpay Payment Link for the Discovery Call and hands the
// short_url back to the frontend to redirect the browser to.
//
// The form data (name/phone/email/requirement) is stored inside Razorpay's
// own "notes" field on the payment link -- this avoids needing a database:
// the same data comes back automatically in the webhook payload once paid.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, requirement } = req.body || {};

  if (!name || !phone || !email || !requirement) {
    return res.status(400).json({ error: 'All fields (name, phone, email, requirement) are required.' });
  }

  // Basic email sanity check -- reject obviously invalid input before
  // creating a payment link for it.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const siteUrl = process.env.SITE_URL; // e.g. https://mochastorylab.com  (no trailing slash)

  if (!keyId || !keySecret || !siteUrl) {
    console.error('Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / SITE_URL env vars');
    return res.status(500).json({ error: 'Payment is not configured yet. Please try again later.' });
  }

  try {
    const razorpayRes = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: 199900, // Rs. 1,999.00 in paise
        currency: 'INR',
        accept_partial: false,
        description: '30-Minute Discovery Call - Brand Storytelling Solutions',
        customer: {
          name: name,
          email: email,
          contact: phone,
        },
        notify: { sms: false, email: false }, // we send our own branded emails via webhook
        reminder_enable: true,
        notes: {
          name: name,
          phone: phone,
          email: email,
          requirement: requirement,
        },
        callback_url: `${siteUrl}/payment-successful.html`,
        callback_method: 'get',
      }),
    });

    const data = await razorpayRes.json();

    if (!razorpayRes.ok) {
      console.error('Razorpay error:', data);
      return res.status(500).json({ error: 'Could not create payment link.' });
    }

    return res.status(200).json({ short_url: data.short_url });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return res.status(500).json({ error: 'Could not start payment. Please try again.' });
  }
};
