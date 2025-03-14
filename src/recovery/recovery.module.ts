import { Module } from '@nestjs/common';
import { RecoveryService } from './recovery.service';
import { RecoveryController } from './recovery.controller';
import { RecoveryEmailService } from './recovery-email.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    EmailModule,
  ],
  controllers: [RecoveryController],
  providers: [RecoveryService, RecoveryEmailService],
})
export class RecoveryModule {} 