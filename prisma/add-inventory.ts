import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateSerialNumber(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function generateIMEI(): string {
  let imei = "35";
  for (let i = 0; i < 13; i++) {
    imei += Math.floor(Math.random() * 10).toString();
  }
  return imei;
}

function generateSIMNumber(): string {
  let sim = "8923";
  for (let i = 0; i < 15; i++) {
    sim += Math.floor(Math.random() * 10).toString();
  }
  return sim;
}

async function main() {
  console.log("📦 Adding inventory for all device types...\n");

  // Get all device types
  const deviceTypes = await prisma.deviceType.findMany({
    where: { isActive: true },
  });

  console.log(`Found ${deviceTypes.length} active device types\n`);

  for (const deviceType of deviceTypes) {
    console.log(`\n📱 Device Type: ${deviceType.name} (${deviceType.typeCode})`);
    
    // Check existing inventory count
    const existingCount = await prisma.deviceInventory.count({
      where: { deviceTypeId: deviceType.id, status: "in_stock" },
    });
    
    console.log(`   Existing in_stock: ${existingCount}`);

    // Add 5 units for each device type
    const unitsToAdd = 5;
    console.log(`   Adding ${unitsToAdd} new units...`);

    for (let i = 0; i < unitsToAdd; i++) {
      const serialNumber = generateSerialNumber(deviceType.typeCode);
      const imei = generateIMEI();
      const simNumber = generateSIMNumber();

      await prisma.deviceInventory.create({
        data: {
          deviceTypeId: deviceType.id,
          serialNumber,
          imei,
          simNumber,
          status: "in_stock",
          firmwareVersion: "1.0.0",
        },
      });

      console.log(`   ✅ Created: ${serialNumber}`);
    }
  }

  // Summary
  console.log("\n\n📊 Inventory Summary:");
  const summary = await prisma.deviceInventory.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  for (const item of summary) {
    console.log(`   ${item.status}: ${item._count.id} units`);
  }

  // Get products and their device types
  console.log("\n\n🛒 Products with Device Types:");
  const products = await prisma.deviceProduct.findMany({
    where: { isPublished: true },
  });

  for (const product of products) {
    const deviceType = product.deviceTypeId 
      ? await prisma.deviceType.findUnique({ where: { id: product.deviceTypeId } })
      : null;
    
    const inventoryCount = product.deviceTypeId
      ? await prisma.deviceInventory.count({
          where: { deviceTypeId: product.deviceTypeId, status: "in_stock" },
        })
      : 0;

    console.log(`   ${product.name}`);
    console.log(`      Device Type: ${deviceType?.name || "❌ NOT LINKED"}`);
    console.log(`      Available Inventory: ${inventoryCount}`);
  }

  console.log("\n✅ Done!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
