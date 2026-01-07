# Mechatronics - Smart Utility IoT SaaS Platform

A multi-tenant IoT monitoring platform for water, power, and temperature sensors. Built for homes, SMEs, estates, and schools across Africa.

## Features

- **Multi-tenant Architecture**: Separate tenant accounts with team management
- **Device Monitoring**: Real-time monitoring of water tanks, power consumption, and coldroom temperatures
- **Alert System**: Configurable alert rules with SMS, email, and push notifications
- **AI Insights**: Predictive maintenance and usage pattern analysis
- **Reports & Analytics**: Comprehensive reporting with CSV/Excel/PDF export
- **Payment Integration**: Paystack payment gateway for subscriptions
- **Admin Panel**: Full device inventory, order management, and tenant oversight

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon) with Prisma 6
- **Authentication**: NextAuth.js v5 (dual auth: tenant + admin)
- **Styling**: TailwindCSS + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Validation**: Zod

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update `.env` with your MySQL credentials:

```env
DATABASE_URL="mysql://root:password@localhost:3306/homebot_next"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
```

### 3. Create Database

Create a MySQL database named `homebot_next`:

```sql
CREATE DATABASE homebot_next;
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Seed Demo Data (Optional)

```bash
npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Device Data Ingestion

IoT devices can send data to:

**POST /api/ingest**
```json
{
  "serial": "DEVICE_SERIAL",
  "data": {
    "T": 25.5,
    "WP": 30,
    "K": 3.5
  }
}
```

**GET /api/ingest**
```
/api/ingest?serial=DEVICE_SERIAL&T=25.5&WP=30
```

### User Endpoints

- `GET /api/devices` - Get user's devices
- `GET /api/devices/[deviceId]/readings` - Get device readings

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (login, register)
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   │   ├── frostlink/    # FrostLink device dashboard
│   │   ├── electra/      # Electra device dashboard
│   │   └── hydrolink/    # HydroLink device dashboard
│   └── page.tsx          # Landing page
├── components/
│   ├── dashboard/        # Dashboard components
│   ├── dashboards/       # Device-specific dashboards
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
└── types/                # TypeScript types
```

## Device Types

| Device | Code | Variables |
|--------|------|-----------|
| FrostLink | FROST | T (Temperature), AC1, IN1, IN2 |
| Electra | ELEC | K (Power kW), PS (Power Status), EG (Generator) |
| HydroLink | WAT101 | WL (Water Level), WP (Water Pressure), WC (Consumption), WS (Status) |

## UI System & Design Guidelines

The platform follows the "Clean Industrial Intelligence" design language defined in `docs/designUI.prompt`.

### Design Tokens

Design tokens are centralized in `src/app/globals.css`:

```css
/* Light-first UI */
--background: oklch(0.985 0 0);  /* Soft off-white */
--card: oklch(1 0 0);            /* Pure white cards */

/* Primary: Trust blue/indigo */
--primary: oklch(0.488 0.243 264.376);

/* Status Colors (never used as brand) */
--status-success: oklch(0.72 0.19 142);
--status-warning: oklch(0.8 0.18 85);
--status-danger: oklch(0.63 0.24 25);

/* Motion */
--duration-fast: 150ms;
--duration-normal: 250ms;
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
```

### Motion Rules

- **Duration**: 150-250ms for most transitions
- **Easing**: `ease-in-out` or `cubic-bezier(0.4, 0, 0.2, 1)`
- **Purpose**: Motion explains state, confirms action, or guides attention
- **Style**: Calm, confidence-building - no bouncy effects

### Dashboard Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `SystemHealthBar` | `components/dashboard/` | Real-time system status |
| `AIInsightsWidget` | `components/dashboard/` | AI-powered insights display |
| `AlertsPanel` | `components/dashboard/` | Open alerts with subtle styling |
| `DeviceCard` | `components/dashboard/` | Device status with live values |
| `TrendChart` | `components/dashboard/` | Recharts area/line charts |
| `Skeleton` | `components/ui/` | Loading placeholders |
| `EmptyState` | `components/ui/` | Friendly empty states |

### Layout Structure

Dashboard follows a 12-column grid:
- **Top strip**: SystemHealthBar (7 cols) + AIInsightsWidget (5 cols)
- **Main content**: DeviceGrid (8 cols) + AlertsPanel (4 cols)
- **Analytics**: TrendCharts (full width)

## License

© 2026 Mechatronics. All rights reserved.
