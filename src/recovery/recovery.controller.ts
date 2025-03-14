import { Controller, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecoveryService } from './recovery.service';

@ApiTags('recovery')
@Controller('recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Post('bulk-create')
  @ApiOperation({ summary: 'Create recovery entries for lost emails' })
  async createBulkRecoveries(@Body() data: { entries: { email: string; type: string }[] }) {
    return await this.recoveryService.createBulkRecoveries(data.entries);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending recovery entries' })
  async getPending() {
    return this.recoveryService.getPendingRecoveries();
  }

  @Post('send-invites')
  @ApiOperation({ summary: 'Send recovery invites to selected emails' })
  @ApiResponse({
    status: 200,
    description: 'Recovery invites sent successfully',
    schema: {
      example: {
        success: ['email1@example.com', 'email2@example.com'],
        failed: [{ email: 'invalid@example.com', error: 'Error message' }],
        tokens: {
          'email1@example.com': 'token1',
          'email2@example.com': 'token2'
        },
        message: 'Successfully sent 2 invites, 1 failed'
      }
    }
  })
  async sendInvites(@Body() body: { emails: string[] }) {
    if (!body?.emails || !Array.isArray(body.emails)) {
      throw new BadRequestException('Please provide an array of emails');
    }
    return this.recoveryService.sendSelectedRecoveryInvites(body.emails);
  }

  @Get('validate/:token')
  @ApiOperation({ summary: 'Validate a recovery token' })
  async validateToken(@Param('token') token: string) {
    return this.recoveryService.validateRecoveryToken(token);
  }

  @Post('complete/:token')
  @ApiOperation({ summary: 'Complete the recovery process' })
  async completeRecovery(
    @Param('token') token: string,
    @Body() data: any
  ) {
    return this.recoveryService.completeRecovery(token, data);
  }
} 