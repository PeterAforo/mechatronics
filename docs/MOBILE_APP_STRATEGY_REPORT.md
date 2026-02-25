# Mechatronics IoT Platform — Mobile App Strategy Report

**Generated:** 2026-02-25T08:00:00Z  
**Project:** homebot-next  
**Analyst:** Cascade AI  

---

## 1. Executive Summary

### Project Overview
The Mechatronics IoT platform is a **multi-tenant SaaS application** for monitoring water levels, power consumption, and temperature across homes, businesses, and industries in Ghana. The web application is feature-complete with 53 pages, 50+ API endpoints, real-time telemetry via SSE, and a robust authentication system.

### Mobile App Recommendation

| Aspect | Recommendation |
|--------|----------------|
| **Primary Framework** | **React Native with Expo** |
| **Secondary Option** | Capacitor (wrap existing web app) |
| **Estimated Timeline** | 10-14 weeks for full implementation |
| **Estimated Effort** | Medium complexity (20-30 screens) |

### Why React Native?
1. **Tech Stack Alignment**: Web app uses React (Next.js), TypeScript, and similar patterns
2. **Code Sharing**: Can share types, validation schemas (Zod), utilities, and API client
3. **Team Efficiency**: Same language (TypeScript) reduces learning curve
4. **Expo Benefits**: OTA updates, easy push notifications, simplified builds
5. **IoT Features**: Excellent support for real-time data, charts, and notifications

---

## 2. Web App Analysis Summary

### Tech Stack Identified

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | TailwindCSS 4, shadcn/ui, Framer Motion |
| **Backend** | Next.js API Routes (50+ endpoints) |
| **Database** | PostgreSQL (Neon) via Prisma 6 ORM |
| **Auth** | NextAuth.js v5 with JWT (dual tenant/admin) |
| **Real-time** | Server-Sent Events (SSE) |
| **Charts** | Recharts |
| **Validation** | Zod |
| **Email** | Resend |
| **Monitoring** | Sentry |

### Feature Inventory

| Category | Features | Mobile Relevance |
|----------|----------|------------------|
| **Authentication** | Email/password login, registration, password reset, email verification | ✅ Critical |
| **Tenant Portal** | Dashboard, device monitoring, alerts, subscriptions, team management | ✅ Critical |
| **Admin Panel** | Full CRUD for all entities, reports, analytics | ⚠️ Secondary |
| **IoT Telemetry** | Real-time data ingestion, historical charts, device status | ✅ Critical |
| **Alerts** | Alert rules, notifications, severity levels | ✅ Critical |
| **Orders** | Product ordering, payment integration | ✅ Important |
| **OTA Updates** | Firmware management, device updates | ⚠️ Admin only |

### API Layer Assessment

| Metric | Status | Notes |
|--------|--------|-------|
| **API Type** | REST | Next.js API routes |
| **Authentication** | JWT | 30-day expiry, needs refresh token |
| **Versioning** | Partial | `/api/v1/` exists for some endpoints |
| **Pagination** | Limited | Most endpoints return all data |
| **Documentation** | None | No OpenAPI/Swagger spec |
| **CORS** | Default | Needs configuration for mobile |

---

## 3. Technology Recommendation

### Ranking of Mobile Approaches

| Rank | Approach | Score | Justification |
|------|----------|-------|---------------|
| **1** | **React Native (Expo)** | 92/100 | Best code sharing with React/TS web app, excellent IoT support |
| **2** | Capacitor | 78/100 | Fastest path, web app already mobile-responsive |
| **3** | Flutter | 70/100 | Great performance but requires Dart, less code sharing |
| **4** | Kotlin Multiplatform | 55/100 | Overkill for this project, team would need Kotlin |
| **5** | Native (Swift/Kotlin) | 45/100 | Two codebases, highest cost, no code sharing |

### Primary Recommendation: React Native with Expo

**Justification:**
1. **Language Match**: Web app uses TypeScript → mobile uses TypeScript
2. **Pattern Match**: React components, hooks, state management patterns transfer directly
3. **Shared Code**: Zod schemas, utility functions, types can be shared via monorepo
4. **Real-time Support**: Excellent WebSocket/SSE support for IoT telemetry
5. **Push Notifications**: Expo Notifications + FCM/APNs is production-ready
6. **Charts**: Victory Native or react-native-chart-kit for telemetry visualization
7. **OTA Updates**: Expo EAS Update allows instant bug fixes without app store review
8. **Build System**: Expo EAS Build handles iOS/Android builds without local setup

