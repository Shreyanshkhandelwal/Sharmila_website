const { test } = require('node:test');
const assert = require('node:assert/strict');
const mail = require('nodemailer');
const handler = require('./api/magazine');

async function request(method, body) {
  const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  await handler({ method, body }, res);
  return res;
}
test('magazine signup and payment configuration', async () => {
  const original = { ...process.env };
  const createTransport = mail.createTransport;
  try {
    assert.equal((await request('DELETE')).code, 405);
    for (const email of [undefined, {}, 'invalid', 'a@example.com\r\nBcc: b@example.com']) {
      assert.equal((await request('POST', { email })).code, 400);
    }
    delete process.env.SMTP_EMAIL;
    assert.equal((await request('POST', { email: 'reader@example.com' })).code, 503);
    process.env.MAGAZINE_MONTHLY_PAYMENT_LINK = 'https://evil.example/payment';
    process.env.MAGAZINE_YEARLY_PAYMENT_LINK = 'https://pages.razorpay.com/yearly';
    assert.deepEqual((await request('GET')).data, { monthly: null, yearly: 'https://pages.razorpay.com/yearly' });
    process.env.SMTP_EMAIL = 'sender@example.com';
    process.env.SMTP_PASSWORD = 'test-only';
    let sent;
    mail.createTransport = () => ({ sendMail: async message => { sent = message; } });
    const result = await request('POST', { email: ' reader@example.com ' });
    assert.equal(result.code, 200);
    assert.match(sent.text, /Reader email: reader@example.com/);
    assert.match(sent.text, /not a paid subscription/);
    mail.createTransport = () => ({ sendMail: async () => { throw new Error('Unavailable'); } });
    assert.equal((await request('POST', { email: 'reader@example.com' })).code, 502);
  } finally {
    mail.createTransport = createTransport;
    for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
  }
});
