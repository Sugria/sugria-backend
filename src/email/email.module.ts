import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';

@Global() // Make the module global
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {} 