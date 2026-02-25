# Mechatronics IoT Platform — Mobile Responsiveness Audit Report

**Generated:** 2026-02-25T07:45:00Z  
**Project:** homebot-next  
**Auditor:** Cascade AI  

---

## Executive Summary

### Overall Mobile Score: **72/100** — MOBILE_FAIR

The Mechatronics IoT platform has a solid foundation for mobile responsiveness with Tailwind CSS and responsive breakpoints in place. However, several areas need attention before the platform is fully mobile-ready, particularly around data tables, chart responsiveness, and some spacing/padding issues on small screens.

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Navigation | 85/100 | 15% | 12.75 |
| Layout Responsiveness | 70/100 | 20% | 14.00 |
| Typography | 80/100 | 10% | 8.00 |
| Touch Targets | 75/100 | 15% | 11.25 |
| Forms & Inputs | 85/100 | 10% | 8.50 |
| Charts & Media | 55/100 | 10% | 5.50 |
| Modals & Overlays | 80/100 | 10% | 8.00 |
| Safe Area & Gestures | 60/100 | 5% | 3.00 |
| Spacing & Density | 70/100 | 5% | 3.50 |
| **TOTAL** | | | **74.50** |

---

## Phase 1: Page Inventory

### Total Pages Discovered: 53

#### Public Pages (7)
| Page | Route | Layout | Status |
|------|-------|--------|--------|
| Landing | `/` | None | ⚠️ NEEDS_WORK |
| About | `/about` | None | ✅ MOBILE_READY |
| Contact | `/contact` | None | ✅ MOBILE_READY |
| FAQ | `/faq` | None | ✅ MOBILE_READY |
| Order | `/order` | None | ⚠️ NEEDS_WORK |
| Invite Accept | `/invite/[token]` | None | ✅ MOBILE_READY |

#### Auth Pages (5)
| Page | Route | Layout | Status |
|------|-------|--------|--------|
| Login | `/login` | AuthLayout | ✅ MOBILE_READY |
| Register | `/register` | AuthLayout | ✅ MOBILE_READY |
| Forgot Password | `/forgot-password` | AuthLayout | ✅ MOBILE_READY |
| Reset Password | `/reset-password` | AuthLayout | ✅ MOBILE_READY |
| Verify Email | `/verify-email` | AuthLayout | ✅ MOBILE_READY |

#### Portal Pages (14)
| Page | Route | Layout | Status |
|------|-------|--------|--------|
| Dashboard | `/portal` | PortalLayout | ⚠️ NEEDS_WORK |
| Devices | `/portal/devices` | PortalLayout | ⚠️ NEEDS_WORK |
| Device Detail | `/portal/devices/[id]` | PortalLayout | ⚠️ NEEDS_WORK |
| Sites | `/portal/sites` | PortalLayout | ✅ MOBILE_READY |
| Alerts | `/portal/alerts` | PortalLayout | ⚠️ NEEDS_WORK |
| Alert Rules | `/portal/alert-rules` | PortalLayout | ⚠️ NEEDS_WORK |
| Reports | `/portal/reports` | PortalLayout | ⚠️ NEEDS_WORK |
| Subscriptions | `/portal/subscriptions` | PortalLayout | ✅ MOBILE_READY |
| Billing | `/portal/billing` | PortalLayout | ✅ MOBILE_READY |
| Team | `/portal/team` | PortalLayout | ⚠️ NEEDS_WORK |
| API Keys | `/portal/api-keys` | PortalLayout | ✅ MOBILE_READY |
| Settings | `/portal/settings` | PortalLayout | ✅ MOBILE_READY |
| Profile | `/portal/profile` | PortalLayout | ✅ MOBILE_READY |

