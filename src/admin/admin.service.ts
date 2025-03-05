import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { SendEmailDto } from './dto/email.dto';
import { MemberEmailFiltersDto } from './dto/member-email-filters.dto';
import { ApplicationEmailFiltersDto } from './dto/application-email-filters.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private membershipEndpointEnabled = true;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async login(email: string, password: string) {
    if (email !== 'admin@sugria.com') {
      throw new UnauthorizedException('Invalid credentials');
    }

    // In production, use hashed password comparison
    const isPasswordValid = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH || '$2b$10$YourHashedPasswordHere',
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ email, role: 'admin' });
    return { access_token: token };
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
} 