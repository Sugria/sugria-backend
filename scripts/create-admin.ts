import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const prisma = new PrismaClient();

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${message} (yes/no): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function createAdmin() {
  try {
    // Check if admin exists
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      const shouldProceed = await confirm('Warning: Admin already exists. Do you want to proceed?');
      if (!shouldProceed) {
        console.log('Operation cancelled');
        return;
      }
    }

    // Use specific salt rounds for consistency
    const SALT_ROUNDS = 10;
    const password = 'admin@sugria2025';
    
    // Generate hash
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('\nCreating admin with:');
    console.log('Email:', 'admin@sugria.com');
    console.log('Password:', password);

    const admin = await prisma.admin.create({
      data: {
        email: 'admin@sugria.com',
        password: hashedPassword,
        name: 'Dashboard Admin',
        role: 'admin'
      }
    });

    console.log('\nAdmin created successfully:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name
    });

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Add confirmation before running in production
if (process.env.NODE_ENV === 'production') {
  confirm('You are in PRODUCTION environment. Are you sure you want to proceed?')
    .then(shouldProceed => {
      if (shouldProceed) createAdmin();
      else console.log('Operation cancelled');
    });
} else {
  createAdmin();
} 