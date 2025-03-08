import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';

@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {
    // Initialize Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      console.log('Uploading file to Cloudinary:', {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        folder: folder
      });

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `sugria/${folder}`,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              return reject(error);
            }
            console.log('File uploaded successfully:', result.secure_url);
            resolve(result.secure_url);
          }
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // No need for signed URLs as Cloudinary URLs are public but secure
  async getSignedUrl(url: string): Promise<string> {
    return url;
  }

  async getFileBuffer(url: string): Promise<Buffer> {
    try {
      console.log('Fetching file from Cloudinary:', url);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0'
        }
      });

      console.log('File fetched successfully, size:', response.data.length);
      return Buffer.from(response.data);
    } catch (error) {
      console.error('File fetch error:', error);
      throw new NotFoundException('File not found or inaccessible');
    }
  }
} 