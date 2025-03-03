import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { createHash } from 'crypto';
import { extname } from 'path';

@Injectable()
export class ProgramsService {
  private readonly logger = new Logger(ProgramsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  private generateApplicationId(): string {
    return `APP${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(-2).toUpperCase()}`;
  }

  private generateSecureFileName(originalName: string, applicationId: string): string {
    const fileExt = extname(originalName);
    const hash = createHash('sha256')
      .update(`${applicationId}-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .slice(0, 12);
    return `${applicationId}-${hash}${fileExt}`;
  }

  async create(createApplicationDto: CreateApplicationDto, files: {
    'grant.budget'?: Express.Multer.File[];
    'motivation.identity'?: Express.Multer.File[];
  }) {
    try {
      if (!files['grant.budget']?.[0] || !files['motivation.identity']?.[0]) {
        throw new BadRequestException('Missing required files');
      }

      const applicationId = this.generateApplicationId();
      
      // Generate secure filenames
      const budgetFileName = this.generateSecureFileName(
        files['grant.budget'][0].originalname,
        applicationId,
      );
      const identityFileName = this.generateSecureFileName(
        files['motivation.identity'][0].originalname,
        applicationId,
      );

      const application = await this.prisma.application.create({
        data: {
          applicationId,
          program: {
            create: {
              category: createApplicationDto.program.category,
              previousTraining: Boolean(createApplicationDto.program.previousTraining),
              trainingId: createApplicationDto.program.trainingId || null,
            },
          },
          personal: {
            create: {
              fullName: createApplicationDto.personal.fullName,
              email: createApplicationDto.personal.email,
              phoneNumber: createApplicationDto.personal.phoneNumber,
              address: createApplicationDto.personal.address,
              gender: createApplicationDto.personal.gender,
              dateOfBirth: new Date(createApplicationDto.personal.dateOfBirth),
            },
          },
          farm: {
            create: {
              location: createApplicationDto.farm.location,
              size: Number(createApplicationDto.farm.size),
              type: createApplicationDto.farm.type,
              practices: createApplicationDto.farm.practices,
              challenges: createApplicationDto.farm.challenges,
            },
          },
          grant: {
            create: {
              outcomes: createApplicationDto.grant.outcomes,
              budgetFile: budgetFileName,
            },
          },
          training: {
            create: {
              preference: createApplicationDto.training.preference,
            },
          },
          motivation: {
            create: {
              statement: createApplicationDto.motivation.statement,
              implementation: createApplicationDto.motivation.implementation,
              identityFile: identityFileName,
            },
          },
          declaration: {
            create: {
              agreed: Boolean(createApplicationDto.declaration.agreed),
              officerName: createApplicationDto.declaration.officerName,
            },
          },
        },
        include: {
          program: true,
          personal: true,
          farm: true,
          grant: true,
          training: true,
          motivation: true,
          declaration: true,
        },
      });

      // Send confirmation email
      try {
        await this.emailService.sendTemplatedEmail(
          'application-confirmation',
          {
            name: application.personal.fullName,
            applicationId: application.applicationId,
            category: application.program.category,
            email: application.personal.email,
            year: new Date().getFullYear(),
          },
          {
            to: application.personal.email,
            subject: 'SUGRiA Program Application Received',
            replyTo: 'programs@sugria.com',
            tags: [
              { name: 'email_type', value: 'application_confirmation' },
              { name: 'application_id', value: application.applicationId }
            ]
          },
        );
      } catch (emailError) {
        this.logger.error('Failed to send confirmation email:', emailError);
        // Continue with the response even if email fails
      }

      return {
        success: true,
        data: {
          applicationId: application.applicationId,
          status: application.status,
          submittedAt: application.submittedAt,
          program: {
            category: application.program.category,
            previousTraining: application.program.previousTraining,
            trainingId: application.program.trainingId,
          },
          personal: {
            fullName: application.personal.fullName,
            email: application.personal.email,
            phoneNumber: application.personal.phoneNumber,
            address: application.personal.address,
            gender: application.personal.gender,
            dateOfBirth: application.personal.dateOfBirth,
          },
          farm: {
            location: application.farm.location,
            size: application.farm.size,
            type: application.farm.type,
            practices: application.farm.practices,
            challenges: application.farm.challenges,
          },
          grant: {
            outcomes: application.grant.outcomes,
            budgetFile: application.grant.budgetFile,
          },
          training: {
            preference: application.training.preference,
          },
          motivation: {
            statement: application.motivation.statement,
            implementation: application.motivation.implementation,
            identityFile: application.motivation.identityFile,
          },
          declaration: {
            agreed: application.declaration.agreed,
            officerName: application.declaration.officerName,
          },
        },
        message: 'Application submitted successfully',
      };
    } catch (error) {
      this.logger.error('Error creating application:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to submit application');
    }
  }
} 