### Secondary Recommendation: Capacitor

**When to choose Capacitor instead:**
- Need app store presence within 2-3 weeks
- Budget is very limited
- Team cannot dedicate resources to native mobile development
- Web app performance is acceptable for mobile use case

---

## 4. Architecture Blueprint

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Screens   │  │   Hooks     │  │   Services  │             │
│  │  (React     │  │  (useAuth,  │  │  (API,      │             │
│  │   Native)   │  │  useDevice) │  │   Storage)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
│  ┌───────────────────────▼───────────────────────┐             │
│  │              State Management                  │             │
│  │         (Zustand + TanStack Query)            │             │
│  └───────────────────────┬───────────────────────┘             │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                    HTTPS / SSE
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     EXISTING BACKEND                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Next.js    │  │  NextAuth   │  │  Prisma     │             │
│  │  API Routes │  │  (JWT)      │  │  ORM        │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
│  ┌───────────────────────▼───────────────────────┐             │
│  │              PostgreSQL (Neon)                 │             │
│  └───────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile App Structure

```
apps/mobile/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Auth screens (login, register, forgot)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/              # Main tab navigation
│   │   ├── index.tsx        # Dashboard
│   │   ├── devices.tsx      # Device list
│   │   ├── alerts.tsx       # Alerts
│   │   └── settings.tsx     # Settings
│   ├── devices/[id].tsx     # Device detail
│   └── _layout.tsx          # Root layout
├── components/              # Reusable components
│   ├── ui/                  # Base UI components
│   ├── charts/              # Telemetry charts
│   └── cards/               # Device cards, stat cards
├── hooks/                   # Custom hooks
│   ├── useAuth.ts
│   ├── useDevices.ts
│   └── useRealtime.ts
├── services/                # API and external services
│   ├── api.ts               # API client with interceptors
│   ├── auth.ts              # Auth service
│   └── notifications.ts     # Push notification service
├── stores/                  # Zustand stores
│   ├── authStore.ts
│   └── deviceStore.ts
├── types/                   # TypeScript types (shared)
└── utils/                   # Utility functions (shared)
```

### Data Flow

```
User Action → Screen → Hook → TanStack Query → API Service → Backend
                                    ↓
                              Cache Layer
                                    ↓
                              UI Update
```

---

## 5. API Readiness Audit

### Existing Endpoints Assessment

| Endpoint | Method | Mobile Ready | Issue | Priority |
|----------|--------|--------------|-------|----------|
| `/api/auth/[...nextauth]` | POST | ⚠️ Needs work | Session-based, needs mobile JWT flow | CRITICAL |
| `/api/auth/register` | POST | ✅ Ready | - | - |
| `/api/auth/forgot-password` | POST | ✅ Ready | - | - |
| `/api/auth/reset-password` | POST | ✅ Ready | - | - |
| `/api/portal/devices` | GET | ⚠️ Needs work | No pagination | HIGH |
| `/api/portal/devices/[id]` | GET | ✅ Ready | - | - |
| `/api/portal/alerts` | GET | ⚠️ Needs work | No pagination | HIGH |
| `/api/portal/team` | GET/POST | ✅ Ready | - | - |
| `/api/portal/subscriptions` | GET | ✅ Ready | - | - |
| `/api/portal/profile` | GET/PUT | ✅ Ready | - | - |
| `/api/realtime` | SSE | ✅ Ready | Works with EventSource | - |
| `/api/ingest` | POST/GET | ✅ Ready | Device telemetry | - |
| `/api/health` | GET | ✅ Ready | Connectivity check | - |

