const path = require("node:path");
const fs = require("node:fs/promises");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// RUTA SIMPLIFICADA: Busca el archivo store.json en la raíz de la carpeta actual
const STORE_PATH = path.join(process.cwd(), "store.json");

function parsePriceToNumber(priceRaw) {
  if (!priceRaw || typeof priceRaw !== "string") return 0;
  const numeric = priceRaw.replace(/[^\d.]/g, "");
  return numeric ? Number(numeric) : 0;
}

function parseSizes(rawSizes) {
  if (!rawSizes || typeof rawSizes !== "string") return [];
  return rawSizes
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean)
    .filter((value, idx, arr) => arr.indexOf(value) === idx);
}

function normalizeAudience(value) {
  const map = {
    ninos: "ninos",
    niños: "ninos",
    adolescentes: "adolescentes",
    damas: "damas",
    caballeros: "caballeros",
  };
  return map[String(value || "").toLowerCase()] || "caballeros";
}

function normalizeCategory(value) {
  const map = {
    deportivos: "deportivos",
    casuales: "casuales",
    formales: "formales",
  };
  return map[String(value || "").toLowerCase()] || "casuales";
}

function safeStockFromBadge(badge) {
  return badge === "No disponible" ? 0 : 8;
}

async function upsertProduct(product) {
  const audienceCode = normalizeAudience(product.persona);
  const categoryCode = normalizeCategory(product.tipo);
  const basePrice = parsePriceToNumber(product.price);
  const sizes = parseSizes(product.sizes);

  // Intentar buscar o crear la Audiencia si no existe
  let audience = await prisma.audience.findUnique({ where: { code: audienceCode } });
  if (!audience) {
    audience = await prisma.audience.create({ data: { code: audienceCode, label: audienceCode.toUpperCase() } });
  }

  // Intentar buscar o crear la Categoría si no existe
  let category = await prisma.category.findUnique({ where: { code: categoryCode } });
  if (!category) {
    category = await prisma.category.create({ data: { code: categoryCode, label: categoryCode.toUpperCase() } });
  }

  const created = await prisma.product.upsert({
    where: { sku: `legacy-${product.id}` },
    update: {
      name: product.name,
      description: product.desc || null,
      basePrice,
      badge: product.badge || null,
      isActive: product.badge !== "No disponible",
      audienceId: audience.id,
      categoryId: category.id,
    },
    create: {
      sku: `legacy-${product.id}`,
      name: product.name,
      description: product.desc || null,
      basePrice,
      badge: product.badge || null,
      isActive: product.badge !== "No disponible",
      audienceId: audience.id,
      categoryId: category.id,
    },
  });

  await prisma.productImage.deleteMany({
    where: { productId: created.id },
  });

  await prisma.productImage.create({
    data: {
      imageUrl: product.img || "",
      altText: product.name,
      sortOrder: 0,
      productId: created.id,
    },
  });

  if (!sizes.length) return created;

  for (const sizeCode of sizes) {
    // Buscar o crear la Talla (Size) para que no falle por falta de datos previos
    let size = await prisma.size.findUnique({ where: { code: sizeCode } });
    if (!size) {
      size = await prisma.size.create({ data: { code: sizeCode, sortOrder: 0 } });
    }

    await prisma.productVariant.upsert({
      where: {
        productId_sizeId: {
          productId: created.id,
          sizeId: size.id,
        },
      },
      update: {
        stockQty: safeStockFromBadge(product.badge),
        reservedQty: 0,
      },
      create: {
        productId: created.id,
        sizeId: size.id,
        stockQty: safeStockFromBadge(product.badge),
        reservedQty: 0,
      },
    });
  }

  return created;
}

async function main() {
  console.log("Iniciando importación desde:", STORE_PATH);
  
  try {
    const content = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(content);
    const products = Array.isArray(parsed.products) ? parsed.products : [];

    if (products.length === 0) {
      console.log("No se encontraron productos en el archivo JSON.");
      return;
    }

    let imported = 0;
    for (const product of products) {
      const result = await upsertProduct(product);
      if (result) imported += 1;
    }

    console.log(`\n✅ Importación completada.`);
    console.log(`👟 Productos procesados: ${imported}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error("❌ ERROR: No se encontró el archivo store.json en la carpeta backend.");
    } else {
      console.error("❌ ERROR inesperado:", err.message);
    }
  }
}

main()
  .catch((error) => {
    console.error("Error crítico:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });