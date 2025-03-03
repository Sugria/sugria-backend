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
        // List of accepted MIME types
        const acceptedMimeTypes = {
          pdf: [
            'application/pdf',
            'application/x-pdf',
            'application/acrobat',
            'application/vnd.pdf',
            'text/pdf',
            'text/x-pdf'
          ],
          image: [
            'image/jpeg',
            'image/jpg',
            'image/png'
          ]
        };

        // Check if file type is accepted
        const isAcceptedType = [
          ...acceptedMimeTypes.pdf,
          ...acceptedMimeTypes.image
        ].includes(file.mimetype);

        if (!isAcceptedType) {
          return cb(
            new BadRequestException(
              `Invalid file type for ${file.fieldname}. Only PDF, JPG, and PNG files are allowed. Received: ${file.mimetype}`
            ), 
            false
          );
        }

        // Check file extension
        const fileExtension = file.originalname.toLowerCase().split('.').pop();
        const acceptedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        
        if (!acceptedExtensions.includes(fileExtension)) {
          return cb(
            new BadRequestException(
              `Invalid file extension for ${file.fieldname}. Only .pdf, .jpg, .jpeg, and .png files are allowed. Received: .${fileExtension}`
            ),
            false
          );
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
      throw new BadRequestException(
        'Both grant budget and motivation identity files are required. Please upload PDF, JPG, or PNG files.'
      );
    }

    return this.programsService.create(createApplicationDto, files);
  }
} 