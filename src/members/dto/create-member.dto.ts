import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsDate, IsObject, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class EmergencyContactDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    example: '08012345678',
    description: 'Phone number (minimum 11 digits)'
  })
  @IsString()
  @Matches(/^\d{11,}$/, { 
    message: 'Phone number must have at least 11 digits' 
  })
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  relationship: string;
}

export class CreateMemberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: '1990-01-01',
    description: 'Date of birth in YYYY-MM-DD format' 
  })
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({ 
    example: '08012345678',
    description: 'Phone number (minimum 11 digits)'
  })
  @IsString()
  @Matches(/^\d{11,}$/, { 
    message: 'Phone number must have at least 11 digits' 
  })
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  residentialAddress: string;

  @ApiProperty({ type: EmergencyContactDto })
  @IsObject()
  @IsNotEmpty()
  emergencyContact: EmergencyContactDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  highestLevelOfEducation: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  institutionName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fieldOfStudy: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  otherCertifications?: string;
} 