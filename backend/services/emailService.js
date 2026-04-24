const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  async sendEmail(to, subject, html) {
    try {
      if (!process.env.SMTP_USER) {
        console.warn('SMTP not configured, skipping email');
        return null;
      }

      const info = await this.getTransporter().sendMail({
        from: `"SocietyCare" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      console.error('Email send error:', error.message);
      return null;
    }
  }

  async sendOTP(email, otp) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">SocietyCare - OTP Verification</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #1f2937; letter-spacing: 8px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `;
    return this.sendEmail(email, 'SocietyCare - OTP Verification', html);
  }

  async sendPaymentReminder(email, name, amount, dueDate, month) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">SocietyCare - Payment Reminder</h2>
        <p>Dear ${name},</p>
        <p>This is a reminder that your maintenance payment for <strong>${month}</strong> is due.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Please make the payment at your earliest convenience to avoid late fees.</p>
        <p style="color: #6b7280; font-size: 12px;">This is an automated reminder from SocietyCare.</p>
      </div>
    `;
    return this.sendEmail(email, `Payment Reminder - Maintenance Fee for ${month}`, html);
  }

  async sendPaymentReceipt(email, name, paymentDetails) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a;">SocietyCare - Payment Receipt</h2>
        <p>Dear ${name},</p>
        <p>Your payment has been received successfully.</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
          <p><strong>Receipt #:</strong> ${paymentDetails.id}</p>
          <p><strong>Amount:</strong> ₹${paymentDetails.totalAmount}</p>
          <p><strong>Month:</strong> ${paymentDetails.month}</p>
          <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
          <p><strong>Date:</strong> ${paymentDetails.paidAt}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">Thank you for your timely payment.</p>
      </div>
    `;
    return this.sendEmail(email, `Payment Receipt - ${paymentDetails.month}`, html);
  }
}

module.exports = new EmailService();
