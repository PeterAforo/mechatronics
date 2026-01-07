# Changelog

All notable changes to the Mechatronics IoT SaaS platform will be documented in this file.

## [1.1.0] - 2026-01-07

### UI/UX Enhancement Release

This release implements comprehensive UI/UX improvements following the "Clean Industrial Intelligence" design language.

#### Added

**Design System**
- Centralized design tokens in `globals.css` with CSS variables
- Light-first UI with soft off-white backgrounds (`oklch(0.985 0 0)`) and white cards
- Trust blue/indigo primary color palette
- Status colors (success, warning, danger, offline) - never used as brand colors
- Motion system with calm, confidence-building transitions (150-250ms ease-in-out)

**Dashboard Components**
- `SystemHealthBar` - Real-time system status indicator with device online count, open alerts, and last sync time
- `AIInsightsWidget` - First-class AI insights display with auto-rotation, dismissible cards, and deep links
- `AlertsPanel` - Subtle alert display with severity indicators and time-ago formatting
- `DeviceCard` - Enhanced device cards with status rings, live values, and category icons
- `TrendChart` - Recharts-based area/line charts with time range filters and trend indicators

**Utility Components**
- `Skeleton` - Loading placeholder components (CardSkeleton, StatCardSkeleton, ChartSkeleton, etc.)
- `EmptyState` - Friendly empty state with icon, description, and CTA

#### Changed

**Portal Dashboard (`/portal`)**
- Restructured layout following 12-column grid system
- Top strip: SystemHealthBar (7 cols) + AIInsightsWidget (5 cols)
- Main content: DeviceGrid (8 cols) + AlertsPanel (4 cols)
- Analytics row: TrendCharts (full width, 2-column grid)
- Stats cards with hover effects and tabular numerals
- Improved visual hierarchy and spacing

**Design Tokens**
- Updated color palette to use OKLCH color space for better perceptual uniformity
- Added chart colors as harmonious palette
- Added motion duration and easing variables

#### Design Guidelines

The UI follows these principles from `docs/designUI.prompt`:
- **Light-first**: Soft off-white backgrounds, white cards with subtle shadows
- **Desktop-first**: Responsive down to tablet/mobile
- **Dashboard**: Summary cards AND charts on same screen
- **Alerts**: Subtle visual styling, no loud red blocks
- **AI Insights**: Always visible as first-class widget
- **Motion**: Calm, confidence-building (no bounce effects)
- **Style**: "Clean Industrial Intelligence" - no cyberpunk/neon

---

## [1.0.0] - 2026-01-06

### Initial Release

- Multi-tenant IoT SaaS platform
- Next.js 16 with App Router
- Prisma 6 with PostgreSQL (Neon)
- NextAuth.js v5 dual authentication (tenant + admin)
- Product marketplace and ordering system
- Device management and telemetry
- Alert rules and notifications
- Reports and analytics
- Team management and API keys
- Paystack payment integration
- Admin panel with full CRUD operations
