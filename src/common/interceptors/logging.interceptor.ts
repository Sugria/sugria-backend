import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Only log in development mode
    if (!this.isDevelopment) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();
    const { method, url, body } = req;
    const now = Date.now();

    // Print request details
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 REQUEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`${method} ${url}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    if (Object.keys(body).length > 0) {
      console.log('\nRequest Body:');
      console.log(JSON.stringify(body, null, 2));
    }

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - now;

          // Print response details
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📬 RESPONSE');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`Duration: ${duration}ms`);
          
          // Only log response if it's not a file stream
          if (!(response instanceof Buffer)) {
            try {
              console.log('\nResponse Body:');
              console.log(JSON.stringify(response, null, 2));
            } catch (error) {
              console.log('Response body is not JSON-serializable');
            }
          } else {
            console.log('Response is a file stream');
          }
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        },
        error: (error) => {
          const duration = Date.now() - now;

          // Print error details
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('❌ ERROR');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`Duration: ${duration}ms`);
          console.log('\nError Details:');
          console.log(error.message || error);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        },
      }),
    );
  }
} 