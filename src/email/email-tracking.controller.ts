import { Controller, Get, Post } from '@nestjs/common';
import { EmailTemplateService } from './email-template.service';
import { ResendTrackingService } from './resend-tracking.service';

@Controller('email-tracking')
export class EmailTrackingController {
  constructor(
    private readonly emailTemplateService: EmailTemplateService,
    private readonly resendTrackingService: ResendTrackingService,
  ) {}

  @Get('/emails')
  async getAllEmailTemplates() {
    return this.emailTemplateService.getAllEmailTemplates();
  }

  @Post('/sync-emails')
  async syncEmails() {
    await this.resendTrackingService.updateEmailStatuses();
    return {
      success: true,
      message: 'Email statuses updated successfully'
    };
  }

  @Get('/sent-emails')
  async getAllSentEmails() {
    const trackedEmails = await this.emailTemplateService.getAllSentEmails();
    return {
      success: true,
      data: trackedEmails
    };
  }

  @Post('/retrieve-emails')
  async retrieveEmails() {
    return this.resendTrackingService.retrieveAllEmails();
  }

  @Get('/member-emails')
  async getAllMemberEmails() {
    return this.resendTrackingService.getAllMemberEmails();
  }
} 