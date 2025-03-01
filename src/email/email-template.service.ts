import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailTemplateService {
  private readonly templatesDir: string;
  private readonly templates: Map<string, Handlebars.TemplateDelegate>;

  constructor(private configService: ConfigService) {
    this.templatesDir = join(process.cwd(), 'src/email/templates');
    this.templates = new Map();
    this.loadTemplates();
  }

  private loadTemplates() {
    const templates = [
      'welcome-email',
      // Add other templates here when they're created
    ];
    
    templates.forEach(templateName => {
      const templatePath = join(this.templatesDir, `${templateName}.hbs`);
      const templateContent = readFileSync(templatePath, 'utf-8');
      this.templates.set(templateName, Handlebars.compile(templateContent));
    });
  }

  compileTemplate(templateName: string, data: any): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    return template(data);
  }
} 