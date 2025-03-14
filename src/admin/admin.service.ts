import { Injectable, UnauthorizedException, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { SendEmailDto } from './dto/email.dto';
import { MemberEmailFiltersDto } from './dto/member-email-filters.dto';
import { ApplicationEmailFiltersDto } from './dto/application-email-filters.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private membershipEndpointEnabled = true;

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async login(email: string, password: string) {
    try {
      console.log('Login attempt for:', email);

      const admin = await this.prisma.admin.findUnique({
        where: { email }
      });

      if (!admin) {
        console.log('Admin not found:', email);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('Found admin:', {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        // Don't log the actual password
        passwordLength: admin.password.length
      });

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      console.log('Password validation result:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('Invalid password for:', email);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('Login successful for:', email);

      return { 
        success: true,
        email: admin.email, 
        role: admin.role,
        name: admin.name,
        id: admin.id
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed: ' + error.message);
    }
  }

  async getAllApplications() {
    return this.prisma.application.findMany({
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
  }

  setMembershipEndpointStatus(enabled: boolean) {
    this.membershipEndpointEnabled = enabled;
    return { enabled };
  }

  isMembershipEndpointEnabled() {
    return this.membershipEndpointEnabled;
  }

  async getMembers({ search, page, limit }) {
    const skip = (page - 1) * limit;
    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        include: {
          education: true,
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      data: members,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getApplications({ status, category, search, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const where = {
      AND: [
        status ? { status } : {},
        category ? { program: { category } } : {},
        search ? {
          OR: [
            { applicationId: { contains: search, mode: 'insensitive' as const } },
            { personal: { fullName: { contains: search, mode: 'insensitive' as const } } },
            { personal: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
        } : {},
      ],
    };

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        include: {
          program: true,
          personal: true,
          farm: true,
          grant: true,
          training: true,
          motivation: true,
          declaration: true,
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async sendEmailToMembers({ 
    subject, 
    template, 
    filters = {} 
  }: Omit<SendEmailDto, 'filters'> & { filters?: MemberEmailFiltersDto }) {
    const where = {
      AND: [
        filters?.nationality ? { nationality: filters.nationality } : {},
        filters?.gender ? { gender: filters.gender } : {},
        filters?.ageRange ? {
          dateOfBirth: {
            lte: new Date(new Date().setFullYear(new Date().getFullYear() - filters.ageRange.min)),
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - filters.ageRange.max)),
          },
        } : {},
      ],
    };

    const members = await this.prisma.member.findMany({ where });
    
    for (const member of members) {
      await this.emailService.sendTemplatedEmail(
        template,
        {
          name: `${member.firstName} ${member.lastName}`,
          year: new Date().getFullYear(),
        },
        {
          to: member.email,
          subject,
          tags: [
            { name: 'email_type', value: 'admin_bulk_email' },
            { name: 'recipient_type', value: 'member' },
          ],
        },
      );
    }

    return {
      success: true,
      count: members.length,
      message: `Email sent to ${members.length} members`,
    };
  }

  async sendEmailToApplicants({ 
    subject, 
    template, 
    filters = {} 
  }: Omit<SendEmailDto, 'filters'> & { filters?: ApplicationEmailFiltersDto }) {
    const where = {
      AND: [
        filters?.status ? { status: filters.status } : {},
        filters?.category ? { program: { category: filters.category } } : {},
        filters?.location ? { farm: { location: { contains: filters.location } } } : {},
      ],
    };

    const applications = await this.prisma.application.findMany({
      where,
      include: {
        personal: true,
        program: true,
      },
    });

    for (const application of applications) {
      await this.emailService.sendTemplatedEmail(
        template,
        {
          name: application.personal.fullName,
          applicationId: application.applicationId,
          category: application.program.category,
          year: new Date().getFullYear(),
        },
        {
          to: application.personal.email,
          subject,
          tags: [
            { name: 'email_type', value: 'admin_bulk_email' },
            { name: 'recipient_type', value: 'applicant' },
          ],
        },
      );
    }

    return {
      success: true,
      count: applications.length,
      message: `Email sent to ${applications.length} applicants`,
    };
  }

  async getAllUsers({ 
    type = 'all', 
    search, 
    page = 1, 
    limit = 10 
  }: {
    type: 'member' | 'applicant' | 'all';
    search?: string;
    page: number;
    limit: number;
  }) {
    const skip = (page - 1) * limit;

    // Common search conditions
    const searchCondition = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    // Get members if type is 'all' or 'member'
    const membersPromise = type !== 'applicant' ? this.prisma.member.findMany({
      where: searchCondition,
      skip: type === 'all' ? 0 : skip,
      take: type === 'all' ? undefined : limit,
      include: {
        education: true,
      },
    }) : Promise.resolve([]);

    // Get applicants if type is 'all' or 'applicant'
    const applicantsPromise = type !== 'member' ? this.prisma.application.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { applicationId: { contains: search, mode: 'insensitive' as const } },
              { personal: { fullName: { contains: search, mode: 'insensitive' as const } } },
              { personal: { email: { contains: search, mode: 'insensitive' as const } } },
            ],
          } : {},
        ],
      },
      skip: type === 'all' ? 0 : skip,
      take: type === 'all' ? undefined : limit,
      include: {
        program: true,
        personal: true,
      },
    }) : Promise.resolve([]);

    // Get counts for pagination
    const memberCountPromise = type !== 'applicant' ? 
      this.prisma.member.count({ where: searchCondition }) : 
      Promise.resolve(0);

    const applicantCountPromise = type !== 'member' ? 
      this.prisma.application.count({ 
        where: search ? {
          OR: [
            { applicationId: { contains: search, mode: 'insensitive' as const } },
            { personal: { fullName: { contains: search, mode: 'insensitive' as const } } },
            { personal: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
        } : {},
      }) : 
      Promise.resolve(0);

    const [members, applications, memberCount, applicantCount] = await Promise.all([
      membersPromise,
      applicantsPromise,
      memberCountPromise,
      applicantCountPromise,
    ]);

    // Format the response
    const formattedMembers = members.map(member => ({
      type: 'member',
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phoneNumber: member.phoneNumber,
      createdAt: member.createdAt,
      details: member,
    }));

    const formattedApplicants = applications.map(app => ({
      type: 'applicant',
      id: app.id,
      firstName: app.personal.fullName.split(' ')[0],
      lastName: app.personal.fullName.split(' ').slice(1).join(' '),
      email: app.personal.email,
      phoneNumber: app.personal.phoneNumber,
      applicationId: app.applicationId,
      status: app.status,
      createdAt: app.submittedAt,
      details: app,
    }));

    const users = type === 'member' ? formattedMembers :
                 type === 'applicant' ? formattedApplicants :
                 [...formattedMembers, ...formattedApplicants];

    const total = type === 'member' ? memberCount :
                 type === 'applicant' ? applicantCount :
                 memberCount + applicantCount;

    return {
      data: users,
      meta: {
        total,
        page: type === 'all' ? 1 : page,
        limit: type === 'all' ? total : limit,
        pages: type === 'all' ? 1 : Math.ceil(total / limit),
        memberCount,
        applicantCount,
      },
    };
  }

  // List Members with Basic Info
  async listMembers({ search, page, limit }) {
    const skip = (Number(page) - 1) * Number(limit);
    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          nationality: true,
          createdAt: true,
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      data: members,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get Member Details
  async getMemberDetails(id: number) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        education: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  // List Applications with Basic Info
  async listApplications({ search, status, page = 1, limit = 10 }) {
    // Convert page and limit to numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      AND: [
        status ? { status: status } : {},
        search ? {
          OR: [
            { applicationId: { contains: search, mode: 'insensitive' as const } },
            {
              personal: {
                OR: [
                  { fullName: { contains: search, mode: 'insensitive' as const } },
                  { email: { contains: search, mode: 'insensitive' as const } },
                ]
              }
            }
          ],
        } : {},
      ],
    };

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        select: {
          applicationId: true,
          status: true,
          submittedAt: true,
          personal: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
          program: {
            select: {
              category: true,
            },
          },
        },
        skip,
        take: limitNum, // Using the converted number
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  // Get Application Details
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

    return application;
  }

  async getCounts() {
    const [membersCount, applicationsCount] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.application.count()
    ]);

    return {
      totalMembers: membersCount,
      totalApplications: applicationsCount
    };
  }

  async deleteMember(id: number) {
    try {
      // First delete related education record if exists
      await this.prisma.education.deleteMany({
        where: { memberId: id }
      });

      // Then delete the member
      const deletedMember = await this.prisma.member.delete({
        where: { id }
      });

      return {
        success: true,
        message: `Member ${deletedMember.email} deleted successfully`
      };
    } catch (error) {
      throw new NotFoundException('Member not found or already deleted');
    }
  }

  async deleteApplication(applicationId: string) {
    try {
      console.log(`Attempting to delete application: ${applicationId}`);

      // First check if application exists
      const application = await this.prisma.application.findUnique({
        where: { applicationId }
      });

      if (!application) {
        console.log(`Application not found: ${applicationId}`);
        throw new NotFoundException(`Application ${applicationId} not found`);
      }

      // Delete in correct order based on foreign key relationships
      await this.prisma.$transaction(async (tx) => {
        // First delete the application since it has the foreign keys
        await tx.application.delete({
          where: { applicationId }
        });

        // Then delete the orphaned records
        await Promise.all([
          tx.declaration.delete({ where: { id: application.declarationId } }),
          tx.motivation.delete({ where: { id: application.motivationId } }),
          tx.training.delete({ where: { id: application.trainingId } }),
          tx.grant.delete({ where: { id: application.grantId } }),
          tx.farm.delete({ where: { id: application.farmId } }),
          tx.personal.delete({ where: { id: application.personalId } }),
          tx.program.delete({ where: { id: application.programId } })
        ]);
      });

      console.log(`Successfully deleted application: ${applicationId}`);
      return {
        success: true,
        message: `Application ${applicationId} deleted successfully`
      };
    } catch (error) {
      console.error('Error deleting application:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete application: ${error.message}`);
    }
  }
} 