import { Module } from '@nestjs/common';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from '../common/services/storage.service';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [ProgramsController],
  providers: [ProgramsService, StorageService],
})
export class ProgramsModule {} 