const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.adminUser.findMany();
  
  console.log('\n=== ADMIN USERS IN DATABASE ===\n');
  users.forEach(u => {
    console.log(`ID: ${u.id}`);
    console.log(`Email: ${u.email}`);
    console.log(`Full Name: ${u.fullName}`);
    console.log(`Role: ${u.role}`);
    console.log(`Password Hash: ${u.passwordHash.substring(0, 30)}...`);
    console.log(`Is Active: ${u.isActive}`);
    console.log('---');
  });
  
  await prisma.$disconnect();
}

checkUsers().catch(console.error);
