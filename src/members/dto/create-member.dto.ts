import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsDate, IsObject, IsNotEmpty, IsOptional, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EmergencyContactDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Spouse' })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({ 
    example: '+2348087654321',
    description: 'Nigerian phone number in E.164 format (+234XXXXXXXXXX)'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+234[0-9]{10}$/, {
    message: 'Phone number must be in E.164 format: +234 followed by 10 digits'
  })
  phoneNumber: string;
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

export class CreateMemberDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: 'Nigerian' })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({ 
    example: '+2348012345678',
    description: 'Nigerian phone number in E.164 format (+234XXXXXXXXXX)'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+234[0-9]{10}$/, {
    message: 'Phone number must be in E.164 format: +234 followed by 10 digits'
  })
  phoneNumber: string;

  @ApiProperty({ example: '123 Main Street, Lagos' })
  @IsString()
  @IsNotEmpty()
  residentialAddress: string;

  @ApiProperty({
    type: EmergencyContactDto,
    example: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phoneNumber: '+2348087654321'
    }
  })
  @IsObject()
  @IsNotEmpty()
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };

  @ApiProperty({
    type: EducationDto,
    example: {
      highestLevel: "Bachelor's Degree",
      institutionName: 'University of Lagos',
      fieldOfStudy: 'Computer Science',
      otherCertifications: 'AWS Certified Developer'
    }
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EducationDto)
  education?: EducationDto;
} 