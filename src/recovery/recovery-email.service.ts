import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Injectable()
export class RecoveryEmailService {
  private readonly logger = new Logger(RecoveryEmailService.name);

  constructor(private emailService: EmailService) {}

  async sendRecoveryEmail(email: string, recoveryLink: string) {
    try {
      // Extract token from recoveryLink
      const token = recoveryLink.split('token=')[1];

      await this.emailService.sendTemplatedEmail(
        'recovery-email',  // template name
        { token },         // template data
        {
          to: email,
          subject: 'Complete Your SUGRiA Profile',
          replyTo: 'support@sugria.com',
          tags: [
            { name: 'email_type', value: 'recovery' },
            { name: 'user_id', value: email.replace(/[^a-zA-Z0-9_-]/g, '_') }
          ]
        }
      );

      this.logger.log(`Recovery email sent to ${email} with token ${token}`);
    } catch (error) {
      this.logger.error(`Failed to send recovery email to ${email}:`, error);
      throw error;
    }
  }
} 