import { hash } from "bcryptjs";
import "dotenv/config";

const { PrismaClient } = require("@prisma/client");
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
  await prisma.$executeRaw`
    INSERT INTO device_types (type_code, name, category, description, manufacturer, communication_protocol, is_active)
    VALUES 
      ('WAT100', 'Water Level Monitor', 'water', 'Monitors water tank levels with pressure sensing', 'Mechatronics', 'sms', 1),
      ('PWR100', 'Power Monitor', 'power', 'Tracks power consumption and generator status', 'Mechatronics', 'sms', 1),
      ('TMP100', 'Temperature Monitor', 'environment', 'Coldroom and environment temperature monitoring', 'Mechatronics', 'sms', 1)
    ON DUPLICATE KEY UPDATE name = VALUES(name)
  `;
  console.log("✅ Created device types");

  // Get device type IDs
  const waterType = await prisma.$queryRaw`SELECT device_type_id FROM device_types WHERE type_code = 'WAT100'`;
  const powerType = await prisma.$queryRaw`SELECT device_type_id FROM device_types WHERE type_code = 'PWR100'`;
  const tempType = await prisma.$queryRaw`SELECT device_type_id FROM device_types WHERE type_code = 'TMP100'`;

  const waterTypeId = waterType[0]?.device_type_id;
  const powerTypeId = powerType[0]?.device_type_id;
  const tempTypeId = tempType[0]?.device_type_id;

  // ============== DEVICE TYPE VARIABLES ==============
  if (waterTypeId) {
    await prisma.$executeRaw`
      INSERT INTO device_type_variables (device_type_id, variable_code, label, unit, min_value, max_value, display_widget, display_order, is_alertable)
      VALUES 
        (${waterTypeId}, 'W', 'Water Level', '%', 0, 100, 'tank_fill', 1, 1),
        (${waterTypeId}, 'WP', 'Water Pressure', 'PSIG', 0, 40, 'gauge', 2, 1),
        (${waterTypeId}, 'WC', 'Water Consumption', 'L', 0, 999999, 'numeric', 3, 0)
      ON DUPLICATE KEY UPDATE label = VALUES(label)
    `;
    console.log("✅ Created water monitor variables");
  }

  if (powerTypeId) {
    await prisma.$executeRaw`
      INSERT INTO device_type_variables (device_type_id, variable_code, label, unit, min_value, max_value, display_widget, display_order, is_alertable)
      VALUES 
        (${powerTypeId}, 'K', 'Power', 'kW', 0, 100, 'gauge', 1, 1),
        (${powerTypeId}, 'KWH', 'Energy', 'kWh', 0, 999999, 'numeric', 2, 0),
        (${powerTypeId}, 'V', 'Voltage', 'V', 0, 500, 'gauge', 3, 1),
        (${powerTypeId}, 'PS', 'Power Status', '', 0, 1, 'status_badge', 4, 1),
        (${powerTypeId}, 'EG', 'Generator', '', 0, 1, 'status_badge', 5, 1)
      ON DUPLICATE KEY UPDATE label = VALUES(label)
    `;
    console.log("✅ Created power monitor variables");
  }

  if (tempTypeId) {
    await prisma.$executeRaw`
      INSERT INTO device_type_variables (device_type_id, variable_code, label, unit, min_value, max_value, display_widget, display_order, is_alertable)
      VALUES 
        (${tempTypeId}, 'T', 'Temperature', '°C', -40, 60, 'gauge', 1, 1),
        (${tempTypeId}, 'H', 'Humidity', '%', 0, 100, 'gauge', 2, 1),
        (${tempTypeId}, 'AC1', 'AC Power', '', 0, 1, 'status_badge', 3, 1)
      ON DUPLICATE KEY UPDATE label = VALUES(label)
    `;
    console.log("✅ Created temperature monitor variables");
  }

  // ============== DEVICE PRODUCTS ==============
  await prisma.$executeRaw`
    INSERT INTO device_products (product_code, name, short_description, description, category, device_type_id, setup_fee, monthly_fee, currency, is_published)
    VALUES 
      ('HYDRO-BASIC', 'HydroLink Basic', 'Water level monitoring for homes and small businesses', 'Monitor your water tank levels in real-time. Get alerts when water is low. View consumption history and trends. Perfect for homes, apartments, and small businesses.', 'water', ${waterTypeId}, 150.00, 25.00, 'GHS', 1),
      ('HYDRO-PRO', 'HydroLink Pro', 'Advanced water monitoring with pressure sensing', 'Professional water monitoring with tank level, pressure sensing, and consumption tracking. Ideal for farms, hotels, and industrial applications.', 'water', ${waterTypeId}, 350.00, 50.00, 'GHS', 1),
      ('ELECTRA-HOME', 'Electra Home', 'Power consumption monitoring for homes', 'Track your electricity usage in real-time. Monitor generator status. Get alerts for power outages. Reduce your electricity bills.', 'power', ${powerTypeId}, 200.00, 30.00, 'GHS', 1),
      ('ELECTRA-IND', 'Electra Industrial', 'Industrial power monitoring solution', 'Comprehensive power monitoring for factories and large facilities. Track multiple phases, peak demand, and power quality.', 'power', ${powerTypeId}, 500.00, 100.00, 'GHS', 1),
      ('FROST-COLD', 'FrostLink Coldroom', 'Coldroom temperature monitoring', 'Ensure your coldroom stays at the right temperature. Get instant alerts if temperature rises. Perfect for restaurants, pharmacies, and food storage.', 'environment', ${tempTypeId}, 250.00, 40.00, 'GHS', 1)
    ON DUPLICATE KEY UPDATE name = VALUES(name), is_published = 1
  `;
  console.log("✅ Created device products");

  // ============== VARIABLE RECOMMENDATIONS ==============
  if (waterTypeId) {
    await prisma.$executeRaw`
      INSERT INTO variable_recommendations (device_type_id, variable_code, rule_operator, rule_value_1, title, message, severity, is_active)
      VALUES 
        (${waterTypeId}, 'W', '<=', 20, 'Low Water Level', 'Your water tank is running low. Consider refilling soon to avoid running out.', 'warning', 1),
        (${waterTypeId}, 'W', '<=', 10, 'Critical Water Level', 'Your water tank is critically low! Refill immediately to avoid disruption.', 'critical', 1),
        (${waterTypeId}, 'W', '>=', 90, 'Tank Nearly Full', 'Your water tank is almost full. Great job maintaining your water supply!', 'info', 1)
      ON DUPLICATE KEY UPDATE title = VALUES(title)
    `;
    console.log("✅ Created water recommendations");
  }

  // ============== DEMO INVENTORY ==============
  if (waterTypeId) {
    await prisma.$executeRaw`
      INSERT INTO device_inventory (device_type_id, serial_number, status, notes)
      VALUES 
        (${waterTypeId}, 'WAT-2024-0001', 'in_stock', 'Demo unit for testing'),
        (${waterTypeId}, 'WAT-2024-0002', 'in_stock', 'Demo unit for testing'),
        (${waterTypeId}, 'WAT-2024-0003', 'in_stock', 'Demo unit for testing')
      ON DUPLICATE KEY UPDATE notes = VALUES(notes)
    `;
    console.log("✅ Created demo inventory");
  }

  // ============== ALERT RULES ==============
  if (waterTypeId) {
    await prisma.$executeRaw`
      INSERT INTO alert_rules (tenant_id, device_type_id, variable_code, rule_name, operator, threshold_1, severity, message_template, is_active)
      VALUES 
        (NULL, ${waterTypeId}, 'W', 'Low Water Alert', '<=', 20, 'warning', 'Water level is at {value}%. Please refill soon.', 1),
        (NULL, ${waterTypeId}, 'W', 'Critical Water Alert', '<=', 10, 'critical', 'URGENT: Water level is critically low at {value}%!', 1)
      ON DUPLICATE KEY UPDATE rule_name = VALUES(rule_name)
    `;
    console.log("✅ Created default alert rules");
  }

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
