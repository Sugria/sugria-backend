import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5001,
  cors: {
    enabled: true,
    origin: process.env.CORS_ORIGIN || '*',
  },
  swagger: {
    enabled: true,
    title: 'SUGRiA Movement API',
    description: 'API for joining the SUGRiA movement',
    version: '1.0',
    path: 'api',
  },
})); 