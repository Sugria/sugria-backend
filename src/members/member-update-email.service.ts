import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { UpdateMemberDto } from './dto/update-member.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class MemberUpdateEmailService {
  private readonly logger = new Logger(MemberUpdateEmailService.name);
  private readonly resend: Resend;
  private readonly template: Handlebars.TemplateDelegate;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
    
    // Load template
    const templatePath = path.join(process.cwd(), 'src/email/templates/member-update-confirmation.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    this.template = Handlebars.compile(templateContent);
  }

  async sendUpdateConfirmation(email: string, memberData: UpdateMemberDto) {
    try {
      // Compile template with data
      const html = this.template({
        firstName: memberData.firstName,
        workEmail: memberData.workEmail,
        phoneNumber: memberData.phoneNumber,
        residentialAddress: memberData.residentialAddress,
      });

      const { data, error } = await this.resend.emails.send({
        from: 'SUGRiA <no-reply@sugria.com>',
        to: [email],
        subject: 'SUGRiA Profile Updated Successfully',
        html,
        tags: [
          { name: 'email_type', value: 'profile_update' },
          { name: 'user_id', value: email.replace(/[^a-zA-Z0-9_-]/g, '_') }
        ]
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      this.logger.log(`Update confirmation email sent to ${email}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to send update confirmation email to ${email}:`, error);
      throw error;
    }
  }
} 