import nodemailer from 'nodemailer';
import { EmailProvider, EmailOptions } from './index';

export class SMTPProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor(config: {
    host: string;
    port: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }) {
    this.transporter = nodemailer.createTransport(config);
  }

  async send(options: EmailOptions): Promise<void> {
    await this.transporter.sendMail({
      to: options.to,
      from: options.from || process.env.MAIL_FROM!,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}