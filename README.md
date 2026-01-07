# HomeBot - IoT Device Monitoring Platform

A Next.js application for monitoring IoT devices including FrostLink (temperature), Electra (power), and HydroLink (water) monitors.

## Features

- **Authentication**: User registration, login, and session management
- **Device Selection**: Dashboard showing all assigned devices
- **FrostLink Dashboard**: Temperature monitoring with AC1, IN1, IN2 inputs
- **Electra Dashboard**: Power consumption, generator status tracking
- **HydroLink Dashboard**: Water level, pressure, and consumption monitoring
- **Real-time Charts**: Historical data visualization with Recharts
- **API for Device Ingestion**: Endpoints for IoT devices to send data

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: TailwindCSS + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

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

## License

© 2024 Mechatronics. All rights reserved.
