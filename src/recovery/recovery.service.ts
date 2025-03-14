import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RecoveryEmailService } from './recovery-email.service';
import { randomUUID } from 'crypto';

@Injectable()
export class RecoveryService {
  private readonly logger = new Logger(RecoveryService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private recoveryEmailService: RecoveryEmailService,
  ) {}

  async bulkCreateRecoveryEntries(entries: { email: string; type: 'application' | 'join-movement' }[]) {
    const results = {
      success: [],
      failed: [],
    };

    for (const entry of entries) {
      try {
        await this.prisma.recovery.create({
          data: {
            email: entry.email,
            type: entry.type,
            token: this.generateToken(),
          },
        });
        results.success.push(entry.email);
      } catch (error) {
        if (error.code === 'P2002') {
          this.logger.warn(`Email ${entry.email} already exists in recovery`);
        }
        results.failed.push({ email: entry.email, error: error.message });
      }
    }

    return results;
  }

  // Get all pending recovery entries
  async getPendingRecoveries() {
    return await this.prisma.recovery.findMany({
      where: {
        status: 'pending'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Send invites to selected emails
  async sendSelectedRecoveryInvites(emails: string[]) {
    const results = {
      success: [],
      failed: [],
      tokens: {}
    };

    try {
      // Get all pending recoveries that haven't been recovered yet
      let recoveriesToProcess = await this.prisma.recovery.findMany({
        where: {
          AND: [
            {
              status: 'pending',  // Only pending status
            },
            emails.length > 0 ? { 
              email: { in: emails } // If emails provided, filter by them
            } : {},
          ]
        },
        select: {
          email: true,
          token: true,
          status: true
        }
      });

      if (recoveriesToProcess.length === 0) {
        return {
          success: [],
          failed: [],
          tokens: {},
          message: 'No pending invites found to process'
        };
      }

      this.logger.log(`Found ${recoveriesToProcess.length} pending recoveries to process`);

      for (const recovery of recoveriesToProcess) {
        try {
          this.logger.log(`Processing recovery invite for email: ${recovery.email} with token ${recovery.token}`);

          const recoveryLink = `https://www.sugria.com/update?token=${recovery.token}`;
          
          await this.recoveryEmailService.sendRecoveryEmail(recovery.email, recoveryLink);

          await this.prisma.recovery.update({
            where: { email: recovery.email },
            data: { status: 'invited' },
          });

          results.success.push(recovery.email);
          results.tokens[recovery.email] = recovery.token;
        } catch (error) {
          this.logger.error(`Failed to send recovery invite to ${recovery.email}:`, error);
          results.failed.push({ 
            email: recovery.email, 
            error: error.message 
          });
        }
      }

      return {
        success: results.success,
        failed: results.failed,
        tokens: results.tokens,
        message: `Successfully sent ${results.success.length} invites, ${results.failed.length} failed`
      };
    } catch (error) {
      this.logger.error('Failed to process recovery invites:', error);
      throw new BadRequestException(error.message);
    }
  }

  async validateRecoveryToken(token: string) {
    // Test token for development
    if (token === 'test-token-123') {
      return {
        email: 'test@example.com',
        type: 'join-movement',
      };
    }

    const recovery = await this.prisma.recovery.findUnique({
      where: { token },
      select: {
        email: true,
        type: true,
        status: true
      }
    });

    if (!recovery) {
      throw new Error('Invalid recovery token');
    }

    if (recovery.status === 'recovered') {
      throw new Error('This recovery link has already been used');
    }

    return {
      email: recovery.email,
      type: recovery.type,
    };
  }

  async completeRecovery(token: string, data: any) {
    const recovery = await this.prisma.recovery.findUnique({
      where: { token },
    });

    if (!recovery) {
      throw new Error('Invalid recovery token');
    }

    if (recovery.status === 'recovered') {
      throw new Error('This recovery link has already been used');
    }

    if (recovery.type !== 'join-movement') {
      throw new Error('Invalid recovery type');
    }

    try {
      // Create member record with the original email
      await this.prisma.member.create({
        data: {
          ...data,
          email: recovery.email, // Use the original email from recovery
        },
      });

      // Update recovery status
      await this.prisma.recovery.update({
        where: { token },
        data: { status: 'recovered' },
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to complete recovery:', error);
      throw error;
    }
  }

  async createBulkRecoveries(entries: { email: string; type: string }[]) {
    const results = {
      success: [],
      failed: []
    };

    for (const entry of entries) {
      try {
        await this.prisma.recovery.create({
          data: {
            email: entry.email,
            type: entry.type,
            token: this.generateToken(),
            status: 'pending'
          }
        });
        results.success.push(entry.email);
      } catch (error) {
        this.logger.error(`Failed to create recovery for ${entry.email}:`, error);
        results.failed.push({
          email: entry.email,
          error: error.message
        });
      }
    }

    return results;
  }

  generateToken(): string {
    return randomUUID();
  }
} 