import { Injectable, Logger, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { createHash } from 'crypto';
import { extname } from 'path';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { StorageService } from '../common/services/storage.service';

@Injectable()
export class ProgramsService {
  private readonly logger = new Logger(ProgramsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private storageService: StorageService,
  ) {
    // Ensure upload directories exist
    this.initializeUploadDirectories();
  }

  private initializeUploadDirectories() {
    const uploadPaths = [
      join(process.cwd(), 'files'),        // Creates /files
      join(process.cwd(), 'files/budget'), // Creates /files/budget
      join(process.cwd(), 'files/identity')// Creates /files/identity
    ];

    uploadPaths.forEach(path => {
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }
    });
  }

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

  private async checkDuplicateApplication(dto: CreateApplicationDto) {
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        OR: [
          {
            personal: {
              email: dto.personal.email
            }
          },
          {
            personal: {
              phoneNumber: dto.personal.phoneNumber
            }
          },
          {
            AND: [
              {
                personal: {
                  address: dto.personal.address
                }
              },
              {
                personal: {
                  fullName: dto.personal.fullName
                }
              }
            ]
          }
        ]
      },
      include: {
        personal: true,
        program: true
      }
    });

    if (existingApplication) {
      let duplicateField = '';
      if (existingApplication.personal.email === dto.personal.email) {
        duplicateField = 'email address';
      } else if (existingApplication.personal.phoneNumber === dto.personal.phoneNumber) {
        duplicateField = 'phone number';
      } else {
        duplicateField = 'address and name';
      }

      throw new ConflictException(
        `An application (ID: ${existingApplication.applicationId}) has already been submitted with this ${duplicateField} for the ${existingApplication.program.category} program`
      );
    }
  }

  async create(createApplicationDto: CreateApplicationDto, files: {
    'grant.budgetFile'?: Express.Multer.File[];
    'motivation.identityFile'?: Express.Multer.File[];
  }) {
    try {
      const budgetFile = files['grant.budgetFile']?.[0];
      const identityFile = files['motivation.identityFile']?.[0];

      if (!budgetFile || !identityFile) {
        throw new BadRequestException('Missing required files');
      }

      // Check for duplicate applications
      await this.checkDuplicateApplication(createApplicationDto);

      // Upload files to Cloudinary
      const [budgetFileUrl, identityFileUrl] = await Promise.all([
        this.storageService.uploadFile(budgetFile, 'budget'),
        this.storageService.uploadFile(identityFile, 'identity'),
      ]);

      const application = await this.prisma.application.create({
        data: {
          applicationId: this.generateApplicationId(),
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
              size: parseFloat(createApplicationDto.farm.size) || 0,
              type: createApplicationDto.farm.type,
              practices: createApplicationDto.farm.practices,
              challenges: createApplicationDto.farm.challenges,
            },
          },
          grant: {
            create: {
              outcomes: createApplicationDto.grant.outcomes,
              budgetFile: budgetFileUrl,
              budgetFileOriginalName: budgetFile.originalname,
              budgetFileSize: budgetFile.size,
              budgetFileMimeType: budgetFile.mimetype,
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
              identityFile: identityFileUrl,
              identityFileOriginalName: identityFile.originalname,
              identityFileSize: identityFile.size,
              identityFileMimeType: identityFile.mimetype,
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
        ...application,
        grant: {
          ...application.grant,
          budgetFile: {
            url: budgetFileUrl,
            filename: application.grant.budgetFileOriginalName,
            size: application.grant.budgetFileSize,
            type: application.grant.budgetFileMimeType,
          }
        },
        motivation: {
          ...application.motivation,
          identityFile: {
            url: identityFileUrl,
            filename: application.motivation.identityFileOriginalName,
            size: application.motivation.identityFileSize,
            type: application.motivation.identityFileMimeType,
          }
        }
      };
    } catch (error) {
      this.logger.error('Error creating application:', error);
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to submit application');
    }
  }

  async createApplication(createApplicationDto: CreateApplicationDto) {
    const { program, personal, farm, grant, training, motivation, declaration } = createApplicationDto;

    // Generate application ID
    const applicationId = this.generateApplicationId();

    return this.prisma.application.create({
      data: {
        applicationId,
        program: {
          create: program
        },
        personal: {
          create: personal
        },
        farm: {
          create: {
            ...farm,
            size: parseFloat(farm.size)
          }
        },
        grant: {
          create: {
            outcomes: grant.outcomes,
            budgetFile: grant.budgetFile?.filename
          }
        },
        training: {
          create: training
        },
        motivation: {
          create: {
            statement: motivation.statement,
            implementation: motivation.implementation,
            identityFile: motivation.identityFile?.filename
          }
        },
        declaration: {
          create: declaration
        }
      },
      include: {
        program: true,
        personal: true,
        farm: true,
        grant: true,
        training: true,
        motivation: true,
        declaration: true,
      }
    });
  }

  async getApplicationDetails(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { applicationId },
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

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return {
      ...application,
      grant: {
        ...application.grant,
        budgetFile: application.grant.budgetFile,
        budgetFileMimeType: application.grant.budgetFileMimeType || 'application/pdf',
        budgetFileOriginalName: application.grant.budgetFileOriginalName || 'budget.pdf'
      },
      motivation: {
        ...application.motivation,
        identityFile: application.motivation.identityFile,
        identityFileMimeType: application.motivation.identityFileMimeType || 'application/pdf',
        identityFileOriginalName: application.motivation.identityFileOriginalName || 'identity.pdf'
      }
    };
  }
} 