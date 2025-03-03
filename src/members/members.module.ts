import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminModule } from '../admin/admin.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    AdminModule,
    EmailModule,
  ],
  controllers: [MembersController],
  providers: [MembersService, PrismaService],
})
export class MembersModule {} 