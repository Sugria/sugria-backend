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

  async joinMovement(createMemberDto: CreateMemberDto) {
    const workEmail = this.generateWorkEmail(
      createMemberDto.firstName,
      createMemberDto.lastName,
    );

    // Check for existing email or phone number
    const existingMember = await this.prisma.member.findFirst({
      where: {
        OR: [
          { email: createMemberDto.email },
          { phoneNumber: createMemberDto.phoneNumber },
          { workEmail },
        ],
      },
    });

    if (existingMember) {
      throw new ConflictException('Member already exists');
    }

    // Convert emergencyContact to a plain object
    const emergencyContact = {
      name: createMemberDto.emergencyContact.name,
      phoneNumber: createMemberDto.emergencyContact.phoneNumber,
      relationship: createMemberDto.emergencyContact.relationship,
    };

    const member = await this.prisma.member.create({
      data: {
        firstName: createMemberDto.firstName,
        lastName: createMemberDto.lastName,
        email: createMemberDto.email,
        workEmail,
        dateOfBirth: createMemberDto.dateOfBirth,
        gender: createMemberDto.gender,
        nationality: createMemberDto.nationality,
        phoneNumber: createMemberDto.phoneNumber,
        residentialAddress: createMemberDto.residentialAddress,
        emergencyContact,
        education: {
          create: {
            highestLevel: createMemberDto.highestLevelOfEducation,
            institutionName: createMemberDto.institutionName,
            fieldOfStudy: createMemberDto.fieldOfStudy,
            otherCertifications: createMemberDto.otherCertifications,
          },
        },
      },
      include: {
        education: true,
      },
    });

    // Send welcome email asynchronously
    this.emailService
      .sendTemplatedEmail(
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
      )
      .then((result: EmailResponse) => {
        if ('error' in result) {
          this.logger.error('Failed to send welcome email:', result.error);
        } else {
          this.logger.debug('Welcome email sent successfully:', result.id);
        }
      })
      .catch(error => {
        this.logger.error('Failed to send welcome email:', error);
      });

    return member;
  }
} 