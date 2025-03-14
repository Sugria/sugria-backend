import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.admin.findUnique({
    where: { email: 'admin@sugria.com' }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('sugria@admin2024', 10);
    await prisma.admin.create({
      data: {
        email: 'admin@sugria.com',
        password: hashedPassword,
        name: 'System Admin',
        role: 'admin'
      }
    });
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // Read the recovery-email template
  const templatePath = path.join(process.cwd(), 'src/email/templates/recovery-email.hbs');
  const templateContent = fs.readFileSync(templatePath, 'utf-8');

  // Upsert the template
  await prisma.emailTemplate.upsert({
    where: { name: 'recovery-email' },
    update: {
      content: templateContent,
      subject: 'Complete Your SUGRiA Profile'
    },
    create: {
      name: 'recovery-email',
      content: templateContent,
      subject: 'Complete Your SUGRiA Profile'
    }
  });

  console.log('Email templates seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 