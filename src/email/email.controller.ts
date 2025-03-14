import { Controller, Get, Param, Logger, HttpException, HttpStatus, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResendTrackingService } from './resend-tracking.service';
import { EmailService } from './email.service';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';

@ApiTags('email-tracking')
@Controller('email-tracking')
export class EmailTrackingController {
  private readonly logger = new Logger(EmailTrackingController.name);
  
  constructor(
    private readonly resendTrackingService: ResendTrackingService,
    private readonly emailService: EmailService
  ) {}

  @Get('emails/:emailId')
  @ApiOperation({ summary: 'Get details of a specific email' })
  @ApiResponse({ status: 200, description: 'Email details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async getEmailDetails(@Param('emailId') emailId: string) {
    try {
      const data = await this.resendTrackingService.getEmailDetails(emailId);
      return { success: true, data };
    } catch (error) {
      this.logger.error(`Failed to get email details: ${error.message}`);
      throw new HttpException(
        error.response?.message || 'Failed to fetch email details',
        error.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

@ApiTags('email')
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send email to one or multiple recipients' })
  @ApiResponse({ status: 200, description: 'Emails sent successfully' })
  async sendBulk(@Body() dto: SendBulkEmailDto) {
    // Handle single recipient case
    if (typeof dto.to === 'string') {
      dto.to = [dto.to];
    }
    
    return await this.emailService.sendBulkEmail(dto);
  }
} 