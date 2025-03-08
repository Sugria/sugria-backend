import { Controller, Post, Body, UseInterceptors, UploadedFiles, BadRequestException, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Response } from 'express';
import { StorageService } from '../common/services/storage.service';

@ApiTags('programs')
@Controller('programs')
export class ProgramsController {
  constructor(
    private readonly programsService: ProgramsService,
    private readonly storageService: StorageService
  ) {}

  @Post('applications')
  @ApiOperation({ summary: 'Submit a new program application' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'grant.budgetFile', maxCount: 1 },
      { name: 'motivation.identityFile', maxCount: 1 }
    ])
  )
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFiles() files: {
      'grant.budgetFile'?: Express.Multer.File[];
      'motivation.identityFile'?: Express.Multer.File[];
    }
  ) {
    return this.programsService.create(createApplicationDto, files);
  }

  @Get('applications/:applicationId/files/:fileType/view')
  async viewFile(
    @Param('applicationId') applicationId: string,
    @Param('fileType') fileType: 'budget' | 'identity',
    @Res() res: Response
  ) {
    try {
      console.log(`Viewing file: ${fileType} for application: ${applicationId}`);
      
      const application = await this.programsService.getApplicationDetails(applicationId);
      
      const file = fileType === 'budget' 
        ? {
            url: application.grant.budgetFile,
            type: application.grant.budgetFileMimeType,
            filename: application.grant.budgetFileOriginalName
          }
        : {
            url: application.motivation.identityFile,
            type: application.motivation.identityFileMimeType,
            filename: application.motivation.identityFileOriginalName
          };

      console.log('File details:', file);

      const fileBuffer = await this.storageService.getFileBuffer(file.url);
      
      res.set({
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Content-Length': fileBuffer.length,
        'Cache-Control': 'private, no-cache',
        'Pragma': 'no-cache'
      });

      return res.send(fileBuffer);
    } catch (error) {
      console.error('View file error:', error);
      throw new NotFoundException('File not found or inaccessible');
    }
  }

  @Get('applications/:applicationId/files/:fileType/download')
  async downloadFile(
    @Param('applicationId') applicationId: string,
    @Param('fileType') fileType: 'budget' | 'identity',
    @Res() res: Response
  ) {
    try {
      console.log(`Downloading file: ${fileType} for application: ${applicationId}`);
      
      const application = await this.programsService.getApplicationDetails(applicationId);
      
      const file = fileType === 'budget' 
        ? {
            url: application.grant.budgetFile,
            type: application.grant.budgetFileMimeType,
            filename: application.grant.budgetFileOriginalName
          }
        : {
            url: application.motivation.identityFile,
            type: application.motivation.identityFileMimeType,
            filename: application.motivation.identityFileOriginalName
          };

      console.log('File details:', file);

      const fileBuffer = await this.storageService.getFileBuffer(file.url);
      
      res.set({
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Content-Length': fileBuffer.length
      });

      return res.send(fileBuffer);
    } catch (error) {
      console.error('Download file error:', error);
      throw new NotFoundException('File not found or inaccessible');
    }
  }
} 