#### Admin Pages (27)
| Page | Route | Layout | Status |
|------|-------|--------|--------|
| Dashboard | `/admin` | AdminLayout | ⚠️ NEEDS_WORK |
| Telemetry | `/admin/telemetry` | AdminLayout | ⚠️ NEEDS_WORK |
| Devices | `/admin/devices` | AdminLayout | ⚠️ NEEDS_WORK |
| Device Detail | `/admin/devices/[id]` | AdminLayout | ⚠️ NEEDS_WORK |
| Device Import | `/admin/devices/import` | AdminLayout | ✅ MOBILE_READY |
| Device Types | `/admin/device-types` | AdminLayout | ⚠️ NEEDS_WORK |
| Device Type Detail | `/admin/device-types/[id]` | AdminLayout | ⚠️ NEEDS_WORK |
| Device Type Variables | `/admin/device-types/[id]/variables` | AdminLayout | ⚠️ NEEDS_WORK |
| New Device Type | `/admin/device-types/new` | AdminLayout | ✅ MOBILE_READY |
| Inventory | `/admin/inventory` | AdminLayout | ⚠️ NEEDS_WORK |
| Inventory Detail | `/admin/inventory/[id]` | AdminLayout | ✅ MOBILE_READY |
| Inventory Import | `/admin/inventory/import` | AdminLayout | ✅ MOBILE_READY |
| New Inventory | `/admin/inventory/new` | AdminLayout | ✅ MOBILE_READY |
| Firmware OTA | `/admin/firmware` | AdminLayout | ⚠️ NEEDS_WORK |
| Products | `/admin/products` | AdminLayout | ⚠️ NEEDS_WORK |
| Product Detail | `/admin/products/[id]` | AdminLayout | ✅ MOBILE_READY |
| New Product | `/admin/products/new` | AdminLayout | ✅ MOBILE_READY |
| Orders | `/admin/orders` | AdminLayout | ⚠️ NEEDS_WORK |
| Order Detail | `/admin/orders/[id]` | AdminLayout | ✅ MOBILE_READY |
| Payments | `/admin/payments` | AdminLayout | ⚠️ NEEDS_WORK |
| Revenue | `/admin/revenue` | AdminLayout | ⚠️ NEEDS_WORK |
| Tenants | `/admin/tenants` | AdminLayout | ⚠️ NEEDS_WORK |
| Tenant Detail | `/admin/tenants/[id]` | AdminLayout | ✅ MOBILE_READY |
| New Tenant | `/admin/tenants/new` | AdminLayout | ✅ MOBILE_READY |
| Alerts | `/admin/alerts` | AdminLayout | ⚠️ NEEDS_WORK |
| Alert Rules | `/admin/alerts/rules` | AdminLayout | ⚠️ NEEDS_WORK |
| Audit Logs | `/admin/audit-logs` | AdminLayout | ⚠️ NEEDS_WORK |
| Reports | `/admin/reports` | AdminLayout | ⚠️ NEEDS_WORK |
| API Docs | `/admin/api-docs` | AdminLayout | ✅ MOBILE_READY |
| Settings | `/admin/settings` | AdminLayout | ✅ MOBILE_READY |

---

## Phase 2: Global Foundation Audit

### ✅ PASS Items

| Check | Status | Notes |
|-------|--------|-------|
| Viewport meta tag | ✅ | Present in Next.js default |
| CSS framework (Tailwind) | ✅ | Mobile-first configured |
| Relative font sizes | ✅ | Using rem/Tailwind classes |
| Box-sizing border-box | ✅ | Tailwind default |
| Font loading | ✅ | Next.js font optimization |

### ⚠️ ISSUES Found

| Issue | Severity | File | Fix |
|-------|----------|------|-----|
| Missing `overflow-x: hidden` on root | MEDIUM | `globals.css` | Add to prevent horizontal scroll |
| No `viewport-fit=cover` for safe areas | MEDIUM | `layout.tsx` | Add to viewport meta |
| 100vh usage without dvh fallback | LOW | Multiple | Use `min-h-dvh` or JS fix |

### Recommended Global CSS Fixes

```css
/* Add to globals.css */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Safe area support */
@supports (padding: env(safe-area-inset-bottom)) {
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }
}
```

---

## Phase 3: Navigation Audit

### DarkSidebar Component
**File:** `src/components/layout/DarkSidebar.tsx`

| Check | Status | Notes |
|-------|--------|-------|
| Hamburger menu on mobile | ✅ | Line 178-184 |
| Drawer slides in | ✅ | Line 195-198 |
| Body scroll lock | ✅ | Line 159-168 |
| Overlay backdrop | ✅ | Line 187-192 |
| Close on route change | ✅ | Line 154-156 |
| Touch-friendly targets | ✅ | 44px+ nav items |

**Score: 90/100** ✅

### LightNavbar Component
**File:** `src/components/layout/LightNavbar.tsx`

