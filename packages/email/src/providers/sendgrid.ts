import sgMail from '@sendgrid/mail';
import { EmailProvider, EmailOptions } from './index';

export class SendGridProvider implements EmailProvider {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async send(options: EmailOptions): Promise<void> {
    await sgMail.send({
      to: options.to,
      from: options.from || process.env.MAIL_FROM!,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}