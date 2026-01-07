import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📊 Adding device type variables...\n");

  // Get device types
  const deviceTypes = await prisma.deviceType.findMany();

  for (const dt of deviceTypes) {
    console.log(`\n📱 ${dt.name} (${dt.typeCode})`);

    // Check existing variables
    const existing = await prisma.deviceTypeVariable.count({
      where: { deviceTypeId: dt.id },
    });

    if (existing > 0) {
      console.log(`   Already has ${existing} variables, skipping`);
      continue;
    }

    // Add variables based on device type category
    const variables: Array<{
      variableCode: string;
      label: string;
      unit: string;
      minValue?: number;
      maxValue?: number;
      displayWidget: "numeric" | "gauge" | "tank_fill" | "chart_line" | "chart_bar" | "status_badge" | "custom";
    }> = [];

    switch (dt.category) {
      case "water":
        variables.push(
          { variableCode: "W", label: "Water Level", unit: "%", minValue: 0, maxValue: 100, displayWidget: "gauge" },
          { variableCode: "WP", label: "Water Pressure", unit: "bar", minValue: 0, maxValue: 10, displayWidget: "numeric" },
          { variableCode: "WC", label: "Water Consumption", unit: "L", minValue: 0, maxValue: 10000, displayWidget: "chart_line" }
        );
        break;
      case "power":
        variables.push(
          { variableCode: "V", label: "Voltage", unit: "V", minValue: 200, maxValue: 250, displayWidget: "numeric" },
          { variableCode: "A", label: "Current", unit: "A", minValue: 0, maxValue: 100, displayWidget: "numeric" },
          { variableCode: "KWH", label: "Energy", unit: "kWh", minValue: 0, maxValue: 10000, displayWidget: "chart_line" },
          { variableCode: "PF", label: "Power Factor", unit: "", minValue: 0, maxValue: 1, displayWidget: "gauge" }
        );
        break;
      case "environment":
        variables.push(
          { variableCode: "T", label: "Temperature", unit: "°C", minValue: -20, maxValue: 50, displayWidget: "gauge" },
          { variableCode: "H", label: "Humidity", unit: "%", minValue: 0, maxValue: 100, displayWidget: "gauge" },
          { variableCode: "P", label: "Pressure", unit: "hPa", minValue: 900, maxValue: 1100, displayWidget: "numeric" }
        );
        break;
      default:
        variables.push(
          { variableCode: "V1", label: "Value 1", unit: "", minValue: 0, maxValue: 100, displayWidget: "numeric" },
          { variableCode: "V2", label: "Value 2", unit: "", minValue: 0, maxValue: 100, displayWidget: "numeric" }
        );
    }

    // Create variables
    for (let i = 0; i < variables.length; i++) {
      const v = variables[i];
      await prisma.deviceTypeVariable.create({
        data: {
          deviceTypeId: dt.id,
          variableCode: v.variableCode,
          label: v.label,
          unit: v.unit,
          minValue: v.minValue,
          maxValue: v.maxValue,
          displayWidget: v.displayWidget,
          displayOrder: i,
          isAlertable: true,
        },
      });
      console.log(`   ✅ ${v.variableCode}: ${v.label} (${v.unit})`);
    }
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