### New Endpoints Required

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/auth/mobile/login` | POST | Mobile-specific JWT login with refresh token | CRITICAL |
| `/api/auth/mobile/refresh` | POST | Refresh access token | CRITICAL |
| `/api/auth/mobile/logout` | POST | Revoke refresh token, unregister device | CRITICAL |
| `/api/devices/register-push` | POST | Register FCM/APNs device token | CRITICAL |
| `/api/devices/unregister-push` | DELETE | Unregister push token on logout | HIGH |
| `/api/users/notification-preferences` | GET/PUT | Manage notification settings | MEDIUM |
| `/api/portal/devices?page=1&limit=20` | GET | Add pagination support | HIGH |
| `/api/portal/alerts?page=1&limit=20` | GET | Add pagination support | HIGH |

---

## 6. Authentication Strategy

### Current Web Auth Flow
- NextAuth.js with JWT strategy
- 30-day token expiry
- Session stored in HTTP-only cookies
- No refresh token mechanism

### Mobile Auth Flow Design

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE AUTH FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. LOGIN
   User enters email/password
         │
         ▼
   POST /api/auth/mobile/login
   { email, password, deviceId, platform }
         │
         ▼
   Response: {
     accessToken: "...",      // 15 min expiry
     refreshToken: "...",     // 30 day expiry
     user: { id, name, email, tenantId }
   }
         │
         ▼
   Store tokens in Secure Storage (Keychain/Keystore)

2. API REQUESTS
   Every request includes:
   Authorization: Bearer <accessToken>
         │
         ▼
   If 401 Unauthorized:
     POST /api/auth/mobile/refresh
     { refreshToken }
         │
         ▼
     Get new accessToken, retry original request

3. BIOMETRIC LOGIN (optional)
   After first login, prompt to enable Face ID/Touch ID
         │
         ▼
   On app open, if biometric enabled:
     Verify biometric → Retrieve stored refreshToken → Get new accessToken

4. LOGOUT
   POST /api/auth/mobile/logout
   { refreshToken, pushToken }
         │
         ▼
   Clear Secure Storage
   Unregister push notification token
```

### Token Storage

| Platform | Storage | Package |
|----------|---------|---------|
| iOS | Keychain | `expo-secure-store` |
| Android | Keystore | `expo-secure-store` |

### Social Login Considerations

**⚠️ CRITICAL: Apple Sign-In Requirement**

If you add Google Sign-In or any other social login, **Apple Sign-In is MANDATORY** for iOS App Store approval. Current web app only has email/password, so this is not immediately required.

---

## 7. Push Notification Architecture

### Notification Types

| Type | Trigger | Priority | Deep Link |
|------|---------|----------|-----------|
| **Alert** | Device threshold exceeded | High | `/alerts/{alertId}` |
| **Device Offline** | No data for 3+ hours | Medium | `/devices/{deviceId}` |
| **Device Online** | Device reconnected | Low | `/devices/{deviceId}` |
| **Subscription** | Renewal reminder, expiry | Medium | `/subscriptions` |
| **OTA Update** | Firmware update available | Low | `/devices/{deviceId}` |

### Push Notification Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  PUSH NOTIFICATION FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. APP STARTUP
   Request notification permission (not on first launch)
         │
         ▼
   Get FCM/APNs token from Expo Notifications
         │
         ▼
   POST /api/devices/register-push
   { userId, token, platform: "ios" | "android" }

2. BACKEND TRIGGER (e.g., Alert created)
   Alert rule triggered → Create Alert record
         │
         ▼
   Query device_tokens for user/tenant
         │
         ▼
   Send via Firebase Admin SDK (FCM for Android, APNs for iOS)

3. MOBILE RECEIVES
   Foreground: Show in-app toast/banner
   Background: Show system notification
         │
         ▼
   User taps notification
         │
         ▼
   Parse deep link → Navigate to relevant screen
```

### Notification Payload Schema

```typescript
interface PushNotificationPayload {
  title: string;
  body: string;
  data: {
    type: "alert" | "device_status" | "subscription" | "ota";
    resourceId: string;
    deepLink: string;
    severity?: "critical" | "warning" | "info";
  };
  badge?: number;
  sound?: "default" | "alert";
  image?: string; // Rich notification image
}
```

### Backend Changes for Push

```sql
-- New table: device_push_tokens
CREATE TABLE device_push_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES tenant_users(user_id),
  tenant_id BIGINT NOT NULL REFERENCES tenants(tenant_id),
  token VARCHAR(255) NOT NULL,
  platform VARCHAR(10) NOT NULL, -- 'ios' or 'android'
  device_id VARCHAR(255), -- Unique device identifier
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  UNIQUE(user_id, token)
);
```

---

## 8. Native Device Features Plan

### Required Features

| Feature | Use Case | Package | Permissions |
|---------|----------|---------|-------------|
| **Push Notifications** | Alerts, device status | `expo-notifications` | iOS: Push, Android: POST_NOTIFICATIONS |
| **Secure Storage** | Token storage | `expo-secure-store` | None |
| **Biometrics** | Quick login | `expo-local-authentication` | iOS: Face ID usage description |
| **Network State** | Offline detection | `@react-native-community/netinfo` | None |
| **Background Fetch** | Sync data | `expo-background-fetch` | iOS: Background modes |

### Optional Features

| Feature | Use Case | Package | Permissions |
|---------|----------|---------|-------------|
| **Camera** | QR code scanning for device setup | `expo-camera` | Camera |
| **Location** | Site-based device grouping | `expo-location` | Location when in use |
| **Share** | Share device reports | `expo-sharing` | None |
| **Haptics** | Feedback on actions | `expo-haptics` | None |

### iOS Info.plist Strings

```xml
<key>NSFaceIDUsageDescription</key>
<string>Enable Face ID for quick and secure login to your Mechatronics account.</string>

