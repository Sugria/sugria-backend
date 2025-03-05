import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsDate, IsBoolean, IsNumber, IsNotEmpty, IsOptional, Matches, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

export class ProgramDto {
  @ApiProperty({ example: 'rural' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  previousTraining: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  trainingId?: string;
}

export class PersonalDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

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

  @ApiProperty({ example: '123 Farm Road, Abuja' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;
}

export class FarmDto {
  @ApiProperty({ example: 'Gwagwalada Area Council, FCT' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: '5.5', description: 'Farm size in hectares' })
  @IsString()
  @Transform(({ value }) => String(value))
  @IsNotEmpty()
  size: string;

  @ApiProperty({ example: 'Mixed Farming' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Traditional' })
  @IsString()
  @IsNotEmpty()
  practices: string;

  @ApiProperty({ example: 'Water Access' })
  @IsString()
  @IsNotEmpty()
  challenges: string;
}

export class GrantDto {
  @ApiProperty({ example: 'Increase production' })
  @IsString()
  @IsNotEmpty()
  outcomes: string;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary',
    description: 'Budget document (PDF file only, max 5MB)'
  })
  budgetFile: Express.Multer.File;
}

export class TrainingDto {
  @ApiProperty({ example: 'in-person' })
  @IsEnum(['in-person', 'online', 'hybrid'])
  @IsNotEmpty()
  preference: string;
}

export class MotivationDto {
  @ApiProperty({ example: 'I aim to modernize my farming practices' })
  @IsString()
  @IsNotEmpty()
  statement: string;

  @ApiProperty({ example: 'Will implement modern techniques' })
  @IsString()
  @IsNotEmpty()
  implementation: string;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary',
    description: 'Identity document (PDF, JPG, or PNG file, max 5MB)'
  })
  identityFile: Express.Multer.File;
}

export class DeclarationDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsNotEmpty()
  agreed: boolean;

  @ApiProperty({ example: 'Officer Sarah Johnson' })
  @IsString()
  @IsNotEmpty()
  officerName: string;
}

export class CreateApplicationDto {
  @ApiProperty({ type: ProgramDto })
  @ValidateNested()
  @Type(() => ProgramDto)
  @IsNotEmpty()
  program: ProgramDto;

  @ApiProperty({ type: PersonalDto })
  @ValidateNested()
  @Type(() => PersonalDto)
  @IsNotEmpty()
  personal: PersonalDto;

  @ApiProperty({ type: FarmDto })
  @ValidateNested()
  @Type(() => FarmDto)
  @IsNotEmpty()
  farm: FarmDto;

  @ApiProperty({ type: GrantDto })
  @ValidateNested()
  @Type(() => GrantDto)
  @IsNotEmpty()
  grant: GrantDto;

  @ApiProperty({ type: TrainingDto })
  @ValidateNested()
  @Type(() => TrainingDto)
  @IsNotEmpty()
  training: TrainingDto;

  @ApiProperty({ type: MotivationDto })
  @ValidateNested()
  @Type(() => MotivationDto)
  @IsNotEmpty()
  motivation: MotivationDto;

  @ApiProperty({ type: DeclarationDto })
  @ValidateNested()
  @Type(() => DeclarationDto)
  @IsNotEmpty()
  declaration: DeclarationDto;
} 