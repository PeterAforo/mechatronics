// Dashboard Component Types and Props Schemas

// ============================================
// Layout Components
// ============================================

export type AppShellProps = {
  user: { name: string; email?: string; avatarUrl?: string };
  systemHealth: { status: "ok" | "warn" | "critical"; message: string; issuesCount?: number };
  children: React.ReactNode;
};

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badgeDot?: boolean;
  roles?: string[];
};

export type SidebarNavProps = {
  items: NavItem[];
  collapsed?: boolean;
  activePath: string;
  onToggleCollapse?: () => void;
};

export type TopBarProps = {
  searchPlaceholder?: string;
  onSearch?: (q: string) => void;
  notificationsCount?: number;
  onOpenNotifications?: () => void;
  user: { name: string; avatarUrl?: string };
};

// ============================================
// Dashboard Top Strip
// ============================================

export type SystemHealthStatus = "ok" | "warn" | "critical" | "offline";

export type SystemHealthBarProps = {
  status: SystemHealthStatus;
  message: string;
  issuesCount?: number;
  lastUpdated?: string;
};

export type AIInsightType = "anomaly" | "prediction" | "recommendation" | "behavior";
export type AIInsightSeverity = "info" | "warn" | "critical";

export type AIInsight = {
  id: string;
  type: AIInsightType;
  title: string;
  summary: string;
  severity?: AIInsightSeverity;
  deviceId?: string;
  actionLabel?: string;
  actionHref?: string;
  timestamp?: string;
};

export type AIInsightsWidgetProps = {
  insights: AIInsight[];
  maxVisible?: number;
  rotate?: boolean;
  onDismiss?: (id: string) => void;
};

// ============================================
// KPI Cards
// ============================================

export type KpiStatus = "ok" | "warn" | "critical" | "neutral";

export type KpiCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  status?: KpiStatus;
  sparkline?: number[];
  icon?: string;
  href?: string;
};

// ============================================
// Device Components
// ============================================

export type DeviceType = "water_level" | "power_meter" | "temperature" | "other";
export type DeviceStatus = "ok" | "warn" | "critical" | "offline";

export type Device = {
  id: string;
  name: string;
  type: DeviceType;
  location?: string;
  status: DeviceStatus;
  live: boolean;
  lastUpdated: string;
  value: number;
  unit: string;
  signalStrength?: number;
  battery?: number;
};

export type DeviceCardProps = {
  device: Device;
  onView?: (id: string) => void;
  onQuickAction?: (id: string, action: "set_threshold" | "mute" | "details") => void;
};

export type DeviceGridProps = {
  devices: Device[];
  filter?: { type?: string; status?: string; query?: string };
  sort?: "severity" | "lastUpdated" | "name";
};

// ============================================
// Chart Components
// ============================================

export type TrendRange = "today" | "7d" | "30d";
export type ChipTone = "neutral" | "good" | "warn" | "bad";

export type TrendDataPoint = {
  t: string;
  v: number;
};

export type AIMarker = {
  t: string;
  label: string;
  severity?: AIInsightSeverity;
};

export type SummaryChip = {
  label: string;
  value: string;
  tone?: ChipTone;
};

export type PrimaryTrendCardProps = {
  title: string;
  range: TrendRange;
  onRangeChange?: (r: TrendRange) => void;
  series: TrendDataPoint[];
  unit: string;
  thresholds?: { low?: number; critical?: number };
  summaryChips?: SummaryChip[];
  aiMarkers?: AIMarker[];
};

// ============================================
// Gauge / Health Card
// ============================================

export type HealthGaugeCardProps = {
  title: string;
  value: number;
  caption?: string;
  deltaText?: string;
  status?: DeviceStatus;
};

// ============================================
// Alerts Panel
// ============================================

export type AlertSeverity = "warn" | "critical" | "info";

export type AlertItem = {
  id: string;
  severity: AlertSeverity;
  title: string;
  description?: string;
  deviceId?: string;
  deviceName?: string;
  timestamp: string;
  read?: boolean;
};

export type AlertsPanelProps = {
  items: AlertItem[];
  onOpenAlert?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
};

// ============================================
// Events Feed
// ============================================

export type EventType = "reading" | "alert" | "system" | "ingestion";
export type EventSeverity = "neutral" | "warn" | "critical";
export type EventFilter = "all" | "alerts" | "readings" | "offline";

export type EventItem = {
  id: string;
  type: EventType;
  label: string;
  detail?: string;
  severity?: EventSeverity;
  timestamp: string;
  href?: string;
};

export type EventsFeedCardProps = {
  items: EventItem[];
  filter?: EventFilter;
  onFilterChange?: (f: EventFilter) => void;
};

// ============================================
// CTA Panel
// ============================================

export type CtaIllustration = "device" | "rules" | "upgrade";

export type CtaPanelCardProps = {
  title: string;
  description: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  illustration?: CtaIllustration;
};

// ============================================
// Connectivity Card
// ============================================

export type ConnectivityCardProps = {
  title: string;
  message: string;
  action: { label: string; href: string };
  status?: DeviceStatus;
};

// ============================================
// Sound Settings
// ============================================

export type SoundSettingsState = {
  enabled: boolean;
  volume: number;
  warningSound: string;
  criticalSound: string;
};