<key>NSCameraUsageDescription</key>
<string>Scan QR codes to quickly add devices to your account.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Your location helps organize devices by site and provide location-based alerts.</string>
```

---

## 9. Backend Changes Required

### Authentication Changes

```typescript
// NEW: /api/auth/mobile/login
// Returns access + refresh tokens instead of session cookie

// NEW: /api/auth/mobile/refresh
// Rotates refresh token, returns new access token

// NEW: /api/auth/mobile/logout
// Invalidates refresh token, unregisters push token
```

### Database Changes

```prisma
// Add to schema.prisma

model DevicePushToken {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt   @map("user_id")
  tenantId  BigInt   @map("tenant_id")
  token     String   @db.VarChar(255)
  platform  String   @db.VarChar(10) // ios, android
  deviceId  String?  @map("device_id") @db.VarChar(255)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime? @updatedAt @map("updated_at")
  
  user      TenantUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant    Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@unique([userId, token])
  @@map("device_push_tokens")
}

model RefreshToken {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt   @map("user_id")
  userType  String   @map("user_type") @db.VarChar(10) // tenant, admin
  token     String   @unique @db.VarChar(255)
  deviceId  String?  @map("device_id") @db.VarChar(255)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  revokedAt DateTime? @map("revoked_at")
  
  @@index([userId, userType])
  @@index([expiresAt])
  @@map("refresh_tokens")
}
```

### API Pagination

```typescript
// Update existing endpoints to support pagination
// GET /api/portal/devices?page=1&limit=20&sort=lastSeenAt&order=desc

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
```

---

## 10. Shared Code Strategy

### Monorepo Structure

```
mechatronics/
├── apps/
│   ├── web/                 # Existing Next.js app
│   └── mobile/              # New React Native app
├── packages/
│   ├── types/               # Shared TypeScript types
│   │   ├── api.ts           # API request/response types
│   │   ├── models.ts        # Domain models
│   │   └── index.ts
│   ├── validation/          # Shared Zod schemas
│   │   ├── auth.ts
│   │   ├── device.ts
│   │   └── index.ts
│   ├── utils/               # Shared utilities
│   │   ├── formatters.ts    # Date, currency formatters
│   │   ├── validators.ts
│   │   └── index.ts
│   └── api-client/          # Shared API client
│       ├── client.ts
│       ├── endpoints.ts
│       └── index.ts
├── package.json             # Workspace root
└── turbo.json               # Turborepo config
```

### Shareable Code from Web App

| Code | Location | Shareable |
|------|----------|-----------|
| Zod schemas | `src/app/api/*/route.ts` | ✅ Extract to `packages/validation` |
| TypeScript types | Various | ✅ Extract to `packages/types` |
| Date formatters | `src/lib/timezone.ts` | ✅ Copy to `packages/utils` |
| API endpoints | `src/app/api/*` | ⚠️ Document, don't share code |
| UI components | `src/components/*` | ❌ Different on mobile |

---

## 11. App Store Requirements

### Apple App Store

| Requirement | Status | Action |
|-------------|--------|--------|
| Developer Account | ❌ | Register at developer.apple.com ($99/year) |
| App ID | ❌ | Create in Apple Developer Portal |
| Privacy Policy | ✅ | Use existing web privacy policy URL |
| App Icon (1024x1024) | ❌ | Design required |
| Screenshots | ❌ | Create for 6.7", 6.5", 5.5" |
| App Description | ❌ | Write 4000 char description |
| Sign in with Apple | ❌ | Not required (no social login) |
| TestFlight | ❌ | Set up for beta testing |

### Google Play Store

| Requirement | Status | Action |
|-------------|--------|--------|
| Developer Account | ❌ | Register at play.google.com/console ($25 one-time) |
| Privacy Policy | ✅ | Use existing web privacy policy URL |
| Data Safety | ❌ | Complete questionnaire |
| App Icon (512x512) | ❌ | Design required |
| Feature Graphic (1024x500) | ❌ | Design required |
| Screenshots | ❌ | Create for phone, tablet |
| Content Rating | ❌ | Complete questionnaire |
| Target API Level | ❌ | Must be Android 13+ (API 33) |

---

## 12. Recommended Tech Stack

### React Native + Expo Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | React Native | 0.74+ |
| **Platform** | Expo SDK | 51+ |
| **Language** | TypeScript | 5.x |
| **Navigation** | Expo Router | 3.x |
| **State (Client)** | Zustand | 4.x |
| **State (Server)** | TanStack Query | 5.x |
| **API Client** | Axios | 1.x |
| **Forms** | React Hook Form + Zod | 7.x + 3.x |
| **Styling** | NativeWind (Tailwind) | 4.x |
| **UI Components** | Custom + Gluestack UI | - |
| **Charts** | Victory Native | 40.x |
| **Secure Storage** | expo-secure-store | - |
| **Push Notifications** | expo-notifications | - |
| **Biometrics** | expo-local-authentication | - |
| **Analytics** | Firebase Analytics | - |
| **Crash Reporting** | Sentry | 5.x |
| **OTA Updates** | EAS Update | - |
| **CI/CD** | EAS Build + GitHub Actions | - |

---

## 13. Implementation Roadmap

### Phase 0: Preparation (1-2 weeks)

| Task | Owner | Duration |
|------|-------|----------|
| Register Apple Developer Account | Business | 1 day |
| Register Google Play Developer Account | Business | 1 day |
| Set up Firebase project | Dev | 2 hours |
| Implement backend auth changes (refresh tokens) | Backend Dev | 3 days |
| Implement push notification backend | Backend Dev | 2 days |
| Add pagination to portal APIs | Backend Dev | 1 day |
| Set up monorepo structure | Dev | 1 day |
| Extract shared types/validation to packages | Dev | 1 day |
| Design app icon and splash screen | Designer | 3 days |

### Phase 1: Foundation & Auth (2-3 weeks)

| Task | Duration |
|------|----------|
| Initialize Expo project with TypeScript | 2 hours |
| Set up Expo Router navigation structure | 1 day |
| Implement design system (colors, typography, spacing) | 2 days |
| Set up API client with token refresh interceptors | 1 day |
| Implement secure token storage | 4 hours |
| Build Login screen | 1 day |
| Build Registration screen | 1 day |
| Build Forgot Password screen | 4 hours |
| Implement biometric authentication | 1 day |
| Build auth state management (Zustand) | 4 hours |
| Test auth flow end-to-end | 1 day |

### Phase 2: Core Features (4-6 weeks)

| Task | Duration |
|------|----------|
| Build Dashboard screen with stats cards | 2 days |
| Build Device List screen with pull-to-refresh | 2 days |
| Build Device Detail screen with telemetry charts | 3 days |
| Implement real-time telemetry updates (SSE) | 2 days |
| Build Alerts List screen | 1 day |
| Build Alert Detail screen | 1 day |
| Implement push notification registration | 1 day |
| Implement notification tap handling (deep links) | 1 day |
| Build Subscriptions screen | 1 day |
| Build Team Management screen | 2 days |
| Build Settings screen | 1 day |
| Build Profile screen | 1 day |
| Implement offline caching for devices/alerts | 2 days |

### Phase 3: Polish & UX (2-3 weeks)

| Task | Duration |
|------|----------|
| Add skeleton loaders to all screens | 2 days |
| Add empty states | 1 day |
| Add error states and retry mechanisms | 1 day |
| Implement haptic feedback | 4 hours |
| Add screen transitions and animations | 2 days |
| Implement dark mode | 2 days |
| Build onboarding flow for new users | 2 days |
| Add app rating prompt | 4 hours |
| Implement connectivity detection banner | 4 hours |
| Performance optimization | 2 days |
| Accessibility audit and fixes | 2 days |

### Phase 4: Testing (1-2 weeks)

| Task | Duration |
|------|----------|
| Write unit tests for utilities and hooks | 2 days |
| Write component tests | 2 days |
| Write E2E tests with Detox | 3 days |
| Manual testing on iOS devices | 2 days |
| Manual testing on Android devices | 2 days |
| Beta testing via TestFlight/Play Internal | 1 week |

### Phase 5: Launch (1-2 weeks)

| Task | Duration |
|------|----------|
| Generate production builds | 1 day |
| Complete App Store Connect metadata | 1 day |
| Complete Google Play Console metadata | 1 day |
| Submit to App Store Review | 1-3 days review |
| Submit to Google Play Review | 1-7 days review |
| Monitor crash reports post-launch | Ongoing |
| Plan first update based on feedback | Ongoing |

---

## 14. Cost & Effort Estimate

### Project Classification: **MEDIUM**
- 20-30 screens
- Real-time features
- Push notifications
- Offline support
- No payments in-app (handled via web)

### Time Estimate

| Team Size | Duration |
|-----------|----------|
| Solo Developer | 14-18 weeks |
| 2 Developers | 10-14 weeks |

### Recurring Costs

| Service | Cost |
|---------|------|
| Apple Developer Program | $99/year |
| Google Play Developer | $25 one-time |
| Firebase (Spark plan) | Free |
| Expo EAS Build | Free tier (30 builds/month) |
| Sentry | Free tier (5K errors/month) |
| **Total Year 1** | ~$125 |

### High-Effort Features (if added later)

| Feature | Additional Effort |
|---------|-------------------|
| In-app payments | +2-3 weeks |
| Offline-first with sync | +2-3 weeks |
| QR code device setup | +1 week |
| Admin panel in mobile | +4-6 weeks |

---

## 15. Immediate Next Steps

### This Week (Top 10 Actions)

1. **Register Apple Developer Account** — Start the enrollment process (can take 24-48 hours)

2. **Register Google Play Developer Account** — One-time $25 fee, instant access

3. **Set up Firebase Project** — Create project, enable Cloud Messaging, download config files

4. **Implement Mobile Auth Endpoints** — Create `/api/auth/mobile/login`, `/refresh`, `/logout`

5. **Add Prisma Models** — Add `DevicePushToken` and `RefreshToken` models, run migration

6. **Add Pagination to APIs** — Update `/api/portal/devices` and `/api/portal/alerts`

7. **Initialize Expo Project** — `npx create-expo-app@latest mechatronics-mobile -t expo-template-blank-typescript`

8. **Set up Monorepo** — Move web app to `apps/web`, mobile to `apps/mobile`, create `packages/`

9. **Extract Shared Types** — Create `packages/types` with API types from web app

10. **Design App Icon** — Create 1024x1024 PNG for App Store, 512x512 for Play Store

---

## Appendix A: Screen List

### Tenant Mobile App Screens (MVP)

| # | Screen | Priority |
|---|--------|----------|
| 1 | Login | P0 |
| 2 | Register | P0 |
| 3 | Forgot Password | P0 |
| 4 | Dashboard | P0 |
| 5 | Device List | P0 |
| 6 | Device Detail | P0 |
| 7 | Device Telemetry Chart | P0 |
| 8 | Alerts List | P0 |
| 9 | Alert Detail | P1 |
| 10 | Subscriptions | P1 |
| 11 | Team Members | P1 |
| 12 | Invite Team Member | P2 |
| 13 | Profile | P1 |
| 14 | Settings | P1 |
| 15 | Notification Preferences | P2 |
| 16 | Alert Rules | P2 |
| 17 | Sites | P2 |
| 18 | Onboarding | P1 |

### Admin Mobile App (Future)

Not recommended for MVP. Admin functions are complex and better suited for desktop/tablet web interface.

---

## Appendix B: API Endpoint Reference

### Auth Endpoints (New)

```
POST /api/auth/mobile/login
POST /api/auth/mobile/refresh
POST /api/auth/mobile/logout
```

### Portal Endpoints (Existing)

```
GET  /api/portal/devices
GET  /api/portal/devices/:id
GET  /api/portal/alerts
GET  /api/portal/subscriptions
GET  /api/portal/team
POST /api/portal/team
GET  /api/portal/profile
PUT  /api/portal/profile
GET  /api/portal/sites
```

### Push Notification Endpoints (New)

```
POST   /api/devices/register-push
DELETE /api/devices/unregister-push
GET    /api/users/notification-preferences
PUT    /api/users/notification-preferences
```

### Real-time

```
GET /api/realtime?tenantId=xxx (SSE)
```

---

**End of Mobile App Strategy Report**

*Generated by Cascade AI for Mechatronics IoT Platform*
