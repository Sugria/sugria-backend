import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Use specific salt rounds for consistency
    const SALT_ROUNDS = 10;
    const password = 'admin@sugria2025';
    
    // Generate hash
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('\nCreating admin with:');
    console.log('Email:', 'admin@sugria.com');
    console.log('Password:', password);
    console.log('Generated hash:', hashedPassword);

    const admin = await prisma.admin.create({
      data: {
        email: 'admin@sugria.com',
        password: hashedPassword,
        name: 'Dashboard Admin',
        role: 'admin'
      }
    });

    // Test the password immediately
    const isValid = await bcrypt.compare(password, admin.password);
    console.log('\nVerification:');
    console.log('Password verification:', isValid);
    console.log('Stored hash matches generated hash:', admin.password === hashedPassword);

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

createAdmin(); 