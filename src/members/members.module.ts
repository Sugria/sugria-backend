import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminModule } from '../admin/admin.module';
import { EmailModule } from '../email/email.module';
import { MemberUpdateEmailService } from './member-update-email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AdminModule,
    EmailModule,
    PrismaModule,
    ConfigModule,
  ],
  controllers: [MembersController],
  providers: [MembersService, MemberUpdateEmailService],
})
export class MembersModule {} 