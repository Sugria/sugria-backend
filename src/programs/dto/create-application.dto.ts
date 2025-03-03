import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsDate, IsBoolean, IsNumber, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class ProgramDto {
  @ApiProperty({ example: 'rural' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: false })
  @IsBoolean()
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
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  dateOfBirth: Date;
}

export class FarmDto {
  @ApiProperty({ example: 'Gwagwalada Area Council, FCT' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 5.5 })
  @IsNumber()
  @IsNotEmpty()
  size: number;

  @ApiProperty({ example: 'Maize, Cassava, Poultry' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Traditional farming with some modern irrigation' })
  @IsString()
  @IsNotEmpty()
  practices: string;

  @ApiProperty({ example: 'Limited access to modern equipment, seasonal pests' })
  @IsString()
  @IsNotEmpty()
  challenges: string;
}

export class GrantDto {
  @ApiProperty({ example: 'Increase crop yield by 50% and expand poultry operation' })
  @IsString()
  @IsNotEmpty()
  outcomes: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  budget: Express.Multer.File;
}

export class TrainingDto {
  @ApiProperty({ example: 'in-person' })
  @IsString()
  @IsNotEmpty()
  preference: string;
}

export class MotivationDto {
  @ApiProperty({ example: 'I aim to modernize my farming practices' })
  @IsString()
  @IsNotEmpty()
  statement: string;

  @ApiProperty({ example: 'Will invest in modern equipment and training' })
  @IsString()
  @IsNotEmpty()
  implementation: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  identity: Express.Multer.File;
}

export class DeclarationDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  agreed: boolean;

  @ApiProperty({ example: 'Officer Sarah Johnson' })
  @IsString()
  @IsNotEmpty()
  officerName: string;
}

export class CreateApplicationDto {
  @ApiProperty({ type: ProgramDto })
  @Type(() => ProgramDto)
  @IsNotEmpty()
  program: ProgramDto;

  @ApiProperty({ type: PersonalDto })
  @Type(() => PersonalDto)
  @IsNotEmpty()
  personal: PersonalDto;

  @ApiProperty({ type: FarmDto })
  @Type(() => FarmDto)
  @IsNotEmpty()
  farm: FarmDto;

  @ApiProperty({ type: GrantDto })
  @Type(() => GrantDto)
  @IsNotEmpty()
  grant: GrantDto;

  @ApiProperty({ type: TrainingDto })
  @Type(() => TrainingDto)
  @IsNotEmpty()
  training: TrainingDto;

  @ApiProperty({ type: MotivationDto })
  @Type(() => MotivationDto)
  @IsNotEmpty()
  motivation: MotivationDto;

  @ApiProperty({ type: DeclarationDto })
  @Type(() => DeclarationDto)
  @IsNotEmpty()
  declaration: DeclarationDto;
} 