import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailTemplateService {
  private readonly templatesDir: string;
  private readonly templates: Map<string, Handlebars.TemplateDelegate> = new Map();
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(private configService: ConfigService, private prisma: PrismaService) {
    this.templatesDir = join(process.cwd(), 'src/email/templates');
    this.loadTemplates();
  }

  private loadTemplates() {
    const templates = [
      'welcome-email',
      'custom-email',
      'recovery-email',
      'update-confirmation',
      // Add other templates here when they're created
    ];
    
    templates.forEach(templateName => {
      try {
        const templatePath = join(this.templatesDir, `${templateName}.hbs`);
        const templateContent = readFileSync(templatePath, 'utf-8');
        this.templates.set(templateName, Handlebars.compile(templateContent));
        this.logger.log(`Loaded email template: ${templateName}`);
      } catch (error) {
        this.logger.error(`Failed to load template ${templateName}:`, error);
      }
    });
  }

  compileTemplate(contentOrName: string, data: Record<string, any>): string {
    // First try to get a pre-loaded template
    const preloadedTemplate = this.templates.get(contentOrName);
    if (preloadedTemplate) {
      return preloadedTemplate(data);
    }

    // If not found, treat the input as raw content
    const template = Handlebars.compile(contentOrName);
    return template(data);
  }

  async getAllEmailTemplates() {
    try {
      this.logger.log('[Email Tracking] Getting all email templates - Start');
      
      const templates = await this.prisma.emailTemplate.findMany();

      return {
        success: true,
        data: templates
      };
    } catch (error) {
      this.logger.error('[Email Tracking] Getting all email templates - Error:', error);
      throw error;
    }
  }

  async getAllSentEmails() {
    try {
      this.logger.log('[Email Tracking] Getting all sent emails - Start');
      
      // Get all tracked emails
      const sentEmails = await this.prisma.emailTracking.findMany({
        select: {
          id: true,
          recipientEmail: true,
          sentAt: true,
          status: true,
          emailTemplateId: true,
        }
      });

      // Get all templates for lookup
      const templates = await this.prisma.emailTemplate.findMany();
      const templateMap = new Map(templates.map(t => [t.id, t]));

      // Map the results
      const mappedEmails = sentEmails.map(email => {
        const template = email.emailTemplateId ? templateMap.get(email.emailTemplateId) : null;
        return {
          id: email.id,
          recipientEmail: email.recipientEmail,
          sentAt: email.sentAt,
          status: email.status,
          templateName: template?.name || 'custom-email',
          subject: template?.subject || 'Custom Email'
        };
      });

      return {
        success: true,
        data: mappedEmails
      };
    } catch (error) {
      this.logger.error('[Email Tracking] Getting all sent emails - Error:', error);
      throw error;
    }
  }

  async getTemplateByName(templateName: string) {
    try {
      const template = await this.prisma.emailTemplate.findUnique({
        where: { name: templateName }
      });

      if (!template) {
        // Fallback to file system if not in database
        const templatePath = join(this.templatesDir, `${templateName}.hbs`);
        const content = readFileSync(templatePath, 'utf-8');
        return { content, name: templateName };
      }

      return template;
    } catch (error) {
      this.logger.error(`Failed to get template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }
} 