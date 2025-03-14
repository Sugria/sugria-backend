import { IsArray, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendBulkEmailDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  to: string[];

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  templateName: string = 'custom-email';

  @IsOptional()
  templateData?: {
    [key: string]: any;
  };
} 