const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = "maymesm@yahoo.com"; // Tu correo de admin
  const password = "Solislidia123"; // CAMBIA ESTO por algo real
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: "Admin Solís"
    }
  });

  console.log(`\n✅ Usuario administrador creado exitosamente: ${user.email}`);
  console.log(`⚠️  Recuerda borrar o proteger este script después de usarlo.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());