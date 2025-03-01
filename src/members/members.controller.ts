import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';

@ApiTags('members')
@Controller('members')
export class MembersController {
  private readonly logger = new Logger(MembersController.name);

  constructor(private readonly membersService: MembersService) {}

  @Post('join-movement')
  @ApiOperation({ summary: 'Register a new member' })
  @ApiResponse({ status: 201, description: 'Member successfully registered' })
  @ApiResponse({ status: 409, description: 'Member already exists' })
  async joinMovement(@Body() createMemberDto: CreateMemberDto) {
    this.logger.log('Incoming request data:');
    this.logger.log(JSON.stringify(createMemberDto, null, 2));

    try {
      const result = await this.membersService.joinMovement(createMemberDto);
      this.logger.log('Response data:');
      this.logger.log(JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      this.logger.error('Error processing request:');
      this.logger.error(error.message);
      throw error;
    }
  }
} 