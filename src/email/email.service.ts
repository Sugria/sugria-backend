import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EmailConfig } from './types/email-config.type';
import { 
  EmailResponse, 
  ResendEmailResponse, 
  EmailErrorResponse,
  ResendErrorResponse 
} from './types/email-response.type';
import { join } from 'path';
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { Resend } from 'resend';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly isDevelopment: boolean;
  private readonly fromEmail: string;
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.resend.com';
  private readonly resend: Resend;
  private readonly templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(
    private configService: ConfigService,
  ) {
    this.isDevelopment = this.configService.get('NODE_ENV') === 'development';
    const emailConfig = this.configService.get<EmailConfig>('email');
    this.apiKey = emailConfig.apiKey;
    this.fromEmail = emailConfig.from;
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.loadTemplates().catch(err => {
      this.logger.error('Failed to load email templates:', err);
    });
  }

  async onModuleInit() {
    if (this.isDevelopment) {
      this.logger.log('Development mode: Emails will be logged to console');
    }
  }

  private async loadTemplates() {
    const templatesDir = join(__dirname, '..', '..', 'src', 'email', 'templates');
    try {
      const files = await fs.readdir(templatesDir);
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '');
          const templateContent = await fs.readFile(join(templatesDir, file), 'utf-8');
          this.templates.set(templateName, handlebars.compile(templateContent));
          this.logger.log(`Loaded email template: ${templateName}`);
        }
      }
      this.logger.log(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      this.logger.error('Error loading templates:', error);
      throw error;
    }
  }

  private getTemplate(name: string): HandlebarsTemplateDelegate {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template ${name} not found`);
    }
    return template;
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
    try {
      const template = this.getTemplate(templateName);
      const html = template(data);

      if (this.isDevelopment) {
        this.logger.debug('Email would have been sent in production:');
        this.logger.debug(`From: ${options.from || this.fromEmail}`);
        this.logger.debug(`To: ${options.to}`);
        this.logger.debug(`Subject: ${options.subject}`);
        this.logger.debug('HTML Content:', html);
        return { id: 'dev-mode-email-id' };
      }

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
        throw new Error(`Failed to send email: ${resendError.message}`);
      }

      this.logger.error(`Failed to send email: ${error.message}`);
      throw new Error('Failed to send email');
    }
  }
} 