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
    // Check for existing member
    const existingMember = await this.prisma.member.findFirst({
      where: {
        OR: [
          { email: createMemberDto.email },
          { phoneNumber: createMemberDto.phoneNumber },
        ],
      },
    });

    if (existingMember) {
      const duplicateField = existingMember.email === createMemberDto.email
        ? 'email'
        : 'phone number';
      throw new ConflictException(
        `Member with this ${duplicateField} already exists`,
      );
    }

    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      gender,
      nationality,
      phoneNumber,
      residentialAddress,
      emergencyContact,
      education,
    } = createMemberDto;

    // Create member with education
    const member = await this.prisma.member.create({
      data: {
        firstName,
        lastName,
        email,
        workEmail: this.generateWorkEmail(firstName, lastName),
        dateOfBirth: new Date(dateOfBirth),
        gender,
        nationality,
        phoneNumber,
        residentialAddress,
        emergencyContact,
        education: education
          ? {
              create: {
                highestLevel: education.highestLevel,
                institutionName: education.institutionName,
                fieldOfStudy: education.fieldOfStudy,
                otherCertifications: education.otherCertifications,
              },
            }
          : undefined,
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

    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      nationality: member.nationality,
      phoneNumber: member.phoneNumber,
      residentialAddress: member.residentialAddress,
      emergencyContact: member.emergencyContact,
      education: member.education,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }
} 