import { Injectable, ConflictException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { EmailResponse } from '../email/types/email-response.type';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberUpdateEmailService } from './member-update-email.service';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private memberUpdateEmailService: MemberUpdateEmailService,
  ) {}

  private generateWorkEmail(firstName: string, lastName: string): string {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@sugria.com`;
  }

  async create(createMemberDto: CreateMemberDto) {
    try {
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
          emergencyContact: emergencyContact as any,
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
    } catch (error) {
      if (error.code === 'P2002') {
        // Handle unique constraint violation
        const field = error.meta?.target[0];
        throw new ConflictException(`Member with this ${field} already exists`);
      }
      throw error;
    }
  }

  async update(id: number, updateData: Partial<CreateMemberDto>) {
    try {
      // If name is being updated, generate new work email
      if (updateData.firstName && updateData.lastName) {
        updateData['workEmail'] = this.generateWorkEmail(
          updateData.firstName,
          updateData.lastName
        );
      }

      // Convert DTOs to plain objects for Prisma
      const memberData = {
        ...updateData,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        emergencyContact: updateData.emergencyContact ? {
          name: updateData.emergencyContact.name,
          relationship: updateData.emergencyContact.relationship,
          phoneNumber: updateData.emergencyContact.phoneNumber,
        } : undefined,
        education: updateData.education
          ? {
              update: {
                highestLevel: updateData.education.highestLevel,
                institutionName: updateData.education.institutionName,
                fieldOfStudy: updateData.education.fieldOfStudy,
                otherCertifications: updateData.education.otherCertifications,
              },
            }
          : undefined,
      };

      const member = await this.prisma.member.update({
        where: { id },
        data: memberData,
        include: {
          education: true,
        },
      });

      return member;
    } catch (error) {
      if (error.code === 'P2002') {
        // Handle unique constraint violation
        const field = error.meta?.target[0];
        throw new ConflictException(`Member with this ${field} already exists`);
      }
      throw error;
    }
  }

  async updateMember(token: string, updateMemberDto: UpdateMemberDto) {
    try {
      let recoveryEmail;

      // Test token handling - use same email as validate endpoint
      if (token === 'test-token-123') {
        recoveryEmail = 'goodnessobaje@gmail.com';
      } else {
        const recovery = await this.prisma.recovery.findUnique({
          where: { token },
          select: {
            email: true,
            status: true
          }
        });

        if (!recovery) {
          throw new NotFoundException('Invalid recovery token');
        }

        if (recovery.status === 'recovered') {
          throw new BadRequestException('This recovery link has already been used');
        }

        recoveryEmail = recovery.email;
      }

      // Validate work email format
      if (!updateMemberDto.workEmail?.endsWith('@sugria.com')) {
        throw new BadRequestException('Please provide your SUGRiA work email (ending with @sugria.com)');
      }

      // Check if work email or phone number is already in use by another member
      const existingMember = await this.prisma.member.findFirst({
        where: {
          OR: [
            {
              workEmail: updateMemberDto.workEmail,
              email: { not: recoveryEmail },
            },
            {
              phoneNumber: updateMemberDto.phoneNumber,
              email: { not: recoveryEmail },
            }
          ],
        },
      });

      if (existingMember) {
        const duplicateField = existingMember.workEmail === updateMemberDto.workEmail
          ? 'work email'
          : 'phone number';
        throw new ConflictException(`This ${duplicateField} is already registered to another member`);
      }

      // Prepare data with proper date format and convert DTOs to plain objects
      const memberData = {
        ...updateMemberDto,
        dateOfBirth: new Date(updateMemberDto.dateOfBirth),
        emergencyContact: {
          name: updateMemberDto.emergencyContact.name,
          relationship: updateMemberDto.emergencyContact.relationship,
          phoneNumber: updateMemberDto.emergencyContact.phoneNumber || null,
        },
      };

      // Create/Update member with the provided data
      const member = await this.prisma.member.upsert({
        where: { 
          email: recoveryEmail 
        },
        create: {
          ...memberData,
          email: recoveryEmail,
          education: {
            create: {
              highestLevel: updateMemberDto.education.highestLevel,
              institutionName: updateMemberDto.education.institutionName,
              fieldOfStudy: updateMemberDto.education.fieldOfStudy,
              otherCertifications: updateMemberDto.education.otherCertifications,
            },
          },
        },
        update: {
          ...memberData,
          education: {
            upsert: {
              create: {
                highestLevel: updateMemberDto.education.highestLevel,
                institutionName: updateMemberDto.education.institutionName,
                fieldOfStudy: updateMemberDto.education.fieldOfStudy,
                otherCertifications: updateMemberDto.education.otherCertifications,
              },
              update: {
                highestLevel: updateMemberDto.education.highestLevel,
                institutionName: updateMemberDto.education.institutionName,
                fieldOfStudy: updateMemberDto.education.fieldOfStudy,
                otherCertifications: updateMemberDto.education.otherCertifications,
              },
            },
          },
        },
        include: {
          education: true,
        },
      });

      // Mark token as used (except for test token)
      if (token !== 'test-token-123') {
        await this.prisma.recovery.update({
          where: { token },
          data: { status: 'recovered' }
        });
      }

      // Send confirmation email using dedicated service
      await this.memberUpdateEmailService.sendUpdateConfirmation(
        recoveryEmail,
        updateMemberDto
      );

      return {
        success: true,
        message: 'Member information updated successfully'
      };
    } catch (error) {
      this.logger.error('Failed to update member:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      // Add more details to the error message
      throw new BadRequestException({
        message: error.message,
        details: error.response?.message || error.message,
        code: error.code,
      });
    }
  }

  async validateRecoveryToken(token: string) {
    // Test token for development
    if (token === 'test-token-123') {
      return {
        email: 'goodness.obaje@gmail.com',  // Use a real email format for testing
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
} 