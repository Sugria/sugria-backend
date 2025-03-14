import { IsString, IsDateString, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EmergencyContactDto, EducationDto } from './shared.dto';

export class UpdateMemberDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Must be a valid @sugria.com email address' })
  @IsString()
  workEmail: string;

  @ApiProperty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty()
  @IsString()
  gender: string;

  @ApiProperty()
  @IsString()
  nationality: string;

  @ApiProperty({ description: 'Any valid phone number format' })
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  residentialAddress: string;

  @ApiProperty({ type: EmergencyContactDto })
  @IsObject()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact: EmergencyContactDto;

  @ApiProperty({ type: EducationDto })
  @IsObject()
  @ValidateNested()
  @Type(() => EducationDto)
  education: EducationDto;
} 