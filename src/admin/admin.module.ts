import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
  exports: [AdminService],
})
export class AdminModule {} 