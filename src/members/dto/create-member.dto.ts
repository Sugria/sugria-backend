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
  @ApiProperty({ example: "Bachelor's Degree" })
  @IsString()
  @IsNotEmpty()
  highestLevel: string;

  @ApiProperty({ example: 'University of Lagos' })
  @IsString()
  @IsNotEmpty()
  institutionName: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  fieldOfStudy: string;

  @ApiProperty({ example: 'AWS Certified Developer', required: false })
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
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  dateOfBirth: Date;

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
  @Type(() => EmergencyContactDto)
  @ValidateNested()
  @IsNotEmpty()
  emergencyContact: EmergencyContactDto;

  @ApiProperty({
    type: EducationDto,
    example: {
      highestLevel: "Bachelor's Degree",
      institutionName: 'University of Lagos',
      fieldOfStudy: 'Computer Science',
      otherCertifications: 'AWS Certified Developer'
    }
  })
  @Type(() => EducationDto)
  @ValidateNested()
  @IsNotEmpty()
  education: EducationDto;
} 