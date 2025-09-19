export interface EmailProvider {
  send(options: EmailOptions): Promise<void>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export class MockEmailProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<void> {
    console.log('📧 Mock email sent:', {
      to: options.to,
      subject: options.subject,
      from: options.from,
    });
  }
}

export * from './sendgrid';
export * from './smtp';