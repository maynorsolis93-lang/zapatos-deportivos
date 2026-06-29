const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'maymesm@yahoo.com';
  const password = 'Solislidia123';
  const fullName = 'Admin Solís';
  
  // Hash password with bcrypt
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create or update admin user
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      fullName,
      isActive: true
    },
    create: {
      email,
      passwordHash,
      fullName,
      role: 'admin',
      isActive: true
    }
  });
  
  console.log('\n✅ Admin user created/updated successfully!');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Full Name: ${admin.fullName}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   Password: ${password}`);
  console.log(`   Hash (bcrypt): ${passwordHash.substring(0, 30)}...`);
  
  await prisma.$disconnect();
}

createAdmin().catch(error => {
  console.error('Error creating admin:', error);
  process.exit(1);
});
