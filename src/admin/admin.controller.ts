import { Controller, Post, Get, Body, UseGuards, Patch, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SendEmailDto } from './dto/email.dto';
import { MemberEmailFiltersDto } from './dto/member-email-filters.dto';
import { ApplicationEmailFiltersDto } from './dto/application-email-filters.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() credentials: { email: string; password: string }) {
    return this.adminService.login(credentials.email, credentials.password);
  }

  @Get('members')
  @ApiOperation({ summary: 'Get all members with optional filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMembers(
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.getMembers({ search, page, limit });
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get all applications with optional filters' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  async getApplications(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
  ) {
    return this.adminService.getApplications({ status, category, search, page });
  }

  @Post('email/members')
  @ApiOperation({ summary: 'Send email to filtered members' })
  async sendEmailToMembers(
    @Body() data: Omit<SendEmailDto, 'filters'> & { filters?: MemberEmailFiltersDto },
  ) {
    return this.adminService.sendEmailToMembers(data);
  }

  @Post('email/applicants')
  @ApiOperation({ summary: 'Send email to filtered applicants' })
  async sendEmailToApplicants(
    @Body() data: Omit<SendEmailDto, 'filters'> & { filters?: ApplicationEmailFiltersDto },
  ) {
    return this.adminService.sendEmailToApplicants(data);
  }

  @Patch('membership-endpoint')
  async toggleMembershipEndpoint(@Body('enabled') enabled: boolean) {
    return this.adminService.setMembershipEndpointStatus(enabled);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (members and applicants) with filters' })
  @ApiQuery({ name: 'type', required: false, enum: ['member', 'applicant', 'all'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllUsers(
    @Query('type') type: 'member' | 'applicant' | 'all' = 'all',
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.getAllUsers({ type, search, page, limit });
  }
} 