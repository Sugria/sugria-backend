import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = 'Rate limit exceeded';
  
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip;
  }
} 