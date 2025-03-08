import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('Clearing database...');

    // Delete all records from each table in the correct order
    await prisma.declaration.deleteMany();
    await prisma.motivation.deleteMany();
    await prisma.training.deleteMany();
    await prisma.grant.deleteMany();
    await prisma.farm.deleteMany();
    await prisma.personal.deleteMany();
    await prisma.program.deleteMany();
    await prisma.application.deleteMany();
    await prisma.education.deleteMany();
    await prisma.member.deleteMany();
    
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase(); 