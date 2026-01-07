import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for Multi-Tenant IoT SaaS (PostgreSQL)...");

  // ============== ADMIN USER ==============
  const adminPassword = await hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@mechatronics.com" },
    update: { name: "Super Admin" },
    create: {
      email: "admin@mechatronics.com",
      passwordHash: adminPassword,
      name: "Super Admin",
      role: "superadmin",
      status: "active",
    },
  });
  console.log("✅ Created admin user: admin@mechatronics.com / admin123");

  // ============== DEVICE TYPES ==============
  const waterType = await prisma.deviceType.upsert({
    where: { typeCode: "WAT100" },
    update: {},
    create: {
      typeCode: "WAT100",
      name: "Water Level Monitor",
      category: "water",
      description: "Monitors water tank levels with pressure sensing",
      manufacturer: "Mechatronics",
      communicationProtocol: "sms",
      isActive: true,
    },
  });

  const powerType = await prisma.deviceType.upsert({
    where: { typeCode: "PWR100" },
    update: {},
    create: {
      typeCode: "PWR100",
      name: "Power Monitor",
      category: "power",
      description: "Tracks power consumption and generator status",
      manufacturer: "Mechatronics",
      communicationProtocol: "sms",
      isActive: true,
    },
  });

  const tempType = await prisma.deviceType.upsert({
    where: { typeCode: "TMP100" },
    update: {},
    create: {
      typeCode: "TMP100",
      name: "Temperature Monitor",
      category: "environment",
      description: "Coldroom and environment temperature monitoring",
      manufacturer: "Mechatronics",
      communicationProtocol: "sms",
      isActive: true,
    },
  });
  console.log("✅ Created device types");

  // ============== DEVICE PRODUCTS ==============
  await prisma.deviceProduct.upsert({
    where: { productCode: "HYDRO-BASIC" },
    update: { isPublished: true },
    create: {
      productCode: "HYDRO-BASIC",
      name: "HydroLink Basic",
      shortDescription: "Water level monitoring for homes and small businesses",
      description: "Monitor your water tank levels in real-time. Get alerts when water is low.",
      category: "water",
      deviceTypeId: waterType.id,
      setupFee: 150.00,
      monthlyFee: 25.00,
      currency: "GHS",
      isPublished: true,
    },
  });

  await prisma.deviceProduct.upsert({
    where: { productCode: "HYDRO-PRO" },
    update: { isPublished: true },
    create: {
      productCode: "HYDRO-PRO",
      name: "HydroLink Pro",
      shortDescription: "Advanced water monitoring with pressure sensing",
      description: "Professional water monitoring with tank level, pressure sensing, and consumption tracking.",
      category: "water",
      deviceTypeId: waterType.id,
      setupFee: 350.00,
      monthlyFee: 50.00,
      currency: "GHS",
      isPublished: true,
    },
  });

  await prisma.deviceProduct.upsert({
    where: { productCode: "ELECTRA-HOME" },
    update: { isPublished: true },
    create: {
      productCode: "ELECTRA-HOME",
      name: "Electra Home",
      shortDescription: "Power consumption monitoring for homes",
      description: "Track your electricity usage in real-time. Monitor generator status.",
      category: "power",
      deviceTypeId: powerType.id,
      setupFee: 200.00,
      monthlyFee: 30.00,
      currency: "GHS",
      isPublished: true,
    },
  });

  await prisma.deviceProduct.upsert({
    where: { productCode: "ELECTRA-IND" },
    update: { isPublished: true },
    create: {
      productCode: "ELECTRA-IND",
      name: "Electra Industrial",
      shortDescription: "Industrial power monitoring solution",
      description: "Comprehensive power monitoring for factories and large facilities.",
      category: "power",
      deviceTypeId: powerType.id,
      setupFee: 500.00,
      monthlyFee: 100.00,
      currency: "GHS",
      isPublished: true,
    },
  });

  await prisma.deviceProduct.upsert({
    where: { productCode: "FROST-COLD" },
    update: { isPublished: true },
    create: {
      productCode: "FROST-COLD",
      name: "FrostLink Coldroom",
      shortDescription: "Coldroom temperature monitoring",
      description: "Ensure your coldroom stays at the right temperature. Get instant alerts.",
      category: "environment",
      deviceTypeId: tempType.id,
      setupFee: 250.00,
      monthlyFee: 40.00,
      currency: "GHS",
      isPublished: true,
    },
  });
  console.log("✅ Created device products");

  // ============== DEMO INVENTORY ==============
  for (let i = 1; i <= 3; i++) {
    const serial = `WAT-2024-000${i}`;
    await prisma.deviceInventory.upsert({
      where: { serialNumber: serial },
      update: {},
      create: {
        deviceTypeId: waterType.id,
        serialNumber: serial,
        status: "in_stock",
        notes: "Demo unit for testing",
      },
    });
  }
  console.log("✅ Created demo inventory");

  console.log("🎉 Seeding complete!");
  console.log("");
  console.log("📋 Login credentials:");
  console.log("   Admin: admin@mechatronics.com / admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
