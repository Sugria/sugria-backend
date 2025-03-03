import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('MembersService', () => {
  let service: MembersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    member: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('register', () => {
    const mockMemberDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      nationality: 'Nigerian',
      phoneNumber: '1234567890',
      residentialAddress: '123 Main St',
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phoneNumber: '0987654321',
      },
      education: {
        highestLevel: 'Bachelor',
        institutionName: 'University',
        fieldOfStudy: 'Agriculture',
        otherCertifications: 'Farming Certificate',
      },
    };

    it('should register a new member', async () => {
      const mockCreatedMember = {
        id: 1,
        ...mockMemberDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.member.findFirst.mockResolvedValue(null);
      mockPrismaService.member.create.mockResolvedValue(mockCreatedMember);

      const result = await service.register(mockMemberDto);

      expect(result.id).toBeDefined();
      expect(result.email).toBe(mockMemberDto.email);
    });

    it('should reject duplicate email registration', async () => {
      mockPrismaService.member.findFirst.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
      });

      await expect(service.register(mockMemberDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should reject duplicate phone number registration', async () => {
      mockPrismaService.member.findFirst.mockResolvedValue({
        id: 1,
        phoneNumber: '1234567890',
      });

      await expect(service.register(mockMemberDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
}); 