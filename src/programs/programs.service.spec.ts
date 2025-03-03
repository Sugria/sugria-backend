import { Test, TestingModule } from '@nestjs/testing';
import { ProgramsService } from './programs.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';

describe('ProgramsService', () => {
  let service: ProgramsService;
  let prisma: PrismaService;
  let emailService: EmailService;

  const mockPrismaService = {
    application: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockEmailService = {
    sendTemplatedEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<ProgramsService>(ProgramsService);
    prisma = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('create application', () => {
    const mockFiles = {
      'grant.budget': [{
        fieldname: 'grant.budget',
        originalname: 'budget.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1234,
        destination: '/tmp',
        filename: 'budget.pdf',
        path: '/tmp/budget.pdf',
        buffer: Buffer.from('test'),
        stream: null as any
      }],
      'motivation.identity': [{
        fieldname: 'motivation.identity',
        originalname: 'identity.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1234,
        destination: '/tmp',
        filename: 'identity.pdf',
        path: '/tmp/identity.pdf',
        buffer: Buffer.from('test'),
        stream: null as any
      }],
    } as {
      'grant.budget'?: Express.Multer.File[];
      'motivation.identity'?: Express.Multer.File[];
    };

    const mockApplicationDto = {
      program: {
        category: 'rural',
        previousTraining: true,
        trainingId: null,
      },
      personal: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        address: '123 Farm Road',
        gender: 'male',
        dateOfBirth: new Date('1990-01-01'),
      },
      farm: {
        location: 'Farm Location',
        size: 5.5,
        type: 'Mixed Farming',
        practices: 'Traditional',
        challenges: 'Water Access',
      },
      grant: {
        outcomes: 'Increase production',
      },
      training: {
        preference: 'in-person',
      },
      motivation: {
        statement: 'Passionate about farming',
        implementation: 'Will implement modern techniques',
      },
      declaration: {
        agreed: true,
        officerName: 'Officer Smith',
      },
    } as CreateApplicationDto;

    it('should create a new application', async () => {
      const mockCreatedApplication = {
        id: 1,
        applicationId: 'APP123456',
        status: 'pending',
        // ... other fields
      };

      mockPrismaService.application.findFirst.mockResolvedValue(null);
      mockPrismaService.application.create.mockResolvedValue(mockCreatedApplication);
      mockEmailService.sendTemplatedEmail.mockResolvedValue(true);

      const result = await service.create(mockApplicationDto, mockFiles);

      expect(result.success).toBe(true);
      expect(result.data.applicationId).toBeDefined();
      expect(mockEmailService.sendTemplatedEmail).toHaveBeenCalled();
    });

    it('should reject duplicate applications', async () => {
      mockPrismaService.application.findFirst.mockResolvedValue({
        applicationId: 'APP123456',
        personal: { email: 'john@example.com' },
        program: { category: 'rural' },
      });

      await expect(service.create(mockApplicationDto, mockFiles)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should reject applications without required files', async () => {
      const invalidFiles = {
        'grant.budget': [],
        'motivation.identity': [],
      };

      await expect(service.create(mockApplicationDto, invalidFiles)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
}); 