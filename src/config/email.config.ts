import { registerAs } from '@nestjs/config';
import { EmailConfig } from '../email/types/email-config.type';

export default registerAs('email', (): EmailConfig => ({
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.EMAIL_FROM,
})); 