import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Create new admin with dashboard credentials
    const password = 'admin@sugria2025'; // New password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hash:', hashedPassword);

    const admin = await prisma.admin.create({
      data: {
        email: 'admin@sugria.com',
        password: hashedPassword,
        name: 'Dashboard Admin',
        role: 'admin'
      }
    });

    console.log('Admin created successfully:', {
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