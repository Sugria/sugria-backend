import { Controller, Post, Body, Logger, UseGuards, Param, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { AdminService } from '../admin/admin.service';
import { UpdateMemberDto } from './dto/update-member.dto';

@ApiTags('members')
@Controller('members')
export class MembersController {
  private readonly logger = new Logger(MembersController.name);

  constructor(
    private readonly membersService: MembersService,
    private readonly adminService: AdminService,
  ) {}

  @Post('join-movement')
  @ApiOperation({ summary: 'Join the SUGRiA movement' })
  @ApiResponse({ status: 201, description: 'Successfully joined the movement' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Member already exists' })
  async joinMovement(@Body() createMemberDto: CreateMemberDto) {
    if (!this.adminService.isMembershipEndpointEnabled()) {
      throw new Error('Membership registration is currently disabled');
    }
    this.logger.log(`New member registration request: ${createMemberDto.email}`);
    const result = await this.membersService.create(createMemberDto);
    return result;
  }

  @Get('validate/:token')
  @ApiOperation({ summary: 'Validate recovery token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async validateToken(@Param('token') token: string) {
    return this.membersService.validateRecoveryToken(token);
  }

  @Post('update/:token')
  @ApiOperation({ summary: 'Update member information' })
  async updateMember(
    @Param('token') token: string,
    @Body() updateMemberDto: UpdateMemberDto
  ) {
    return this.membersService.updateMember(token, updateMemberDto);
  }
} 