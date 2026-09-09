require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function testEmail() {
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

    console.log("Sending email to devdeveloper883@gmail.com...");
    let info = await transporter.sendMail({
      from: `"Mocha Storylab" <${process.env.SMTP_EMAIL}>`,
      replyTo: process.env.SMTP_EMAIL,
      to: 'devdeveloper883@gmail.com',
      subject: "The 3 Stories Every Leader Must Tell - Your Playbook",
      text: "Hello,\n\nThank you for requesting The 3 Stories Every Leader Must Tell.\n\nThis 15-minute playbook is trusted by teams at Google, Tata & Forbes. We've designed it to help you filter out the noise and transform your brand presence through the power of deliberate storytelling.\n\nYour PDF Playbook is attached to this email.\n\nBest regards,\nMocha Storylab",
      html: htmlTemplate,
      attachments: [
        {
          filename: 'mocha_legend_playbook_booklet_updated.pdf',
          path: pdfPath
        }
      ]
    });
    console.log("Success! Message ID:", info.messageId);
  } catch (error) {
    console.error("Error:", error);
  }
}

testEmail();
