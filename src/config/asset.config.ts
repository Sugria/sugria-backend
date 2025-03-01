import { registerAs } from '@nestjs/config';

export default registerAs('asset', () => ({
  baseUrl: process.env.NODE_ENV === 'development' 
    ? process.env.DEV_ASSET_BASE_URL 
    : process.env.ASSET_BASE_URL,
  useLocalImages: process.env.NODE_ENV === 'development',
})); 