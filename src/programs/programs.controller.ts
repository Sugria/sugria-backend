import { Controller, Post, Body, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@ApiTags('programs')
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post('applications')
  @ApiOperation({ summary: 'Submit a new program application' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'grant.budget', maxCount: 1 },
      { name: 'motivation.identity', maxCount: 1 },
    ], {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.includes('pdf')) {
          return cb(new Error('Only PDF files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFiles()
    files: {
      'grant.budget'?: Express.Multer.File[];
      'motivation.identity'?: Express.Multer.File[];
    },
  ) {
    if (!files || !files['grant.budget']?.[0] || !files['motivation.identity']?.[0]) {
      throw new BadRequestException('Both budget and identity files are required');
    }
    return this.programsService.create(createApplicationDto, files);
  }
} 