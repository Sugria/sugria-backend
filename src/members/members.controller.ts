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
  @ApiOperation({ summary: 'Join the SUGRiA movement' })
  @ApiResponse({ status: 201, description: 'Successfully joined the movement' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Member already exists' })
  async joinMovement(@Body() createMemberDto: CreateMemberDto) {
    this.logger.log(`New member registration request: ${createMemberDto.email}`);
    const result = await this.membersService.create(createMemberDto);
    return result;
  }
} 