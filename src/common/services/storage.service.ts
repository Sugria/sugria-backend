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
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `sugria/${folder}`,
          resource_type: 'auto',
          format: 'pdf',  // Force PDF format for PDFs
          flags: 'attachment',  // Allow direct download
          type: 'upload'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  // No need for signed URLs as Cloudinary URLs are public but secure
  async getSignedUrl(url: string): Promise<string> {
    return url;
  }

  async getFileBuffer(url: string): Promise<Buffer> {
    try {
      // Extract public ID and version from URL
      const matches = url.match(/\/v(\d+)\/(.+?)(?:\.[^.]+)?$/);
      if (!matches) {
        throw new Error('Invalid Cloudinary URL');
      }

      const [, version, publicId] = matches;

      // Generate signed URL
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = cloudinary.utils.api_sign_request(
        { public_id: publicId, version, timestamp },
        this.configService.get('CLOUDINARY_API_SECRET')
      );

      // Construct authenticated URL
      const signedUrl = `${url}?api_key=${this.configService.get('CLOUDINARY_API_KEY')}&timestamp=${timestamp}&signature=${signature}`;

      const response = await axios.get(signedUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': '*/*'
        }
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('File fetch error:', error);
      throw new NotFoundException('File not found or inaccessible');
    }
  }
} 