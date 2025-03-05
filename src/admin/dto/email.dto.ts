import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberEmailFiltersDto } from './member-email-filters.dto';
import { ApplicationEmailFiltersDto } from './application-email-filters.dto';

export class SendEmailDto {
  @ApiProperty({ example: 'Important Update from SUGRiA' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'notification-template' })
  @IsString()
  template: string;

  @ApiProperty({ 
    required: false,
    oneOf: [
      { $ref: '#/components/schemas/MemberEmailFiltersDto' },
      { $ref: '#/components/schemas/ApplicationEmailFiltersDto' }
    ]
  })
  @IsOptional()
  @IsObject()
  filters?: MemberEmailFiltersDto | ApplicationEmailFiltersDto;
} 