import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplicationEmailFiltersDto {
  @ApiProperty({ example: 'pending', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'rural', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'Abuja', required: false })
  @IsString()
  @IsOptional()
  location?: string;
} 