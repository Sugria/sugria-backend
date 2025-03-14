import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmergencyContactDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({ description: 'Any valid phone number format', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class EducationDto {
  @IsString()
  @IsNotEmpty()
  highestLevel: string;

  @IsString()
  @IsNotEmpty()
  institutionName: string;

  @IsString()
  @IsNotEmpty()
  fieldOfStudy: string;

  @IsString()
  @IsOptional()
  otherCertifications?: string;
} 