import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Assigning devices to subscriptions without devices...\n");

  // Find active subscriptions that don't have a tenant device
  const subscriptions = await prisma.subscription.findMany({
    where: { status: "active" },
    include: {
      product: true,
    },
  });

  console.log(`Found ${subscriptions.length} active subscription(s)\n`);

  for (const sub of subscriptions) {
    // Check if this subscription already has a device
    const existingDevice = await prisma.tenantDevice.findFirst({
      where: { subscriptionId: sub.id },
    });

    if (existingDevice) {
      console.log(`✅ Subscription ${sub.id} already has device ${existingDevice.id}`);
      continue;
    }

    console.log(`\n📋 Subscription ${sub.id}: ${sub.product.name}`);
    console.log(`   Tenant ID: ${sub.tenantId}`);
    console.log(`   Product Device Type ID: ${sub.product.deviceTypeId}`);

    if (!sub.product.deviceTypeId) {
      console.log(`   ⚠️ Product has no device type linked - skipping`);
      continue;
    }

    // Find available inventory
    const availableInventory = await prisma.deviceInventory.findFirst({
      where: {
        deviceTypeId: sub.product.deviceTypeId,
        status: "in_stock",
      },
      orderBy: { createdAt: "asc" },
    });

    if (!availableInventory) {
      console.log(`   ⚠️ No inventory available for device type ${sub.product.deviceTypeId}`);
      continue;
    }

    console.log(`   Found inventory: ${availableInventory.serialNumber}`);

    // Mark inventory as sold
    await prisma.deviceInventory.update({
      where: { id: availableInventory.id },
      data: { status: "sold" },
    });

    // Create tenant device
    const tenantDevice = await prisma.tenantDevice.create({
      data: {
        tenantId: sub.tenantId,
        subscriptionId: sub.id,
        inventoryId: availableInventory.id,
        status: "active",
        installedAt: null,
      },
    });

    console.log(`   ✅ Created TenantDevice ${tenantDevice.id} with serial ${availableInventory.serialNumber}`);
  }

  // Summary
  console.log("\n\n📊 Summary:");
  const deviceCount = await prisma.tenantDevice.count({ where: { status: "active" } });
  const subCount = await prisma.subscription.count({ where: { status: "active" } });
  console.log(`   Active Subscriptions: ${subCount}`);
  console.log(`   Active Devices: ${deviceCount}`);

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
