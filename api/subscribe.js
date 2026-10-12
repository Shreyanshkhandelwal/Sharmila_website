const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  // Add CORS headers so it can be called from the frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const htmlTemplate = fs.readFileSync(path.join(process.cwd(), 'email-template.html'), 'utf-8');
    const pdfPath = path.join(process.cwd(), 'mocha_legend_playbook_booklet_updated.pdf');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: `"Mocha Story lab" <${process.env.SMTP_EMAIL}>`,
      replyTo: process.env.SMTP_EMAIL,
      to: email,
      subject: "The 3 Stories Every Leader Must Tell - Your Playbook",
      text: "Hello,\n\nThank you for requesting The 3 Stories Every Leader Must Tell.\n\nThis 15-minute playbook is trusted by teams at Google, Tata & Forbes. We've designed it to help you filter out the noise and transform your brand presence through the power of deliberate storytelling.\n\nYou can access your Playbook via this Google Drive link: https://drive.google.com/file/d/1U0R1gtOmBNDPbpMcYOIWQ4Mfv-fA1tb8/view?usp=sharing\n\nBest regards,\nMocha Storylab",
      html: htmlTemplate,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-Mailer': 'Apple Mail (2.3654.3.0)', 
        'Message-ID': `<${Date.now()}-${Math.random().toString(36).substring(2, 10)}@gmail.com>`
      }
    });

    // Option to record in Google Sheet if configured
    if (process.env.GOOGLE_SHEET_WEBAPP_URL && process.env.GOOGLE_SHEET_WEBAPP_URL.trim() !== '') {
      try {
        console.log("Sending data to Google Sheets URL...");
        
        // Use GET with query parameters to avoid POST redirect/auth drops
        const sheetUrl = new URL(process.env.GOOGLE_SHEET_WEBAPP_URL.trim());
        sheetUrl.searchParams.append("email", email);
        sheetUrl.searchParams.append("phone", req.body.phone || '');
        sheetUrl.searchParams.append("source", req.body.source || 'Unknown');

        const response = await fetch(sheetUrl.toString(), {
          method: 'GET',
          redirect: 'manual'
        });
        
        console.log("Google Sheets response status:", response.status);
      } catch (sheetError) {
        console.error("Error saving to Google Sheet: ", sheetError);
        // Continue regardless of sheet error so user still gets success response
      }
    } else {
      console.warn("GOOGLE_SHEET_WEBAPP_URL is not set in environment variables! Skipping sheet integration.");
    }

    return res.status(200).json({ message: 'Playbook sent successfully!' });
  } catch (error) {
    console.error("Error sending email: ", error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
