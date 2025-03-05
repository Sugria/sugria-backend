import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AgeRangeDto {
  @ApiProperty({ example: 18 })
  @IsNumber()
  min: number;

  @ApiProperty({ example: 35 })
  @IsNumber()
  max: number;
}

export class MemberEmailFiltersDto {
  @ApiProperty({ example: 'Nigerian', required: false })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiProperty({ example: 'male', required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ageRange?: AgeRangeDto;
} 