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
import { ResendTrackingService } from './resend-tracking.service';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { EmailTemplateService } from './email-template.service';

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
    private resendTrackingService: ResendTrackingService,
    private emailTemplateService: EmailTemplateService,
  ) {
    this.isDevelopment = this.configService.get('NODE_ENV') === 'development';
    const emailConfig = this.configService.get<EmailConfig>('email');
    this.apiKey = emailConfig.apiKey;
    this.fromEmail = 'SUGRiA Team <no-reply@sugria.com>';
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
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
    templateData: Record<string, any>,
    options: {
      to: string;
      subject: string;
      replyTo?: string;
      tags?: { name: string; value: string }[];
    }
  ) {
    try {
      const template = await this.emailTemplateService.getTemplateByName(templateName);
      const html = this.emailTemplateService.compileTemplate(template.content, templateData);

      const { data } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [options.to],
        subject: options.subject,
        html: html,
        replyTo: options.replyTo || 'support@sugria.com',
        tags: options.tags
      });

      // Track the email
      await this.resendTrackingService.trackEmail(data.id, options.to);

      this.logger.log(`Email sent successfully to ${options.to}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    const { data } = await this.resend.emails.send({
      from: this.configService.get('EMAIL_FROM'),
      to,
      subject,
      html,
    });

    // Track the email after sending
    await this.resendTrackingService.trackEmail(data.id, to);

    return data;
  }

  async sendBulkEmail(dto: SendBulkEmailDto): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    results: Array<{ email: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{ email: string; success: boolean; error?: string }> = [];
    let sent = 0;
    let failed = 0;

    try {
      // Get the template
      const template = this.getTemplate('custom-email');

      // Process each recipient
      for (const recipient of dto.to) {
        try {
          // Render template with the custom content
          const html = template({
            content: dto.templateData.content || '',
          });

          // Send email
          const { data } = await this.resend.emails.send({
            from: this.configService.get('EMAIL_FROM'),
            to: recipient,
            subject: dto.subject,
            html,
          });

          // Track the email
          if (this.resendTrackingService) {
            await this.resendTrackingService.trackEmail(
              data.id,
              recipient
            );
          }

          results.push({ email: recipient, success: true });
          sent++;
        } catch (error) {
          this.logger.error(`Failed to send email to ${recipient}:`, error);
          results.push({
            email: recipient,
            success: false,
            error: error.message
          });
          failed++;
        }
      }

      return {
        success: true,
        sent,
        failed,
        results
      };
    } catch (error) {
      this.logger.error('Bulk email sending failed:', error);
      throw error;
    }
  }
} 