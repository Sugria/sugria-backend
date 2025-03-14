import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailTrackingController } from './email-tracking.controller';
import { EmailTemplateService } from './email-template.service';
import { ResendTrackingService } from './resend-tracking.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [EmailController, EmailTrackingController],
  providers: [EmailService, EmailTemplateService, ResendTrackingService],
  exports: [EmailService],
})
export class EmailModule {} 