const { PrismaClient } = require("@prisma/client");
const crypto = require("node:crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function seedCategories() {
  const categories = [
    { code: "deportivos", label: "Deportivos" },
    { code: "casuales", label: "Casuales" },
    { code: "formales", label: "Formales" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { code: category.code },
      update: { label: category.label },
      create: category,
    });
  }
}

async function seedAudiences() {
  const audiences = [
    { code: "ninos", label: "Ninos y Ninas" },
    { code: "adolescentes", label: "Adolescentes" },
    { code: "damas", label: "Damas" },
    { code: "caballeros", label: "Caballeros" },
  ];

  for (const audience of audiences) {
    await prisma.audience.upsert({
      where: { code: audience.code },
      update: { label: audience.label },
      create: audience,
    });
  }
}

async function seedSizes() {
  for (let size = 20; size <= 45; size += 1) {
    await prisma.size.upsert({
      where: { code: String(size) },
      update: { sortOrder: size },
      create: { code: String(size), sortOrder: size },
    });
  }
}

async function seedAdmin() {
  const adminEmail = "admin@kiroshoes.local";
  const adminPassword = "Admin12345";

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { fullName: "Administrador Kiro Shoes", isActive: true },
    create: {
      fullName: "Administrador Kiro Shoes",
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: "admin",
      isActive: true,
    },
  });

  return { adminEmail, adminPassword };
}

async function main() {
  await seedCategories();
  await seedAudiences();
  await seedSizes();
  const credentials = await seedAdmin();

  console.log("Seed completado.");
  console.log("Admin inicial:");
  console.log(`- email: ${credentials.adminEmail}`);
  console.log(`- password: ${credentials.adminPassword}`);
}

main()
  .catch((error) => {
    console.error("Error en seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
