import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function verifyAdmin() {
  try {
    console.log('Checking admin account...');
    
    // Delete existing admin if exists
    await prisma.admin.deleteMany({
      where: { email: 'admin@sugria.com' }
    });
    console.log('Cleared existing admin accounts');

    // Create new admin
    const password = 'sugria@admin2024';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = await prisma.admin.create({
      data: {
        email: 'admin@sugria.com',
        password: hashedPassword,
        name: 'System Admin',
        role: 'admin'
      }
    });
    
    console.log('Admin created:', {
      id: newAdmin.id,
      email: newAdmin.email,
      role: newAdmin.role
    });

    // Verify password
    const isValid = await bcrypt.compare(password, newAdmin.password);
    console.log('Password verification:', isValid);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin(); 