import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { EmailResponse } from '../email/types/email-response.type';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  private generateWorkEmail(firstName: string, lastName: string): string {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@sugria.com`;
  }

  async create(createMemberDto: CreateMemberDto) {
    // Check if member already exists
    const existingMember = await this.prisma.member.findFirst({
      where: {
        OR: [
          { email: createMemberDto.email },
          { phoneNumber: createMemberDto.phoneNumber },
        ],
      },
    });

    if (existingMember) {
      throw new ConflictException(
        'A member with this email or phone number already exists',
      );
    }

    try {
      // Generate work email
      const workEmail = this.generateWorkEmail(
        createMemberDto.firstName,
        createMemberDto.lastName,
      );

      // Convert emergencyContact to a plain object
      const emergencyContact = {
        name: createMemberDto.emergencyContact.name,
        relationship: createMemberDto.emergencyContact.relationship,
        phoneNumber: createMemberDto.emergencyContact.phoneNumber,
      } as const;

      // Create member with education
      const member = await this.prisma.member.create({
        data: {
          firstName: createMemberDto.firstName,
          lastName: createMemberDto.lastName,
          email: createMemberDto.email,
          workEmail,
          dateOfBirth: new Date(createMemberDto.dateOfBirth),
          gender: createMemberDto.gender,
          nationality: createMemberDto.nationality,
          phoneNumber: createMemberDto.phoneNumber,
          residentialAddress: createMemberDto.residentialAddress,
          emergencyContact,
          education: {
            create: {
              highestLevel: createMemberDto.education.highestLevel,
              institutionName: createMemberDto.education.institutionName,
              fieldOfStudy: createMemberDto.education.fieldOfStudy,
              otherCertifications: createMemberDto.education.otherCertifications,
            },
          },
        },
        include: {
          education: true,
        },
      });

      // Send welcome email
      await this.emailService.sendTemplatedEmail(
        'welcome-email',
        {
          name: `${member.firstName} ${member.lastName}`,
          workEmail: member.workEmail,
        },
        {
          to: member.email,
          subject: 'Welcome to the Sustainable Green Revolution in Africa (SUGRiA)',
          replyTo: 'support@sugria.com',
          tags: [
            { name: 'email_type', value: 'welcome' },
            { name: 'user_id', value: member.id.toString() }
          ]
        },
      );

      return member;
    } catch (error) {
      this.logger.error('Error creating member:', error);
      throw error;
    }
  }
} 