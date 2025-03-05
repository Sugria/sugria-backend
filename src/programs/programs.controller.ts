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
      { 
        name: 'grant.budgetFile', 
        maxCount: 1 
      },
      { 
        name: 'motivation.identityFile', 
        maxCount: 1 
      }
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

        if (file.fieldname === 'grant.budgetFile') {
          // Budget file: PDF only
          const isPdfValid = acceptedMimeTypes.pdf.includes(file.mimetype);
          if (!isPdfValid) {
            return cb(
              new BadRequestException(
                'Budget file must be a PDF document'
              ),
              false
            );
          }
        } else if (file.fieldname === 'motivation.identityFile') {
          // Identity file: PDF, JPG, or PNG
          const isValid = [
            ...acceptedMimeTypes.pdf,
            ...acceptedMimeTypes.image
          ].includes(file.mimetype);
          
          if (!isValid) {
            return cb(
              new BadRequestException(
                'Identity document must be a PDF, JPG, or PNG file'
              ),
              false
            );
          }
        }

        // Check file extension
        const fileExtension = file.originalname.toLowerCase().split('.').pop();
        const acceptedExtensions = file.fieldname === 'grant.budgetFile' 
          ? ['pdf']
          : ['pdf', 'jpg', 'jpeg', 'png'];
        
        if (!acceptedExtensions.includes(fileExtension)) {
          return cb(
            new BadRequestException(
              `Invalid file extension for ${file.fieldname}. Allowed extensions: ${acceptedExtensions.join(', ')}`
            ),
            false
          );
        }

        cb(null, true);
      }
    })
  )
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFiles() files: {
      'grant.budgetFile'?: Express.Multer.File[];
      'motivation.identityFile'?: Express.Multer.File[];
    }
  ) {
    return this.programsService.create(createApplicationDto, {
      'grant.budgetFile': files['grant.budgetFile'],
      'motivation.identityFile': files['motivation.identityFile']
    });
  }
} 