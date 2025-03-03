import { Controller, Post, Get, Body, UseGuards, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() credentials: { email: string; password: string }) {
    return this.adminService.login(credentials.email, credentials.password);
  }

  @UseGuards(AdminAuthGuard)
  @Get('applications')
  async getAllApplications() {
    return this.adminService.getAllApplications();
  }

  @UseGuards(AdminAuthGuard)
  @Patch('membership-endpoint')
  async toggleMembershipEndpoint(@Body('enabled') enabled: boolean) {
    return this.adminService.setMembershipEndpointStatus(enabled);
  }
} 