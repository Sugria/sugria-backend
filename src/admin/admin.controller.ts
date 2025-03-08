import { Controller, Post, Get, Body, Patch, Query, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SendEmailDto } from './dto/email.dto';
import { MemberEmailFiltersDto } from './dto/member-email-filters.dto';
import { ApplicationEmailFiltersDto } from './dto/application-email-filters.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('Login request received:', loginDto);
    return this.adminService.login(loginDto.email, loginDto.password);
  }

  @Get('members')
  @ApiOperation({ summary: 'List all members with basic information' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listMembers(
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.listMembers({ search, page, limit });
  }

  @Get('members/:id')
  @ApiOperation({ summary: 'Get detailed information for a specific member' })
  @ApiParam({ name: 'id', type: 'number' })
  async getMemberDetails(@Param('id') id: number) {
    return this.adminService.getMemberDetails(id);
  }

  @Get('applications')
  @ApiOperation({ summary: 'List all applications with basic information' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listApplications(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.listApplications({ search, status, page, limit });
  }

  @Get('applications/:id')
  @ApiOperation({ summary: 'Get detailed information for a specific application' })
  @ApiParam({ name: 'id', type: 'string', description: 'Application ID' })
  async getApplicationDetails(@Param('id') id: string) {
    return this.adminService.getApplicationDetails(id);
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

  @Public()
  @Get('stats/counts')
  @ApiOperation({ summary: 'Get total counts of members and applications' })
  async getCounts() {
    return this.adminService.getCounts();
  }

  @Public()
  @Delete('members/:id')
  @ApiOperation({ summary: 'Delete a member' })
  @ApiParam({ name: 'id', type: 'number' })
  async deleteMember(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteMember(id);
  }

  @Public()
  @Delete('applications/:applicationId')
  @ApiOperation({ summary: 'Delete an application' })
  @ApiParam({ name: 'applicationId', type: 'string' })
  async deleteApplication(@Param('applicationId') applicationId: string) {
    return this.adminService.deleteApplication(applicationId);
  }
} 