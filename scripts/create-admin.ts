import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Delete existing admin if exists
    await prisma.admin.deleteMany();

    // Create new admin
    const password = 'sugria@admin2024';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email: 'admin@sugria.com',
        password: hashedPassword,
        name: 'System Admin',
        role: 'admin'
      }
    });

    console.log('Admin created successfully:', {
      id: admin.id,
      email: admin.email,
      role: admin.role
    });

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 