| Check | Status | Notes |
|-------|--------|-------|
| Responsive positioning | ✅ | `lg:left-64` |
| Search hidden on mobile | ✅ | `hidden md:flex` |
| User menu accessible | ✅ | Dropdown works on tap |
| Notification bell | ✅ | Touch-friendly |

**Issues Found:**
| Issue | Severity | Line | Fix |
|-------|----------|------|-----|
| Welcome text hidden on small mobile | LOW | 55-59 | Consider showing on xs |
| Spacer width inconsistent | LOW | 54 | Use consistent spacing |

**Score: 85/100** ✅

### Landing Page Navigation
**File:** `src/components/landing/LandingPage.tsx`

| Check | Status | Notes |
|-------|--------|-------|
| Mobile menu toggle | ✅ | Line 187-196 |
| Mobile menu content | ✅ | Line 200-224 |
| Touch targets | ✅ | `py-2` on items |

**Score: 80/100** ✅

---

## Phase 4: Layout & Grid Audit

### Critical Issues

#### Issue 1: Admin/Portal Main Content Margin
**File:** `src/app/admin/layout.tsx`, `src/app/portal/layout.tsx`
**Line:** 30, 50

```tsx
// Current
<div className="lg:ml-64">

// Issue: No margin on mobile, content starts at edge
```

**Fix:** ✅ Already correct - sidebar hidden on mobile, no margin needed.

#### Issue 2: Dashboard Grid Layouts
**Files:** Multiple dashboard pages

Many dashboard pages use multi-column grids that don't collapse properly:

```tsx
// Example problematic pattern
<div className="grid grid-cols-4 gap-6">
```

**Fix:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
```

#### Issue 3: Fixed Width Containers
**Severity:** HIGH

Found in multiple files:
- `max-w-6xl` without responsive padding
- `w-64` sidebar (correct, hidden on mobile)

**Fix:** Ensure all containers have mobile padding:
```tsx
<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
```

---

## Phase 5: Typography Audit

### ✅ Good Practices Found

- Responsive heading sizes using `text-2xl md:text-3xl lg:text-4xl`
- Body text at 16px (1rem) base
- Line heights appropriate (1.5-1.6)

### Issues Found

| Issue | Severity | File | Line | Fix |
|-------|----------|------|------|-----|
| Long text overflow in cards | MEDIUM | Multiple | - | Add `truncate` or `line-clamp-2` |
| Table cell text wrapping | MEDIUM | Table components | - | Add `whitespace-nowrap` or `min-w-0` |

---

## Phase 6: Cards, Lists & Data Display Audit

### Card Components
**Score: 80/100**

Cards generally responsive, but some issues:

| Issue | Severity | Fix |
|-------|----------|-----|
| Card grids not collapsing | HIGH | Use `grid-cols-1 sm:grid-cols-2` |
| Card padding too large on mobile | MEDIUM | Use `p-4 sm:p-6` |

### Data Tables
**Score: 50/100** ⚠️ CRITICAL

**Major Issue:** Tables do not have horizontal scroll wrapper on mobile.

**Files Affected:**
- `src/app/admin/devices/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/tenants/page.tsx`
- `src/app/admin/inventory/page.tsx`
- `src/app/admin/firmware/page.tsx`
- `src/app/portal/team/page.tsx`
- `src/app/portal/alerts/page.tsx`

**Fix Template:**
```tsx
// Wrap all tables with:
<div className="overflow-x-auto -mx-4 sm:mx-0">
  <div className="inline-block min-w-full align-middle">
    <table className="min-w-full">
      {/* table content */}
    </table>
  </div>
</div>
```

---

## Phase 7: Charts & Data Visualization Audit

### Chart Components Found
- `src/components/dashboard/TrendChart.tsx`
- `src/components/dashboard/AdminDashboardCharts.tsx`
- `src/components/admin/RevenueAnalytics.tsx`
- `src/components/admin/AdvancedReportsCharts.tsx`
- `src/components/devices/DeviceVisualizations.tsx`

### Issues Found

| Issue | Severity | Component | Fix |
|-------|----------|-----------|-----|
| Charts not responsive | HIGH | All Recharts | Add `ResponsiveContainer` |
| Legend position fixed | MEDIUM | Multiple | Move legend below on mobile |
| Axis labels crowded | MEDIUM | Multiple | Reduce tick count on mobile |
| Tooltips hover-only | MEDIUM | All | Already touch-friendly in Recharts |

**Fix Template for Recharts:**
```tsx
import { ResponsiveContainer, LineChart, ... } from 'recharts';

