import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { name, phone, email, subject, message } = req.body || {};
  if (!name || !(phone || email)) {
    return res.status(400).json({ error: 'Name and a phone or email are required.' });
  }

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"SR Tours Website" <${process.env.SMTP_USER}>`,
        to: process.env.MAIL_TO || 'srtravelsrajesh@gmail.com',
        replyTo: email || undefined,
        subject: `New Enquiry from ${name}${subject ? ' - ' + subject : ''}`,
        text: [
          `Name: ${name}`,
          `Email: ${email || 'N/A'}`,
          `Phone/Details: ${phone || subject || 'N/A'}`,
          `Message:\n${message || 'N/A'}`,
          `\nSubmitted: ${new Date().toISOString()}`,
        ].join('\n'),
      });
      return res.status(200).json({
        ok: true,
        emailed: true,
        message: 'Thank you! Your message has been emailed to SR Tours and we will contact you shortly.',
      });
    } catch (err) {
      console.error('Mail send failed:', err.message);
      return res.status(500).json({ error: 'Email delivery failed. Please call +91 9884300373 / 9884050506.' });
    }
  }

  return res.status(200).json({
    ok: true,
    emailed: false,
    message: 'Thank you! Your enquiry has been received. We will contact you shortly.',
  });
}
