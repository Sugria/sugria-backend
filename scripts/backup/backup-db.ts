import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(__dirname, '../../backups');
const MAX_BACKUPS = 7; // Keep a week's worth of backups

async function backup() {
  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    // Get all data
    const data = await prisma.$transaction([
      prisma.admin.findMany(),
      prisma.member.findMany(),
      prisma.application.findMany(),
      // Add other models as needed
    ]);

    // Write to file
    fs.writeFileSync(filepath, JSON.stringify({
      admin: data[0],
      members: data[1],
      applications: data[2],
      // Add other models as needed
      timestamp: new Date().toISOString()
    }, null, 2));

    console.log(`Backup created: ${filename}`);

    // Clean old backups
    const files = fs.readdirSync(BACKUP_DIR);
    if (files.length > MAX_BACKUPS) {
      const oldFiles = files
        .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time)
        .slice(MAX_BACKUPS)
        .map(f => f.name);

      oldFiles.forEach(file => {
        fs.unlinkSync(path.join(BACKUP_DIR, file));
        console.log(`Deleted old backup: ${file}`);
      });
    }
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1); // Exit with error code
  } finally {
    await prisma.$disconnect();
  }
}

backup(); 