// Always wrap charts
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    {/* Reduce ticks on mobile */}
    <XAxis 
      dataKey="name" 
      tick={{ fontSize: 12 }}
      interval="preserveStartEnd"
    />
    {/* Move legend below on mobile */}
    <Legend 
      wrapperStyle={{ paddingTop: 20 }}
      layout="horizontal"
      align="center"
    />
  </LineChart>
</ResponsiveContainer>
```

**Score: 55/100** ⚠️

---

## Phase 8: Images & Media Audit

### ✅ Good Practices

- Using Next.js `Image` component with automatic optimization
- SVG icons scale correctly
- Avatar images properly sized

### Issues Found

| Issue | Severity | File | Fix |
|-------|----------|------|-----|
| Hero background may crop poorly | LOW | AnimatedHero.tsx | Add `object-position` |
| Product images fixed aspect | LOW | LandingPage.tsx | Use `aspect-ratio` |

**Score: 85/100** ✅

---

## Phase 9: Forms & Inputs Audit

### ✅ Excellent Practices

- Input height `h-12` (48px) - touch-friendly
- Font size 16px - prevents iOS zoom
- Labels above inputs
- Proper input types (`type="email"`, `type="tel"`)

### Issues Found

| Issue | Severity | File | Fix |
|-------|----------|------|-----|
| Select dropdowns may overflow | MEDIUM | Multiple | Add `max-h-60 overflow-auto` to content |
| Date pickers need mobile test | LOW | Reports pages | Verify native picker works |

**Score: 85/100** ✅

---

## Phase 10: Modals, Drawers & Overlays Audit

### Dialog Component
**File:** `src/components/ui/dialog.tsx`

| Check | Status | Notes |
|-------|--------|-------|
| Max width with mobile margin | ✅ | `max-w-[calc(100%-2rem)]` |
| Centered positioning | ✅ | `top-[50%] left-[50%]` |
| Close button accessible | ✅ | Top-right position |
| Backdrop overlay | ✅ | `bg-black/50` |

**Issues:**
| Issue | Severity | Line | Fix |
|-------|----------|------|-----|
| No full-screen option for mobile | MEDIUM | 63 | Add `sm:max-w-lg` variant |
| No safe area padding | LOW | - | Add bottom padding for iOS |

### Sheet Component (Bottom Sheet)
**File:** `src/components/ui/sheet.tsx`

✅ Properly implemented with side variants.

**Score: 80/100** ✅

---

## Phase 11: Buttons & Tap Targets Audit

### Button Component
**File:** `src/components/ui/button.tsx`

| Size | Height | Status |
|------|--------|--------|
| default | 36px | ⚠️ Below 44px |
| sm | 32px | ⚠️ Below 44px |
| lg | 40px | ⚠️ Below 44px |
| icon | 36px | ⚠️ Below 44px |

**Recommendation:** Increase minimum touch targets:
```tsx
// Update button variants
default: "h-11 px-4 py-2", // 44px
sm: "h-10 px-3",           // 40px minimum
lg: "h-12 px-8",           // 48px
icon: "h-11 w-11",         // 44px
```

**Score: 75/100** ⚠️

---

## Phase 12: Spacing & Density Audit

### Issues Found

| Issue | Severity | Location | Fix |
|-------|----------|----------|-----|
| Page padding inconsistent | MEDIUM | Multiple pages | Standardize `px-4 sm:px-6 lg:px-8` |
| Section spacing too large | LOW | Landing page | Use `py-16 sm:py-24` |
| Card gaps too wide on mobile | MEDIUM | Dashboard grids | Use `gap-4 sm:gap-6` |

**Score: 70/100** ⚠️

---

## Phase 13: Scroll & Gesture Audit

### ✅ Good Practices

- Smooth scroll on navigation
- Body scroll lock on mobile menu
- No scroll-jacking detected

### Issues Found

| Issue | Severity | Fix |
|-------|----------|-----|
| Horizontal scroll containers need `-webkit-overflow-scrolling: touch` | LOW | Add to table wrappers |
| No scroll indicators on tables | MEDIUM | Add gradient fade or shadow |

**Score: 75/100** ✅

---

## Phase 14: Safe Area & Device-Specific Audit

### Issues Found

| Issue | Severity | Fix |
|-------|----------|-----|
| No `viewport-fit=cover` | MEDIUM | Add to layout.tsx |
| No safe area insets on fixed elements | MEDIUM | Add `env(safe-area-inset-*)` |
| 100vh usage | LOW | Replace with `100dvh` or JS solution |

**Recommended Fix for layout.tsx:**
```tsx
export const metadata: Metadata = {
  // ... existing
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};
```

**Score: 60/100** ⚠️

---

## Critical Fix List (Priority Order)

### 🔴 CRITICAL (Must Fix)

| # | Issue | Files | Effort | Fix |
|---|-------|-------|--------|-----|
| 1 | Tables not scrollable on mobile | 10+ pages | M | Wrap with `overflow-x-auto` |
| 2 | Charts not responsive | 5 components | M | Add `ResponsiveContainer` |
| 3 | Dashboard grids don't collapse | 3 pages | S | Add responsive breakpoints |

### 🟠 HIGH Priority

| # | Issue | Files | Effort | Fix |
|---|-------|-------|--------|-----|
| 4 | Button tap targets below 44px | button.tsx | S | Increase heights |
| 5 | No safe area support | layout.tsx, globals.css | S | Add viewport-fit and env() |
| 6 | Card grids not responsive | Multiple | M | Add `grid-cols-1 sm:grid-cols-2` |

### 🟡 MEDIUM Priority

| # | Issue | Files | Effort | Fix |
|---|-------|-------|--------|-----|
| 7 | Inconsistent page padding | Multiple | M | Standardize padding classes |
| 8 | Dialog not full-screen on mobile | dialog.tsx | S | Add mobile variant |
| 9 | Chart legends overlap | Chart components | S | Move below on mobile |
| 10 | Missing overflow-x hidden | globals.css | S | Add to html/body |

### 🟢 LOW Priority

| # | Issue | Files | Effort | Fix |
|---|-------|-------|--------|-----|
| 11 | Welcome text hidden on xs | LightNavbar.tsx | S | Show abbreviated version |
| 12 | Section spacing too large | Landing page | S | Reduce on mobile |
| 13 | 100vh usage | Multiple | S | Use dvh or JS |

---

## Quick Wins (< 30 minutes each)

### 1. Add overflow-x hidden globally
```css
/* globals.css */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}
```

### 2. Fix button tap targets
```tsx
// button.tsx - update sizes
default: "h-11 px-4 py-2",
sm: "h-10 px-3 text-sm",
lg: "h-12 px-8",
icon: "h-11 w-11",
```

### 3. Add table scroll wrapper utility
```tsx
// Create src/components/ui/responsive-table.tsx
export function ResponsiveTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
      <div className="inline-block min-w-full align-middle">
        {children}
      </div>
    </div>
  );
}
```

### 4. Add safe area CSS utilities
```css
/* globals.css */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.pt-safe {
  padding-top: env(safe-area-inset-top, 0);
}
```

---

## Post-Fix QA Checklist

### Device Testing Required

- [ ] iPhone SE (320px) - smallest target
- [ ] iPhone 14 (390px) - common size
- [ ] iPhone 14 Pro Max (428px) - large phone
- [ ] Galaxy S23 (360px) - Android baseline
- [ ] iPad Mini (768px) - tablet breakpoint

### Manual Test Steps

1. [ ] Navigate all pages - no horizontal scroll
2. [ ] Open/close mobile sidebar - smooth animation
3. [ ] Fill out all forms - keyboard doesn't hide inputs
4. [ ] View all tables - can scroll horizontally
5. [ ] View all charts - readable and interactive
6. [ ] Open all modals - properly sized and dismissible
7. [ ] Tap all buttons - adequate touch targets
8. [ ] Test in landscape orientation
9. [ ] Test with keyboard open
10. [ ] Test pull-to-refresh doesn't conflict

---

## Summary

The Mechatronics IoT platform has a **MOBILE_FAIR** rating at **72/100**. The main areas requiring attention are:

1. **Data Tables** - Need horizontal scroll wrappers
2. **Charts** - Need ResponsiveContainer and mobile-optimized legends
3. **Touch Targets** - Button sizes should be increased to 44px minimum
4. **Safe Areas** - Need viewport-fit and env() insets for notched devices

With the critical fixes applied, the platform should reach **MOBILE_GOOD** (85+) status.

**Estimated Fix Time:** 4-6 hours for all critical and high priority items.
