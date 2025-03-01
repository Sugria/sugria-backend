import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EmailTemplateService } from './email-template.service';
import { EmailConfig } from './types/email-config.type';
import { 
  EmailResponse, 
  ResendEmailResponse, 
  EmailErrorResponse,
  ResendErrorResponse 
} from './types/email-response.type';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly isDevelopment: boolean;
  private readonly fromEmail: string;
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.resend.com';

  constructor(
    private configService: ConfigService,
    private emailTemplateService: EmailTemplateService,
  ) {
    this.isDevelopment = this.configService.get('NODE_ENV') === 'development';
    const emailConfig = this.configService.get<EmailConfig>('email');
    this.apiKey = emailConfig.apiKey;
    this.fromEmail = emailConfig.from;
  }

  async onModuleInit() {
    if (this.isDevelopment) {
      this.logger.log('Development mode: Emails will be logged to console');
    }
  }

  async sendTemplatedEmail(
    templateName: string,
    data: any,
    options: {
      to: string;
      subject: string;
      from?: string;
      replyTo?: string | string[];
      cc?: string | string[];
      bcc?: string | string[];
      tags?: Array<{ name: string; value: string }>;
    },
  ): Promise<EmailResponse> {
    const html = this.emailTemplateService.compileTemplate(templateName, data);

    try {
      if (this.isDevelopment) {
        // In development, just log the email
        this.logger.debug('Email would have been sent in production:');
        this.logger.debug(`From: ${options.from || this.fromEmail}`);
        this.logger.debug(`To: ${options.to}`);
        this.logger.debug(`Subject: ${options.subject}`);
        this.logger.debug('HTML Content:', html);
        return { id: 'dev-mode-email-id' };
      }

      // Send email using Resend API
      const response = await axios.post<ResendEmailResponse>(
        `${this.apiUrl}/emails`,
        {
          from: options.from || this.fromEmail,
          to: options.to,
          subject: options.subject,
          html: html,
          reply_to: options.replyTo,
          cc: options.cc,
          bcc: options.bcc,
          tags: options.tags,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.debug(`Email sent successfully to ${options.to}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const resendError = error.response.data as ResendErrorResponse;
        this.logger.error(
          `Failed to send email: ${resendError.message} (${resendError.statusCode})`,
        );
        return {
          id: 'failed-to-send',
          error: resendError.message,
          statusCode: resendError.statusCode,
        };
      }

      this.logger.error(`Failed to send email: ${error.message}`);
      return {
        id: 'failed-to-send',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
} 