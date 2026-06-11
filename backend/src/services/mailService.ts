import nodemailer from 'dotenv';
import nodemailerLib from 'nodemailer';

export class MailService {
  private static transporter: any = null;

  static initialize() {
    const key = process.env.EMAIL_SERVICE_KEY;
    if (key) {
      try {
        // Standard SMTP transport configuration using key/credentials
        this.transporter = nodemailerLib.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER || 'ecowise.platform@gmail.com',
            pass: key
          }
        });
        console.log('Nodemailer SMTP Transporter initialized successfully.');
      } catch (error) {
        console.error('Failed to initialize Nodemailer. Operating in Log-only mode.', error);
      }
    } else {
      console.log('No EMAIL_SERVICE_KEY specified. Email Service running in Console-Log mode.');
    }
  }

  /**
   * Send Email Template
   */
  static async sendMail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    if (!this.transporter) {
      this.initialize();
    }

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: '"EcoWise AI" <ecowise.platform@gmail.com>',
          to,
          subject,
          html: htmlContent
        });
        return true;
      } catch (error) {
        console.error(`Failed to send email to ${to} via SMTP:`, error);
      }
    }

    // Console logging fallback
    console.log(`\n--- [OUTBOUND EMAIL SEND SIMULATED] ---`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body Snippet: ${htmlContent.substring(0, 300)}...`);
    console.log(`---------------------------------------\n`);
    return true;
  }

  /**
   * Send Weekly Sustainability Report
   */
  static async sendWeeklyReport(to: string, userName: string, stats: { co2Saved: number; carbonScore: number; streak: number }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #10b981; text-align: center;">Your EcoWise Weekly Report 🌿</h2>
        <p>Hi ${userName},</p>
        <p>Here is your sustainability summary for this week. Every small choice counts!</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 10px;"><strong>Carbon Score:</strong> ${stats.carbonScore} / 100</li>
            <li style="margin-bottom: 10px;"><strong>CO₂ Saved:</strong> ${stats.co2Saved} kg</li>
            <li style="margin-bottom: 10px;"><strong>Eco Streak:</strong> ${stats.streak} days 🔥</li>
          </ul>
        </div>
        <p>Keep logging your habits to earn more badges and rise up the community leaderboards.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:5173/dashboard" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Full Dashboard</a>
        </div>
      </div>
    `;
    return this.sendMail(to, 'EcoWise Weekly Summary - Keep up the Green Streak!', html);
  }
}
