import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, EmailService],
  exports: [AdminService],
})
export class AdminModule {} 