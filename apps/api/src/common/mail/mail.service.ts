import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const RESET_EMAIL_SUBJECT = 'Reset your password';
const RESET_EMAIL_TEXT = (resetLink: string) =>
  `You requested a password reset. Click the link below to set a new password (valid for 1 hour):\n\n${resetLink}\n\nIf you didn't request this, you can ignore this email.`;

interface MailTransport {
  sendMail(
    options: nodemailer.SendMailOptions,
  ): Promise<nodemailer.SentMessageInfo>;
}

@Injectable()
export class MailService {
  private transporter: MailTransport | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      }) as MailTransport;
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendResetLink(to: string, resetLink: string): Promise<void> {
    if (!this.transporter) return;

    const from = process.env.MAIL_FROM ?? process.env.SMTP_USER;

    await this.transporter.sendMail({
      from: from ?? 'noreply@localhost',
      to,
      subject: RESET_EMAIL_SUBJECT,
      text: RESET_EMAIL_TEXT(resetLink),
    });
  }
}
