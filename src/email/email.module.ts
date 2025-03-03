import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule
  ],
  providers: [
    {
      provide: 'EMAIL_TEMPLATES_DIR',
      useValue: join(__dirname, '..', 'src', 'email', 'templates'),
    },
    EmailService
  ],
  exports: [EmailService],
})
export class EmailModule {} 