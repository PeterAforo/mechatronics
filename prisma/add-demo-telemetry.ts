import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📊 Adding demo telemetry data...\n");

  // Get all tenant devices
  const devices = await prisma.tenantDevice.findMany({
    where: { status: "active" },
    include: {
      inventory: true,
    },
  });

  console.log(`Found ${devices.length} active device(s)\n`);

  for (const device of devices) {
    if (!device.inventory) continue;

    // Get device type
    const deviceType = await prisma.deviceType.findUnique({
      where: { id: device.inventory.deviceTypeId },
    });

    if (!deviceType) continue;

    // Get variables for this device type
    const variables = await prisma.deviceTypeVariable.findMany({
      where: { deviceTypeId: deviceType.id },
    });

    console.log(`\n📱 Device: ${device.inventory.serialNumber} (${deviceType.name})`);
    console.log(`   Variables: ${variables.map(v => v.variableCode).join(", ")}`);

    // Generate 24 hours of demo data (one reading every 30 minutes)
    const now = new Date();
    const readings = 48; // 24 hours * 2 readings per hour

    // Create inbound message
    const message = await prisma.inboundMessage.create({
      data: {
        tenantId: device.tenantId,
        tenantDeviceId: device.id,
        inventoryId: device.inventoryId,
        source: "import",
        rawText: "Demo telemetry data import",
        parseStatus: "parsed",
      },
    });

    let totalReadings = 0;

    for (let i = 0; i < readings; i++) {
      const capturedAt = new Date(now.getTime() - i * 30 * 60 * 1000); // 30 min intervals

      for (const variable of variables) {
        // Generate realistic values based on variable type
        let baseValue = 50;
        let variance = 10;

        switch (variable.variableCode.toUpperCase()) {
          case "T":
          case "TEMP":
          case "TEMPERATURE":
            baseValue = 25; // 25°C base
            variance = 5;
            break;
          case "H":
          case "HUM":
          case "HUMIDITY":
            baseValue = 60; // 60% humidity
            variance = 15;
            break;
          case "P":
          case "PRESSURE":
            baseValue = 1013; // 1013 hPa
            variance = 10;
            break;
          case "W":
          case "WATER":
          case "LEVEL":
            baseValue = 75; // 75% water level
            variance = 20;
            break;
          case "V":
          case "VOLTAGE":
            baseValue = 220; // 220V
            variance = 5;
            break;
          case "A":
          case "CURRENT":
          case "AMPS":
            baseValue = 5; // 5A
            variance = 2;
            break;
          case "KWH":
          case "ENERGY":
            baseValue = 150 + i * 0.5; // Increasing energy consumption
            variance = 5;
            break;
        }

        // Add some realistic variation (sine wave + random noise)
        const sineVariation = Math.sin(i / 6) * (variance / 2);
        const randomNoise = (Math.random() - 0.5) * variance;
        const value = baseValue + sineVariation + randomNoise;

        await prisma.telemetryKv.create({
          data: {
            tenantId: device.tenantId,
            tenantDeviceId: device.id,
            messageId: message.id,
            variableCode: variable.variableCode,
            value: Math.round(value * 100) / 100,
            capturedAt,
          },
        });
        totalReadings++;
      }
    }

    // Update device last seen
    await prisma.tenantDevice.update({
      where: { id: device.id },
      data: { lastSeenAt: now },
    });

    console.log(`   ✅ Created ${totalReadings} telemetry readings`);
  }

  // Summary
  const totalTelemetry = await prisma.telemetryKv.count();
  console.log(`\n\n📊 Total telemetry records: ${totalTelemetry}`);
  console.log("✅ Done!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
