// AI-Powered Anomaly Detection for IoT Telemetry Data

export interface TelemetryPoint {
  value: number;
  timestamp: Date;
  variableCode: string;
  deviceId: string;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number; // 0-100, higher = more anomalous
  type: "spike" | "drop" | "trend" | "pattern" | "normal";
  message: string;
  recommendation?: string;
}

export interface DeviceHealthScore {
  deviceId: string;
  score: number; // 0-100
  status: "healthy" | "warning" | "critical";
  issues: string[];
  recommendations: string[];
}

// Simple statistical anomaly detection using Z-score
export function detectAnomaly(
  currentValue: number,
  historicalValues: number[],
  threshold: number = 2.5
): AnomalyResult {
  if (historicalValues.length < 5) {
    return {
      isAnomaly: false,
      score: 0,
      type: "normal",
      message: "Insufficient data for anomaly detection",
    };
  }

  const mean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
  const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalValues.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return {
      isAnomaly: currentValue !== mean,
      score: currentValue !== mean ? 100 : 0,
      type: currentValue !== mean ? "spike" : "normal",
      message: currentValue !== mean ? "Value deviates from constant baseline" : "Normal",
    };
  }

  const zScore = Math.abs((currentValue - mean) / stdDev);
  const anomalyScore = Math.min(100, Math.round((zScore / threshold) * 50));

  if (zScore > threshold) {
    const type = currentValue > mean ? "spike" : "drop";
    return {
      isAnomaly: true,
      score: anomalyScore,
      type,
      message: `Unusual ${type} detected: ${currentValue.toFixed(2)} (expected ~${mean.toFixed(2)})`,
      recommendation: type === "spike" 
        ? "Check for sensor malfunction or environmental changes"
        : "Verify device connectivity and sensor calibration",
    };
  }

  // Check for trend anomaly
  if (historicalValues.length >= 10) {
    const recentValues = historicalValues.slice(-5);
    const olderValues = historicalValues.slice(-10, -5);
    const recentMean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const olderMean = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;
    const trendChange = Math.abs(recentMean - olderMean) / olderMean;

    if (trendChange > 0.2) {
      return {
        isAnomaly: true,
        score: Math.round(trendChange * 100),
        type: "trend",
        message: `Significant trend change detected: ${(trendChange * 100).toFixed(1)}% shift`,
        recommendation: "Monitor closely for continued trend changes",
      };
    }
  }

  return {
    isAnomaly: false,
    score: anomalyScore,
    type: "normal",
    message: "Value within normal range",
  };
}

// Calculate device health score based on multiple factors
export function calculateDeviceHealth(params: {
  lastSeenAt: Date | null;
  status: string;
  recentAlerts: number;
  telemetryGaps: number;
  anomalyCount: number;
}): DeviceHealthScore {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check last seen
  if (!params.lastSeenAt) {
    score -= 40;
    issues.push("Device has never reported data");
    recommendations.push("Verify device installation and connectivity");
  } else {
    const hoursSinceLastSeen = (Date.now() - params.lastSeenAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSeen > 168) { // 1 week
      score -= 35;
      issues.push("Device offline for over a week");
      recommendations.push("Check device power and network connection");
    } else if (hoursSinceLastSeen > 72) { // 3 days
      score -= 25;
      issues.push("Device offline for over 3 days");
      recommendations.push("Verify device status on-site");
    } else if (hoursSinceLastSeen > 24) {
      score -= 15;
      issues.push("Device offline for over 24 hours");
      recommendations.push("Monitor for connectivity issues");
    }
  }

  // Check status
  if (params.status === "inactive") {
    score -= 20;
    issues.push("Device marked as inactive");
  } else if (params.status === "suspended") {
    score -= 30;
    issues.push("Device subscription suspended");
    recommendations.push("Check subscription payment status");
  }

  // Check recent alerts
  if (params.recentAlerts > 10) {
    score -= 20;
    issues.push(`High alert frequency: ${params.recentAlerts} alerts`);
    recommendations.push("Review alert thresholds and device calibration");
  } else if (params.recentAlerts > 5) {
    score -= 10;
    issues.push(`Elevated alerts: ${params.recentAlerts} alerts`);
  }

  // Check telemetry gaps
  if (params.telemetryGaps > 5) {
    score -= 15;
    issues.push("Frequent data transmission gaps");
    recommendations.push("Check network stability and signal strength");
  }

  // Check anomalies
  if (params.anomalyCount > 3) {
    score -= 10;
    issues.push(`Multiple anomalies detected: ${params.anomalyCount}`);
    recommendations.push("Investigate sensor readings for accuracy");
  }

  score = Math.max(0, score);

  let status: "healthy" | "warning" | "critical";
  if (score >= 80) {
    status = "healthy";
  } else if (score >= 50) {
    status = "warning";
  } else {
    status = "critical";
  }

  return {
    deviceId: "",
    score,
    status,
    issues,
    recommendations,
  };
}

// Generate smart recommendations based on platform data
export function generateSmartRecommendations(data: {
  totalRevenue: number;
  mrr: number;
  churnRate: number;
  activeDevices: number;
  inactiveDevices: number;
  pendingOrders: number;
  inventoryCount: number;
  alertCount: number;
}): Array<{
  id: string;
  type: "revenue" | "growth" | "retention" | "operational";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  action: string;
}> {
  const recommendations = [];

  // Revenue recommendations
  if (data.pendingOrders > 0) {
    recommendations.push({
      id: "pending-orders",
      type: "revenue" as const,
      priority: "high" as const,
      title: "Process Pending Orders",
      description: `You have ${data.pendingOrders} pending orders awaiting processing.`,
      impact: "Immediate revenue recognition",
      action: "Review and process orders",
    });
  }

  // Growth recommendations
  if (data.inventoryCount > data.activeDevices * 2) {
    recommendations.push({
      id: "excess-inventory",
      type: "growth" as const,
      priority: "medium" as const,
      title: "Launch Promotional Campaign",
      description: `Inventory (${data.inventoryCount}) significantly exceeds deployed devices (${data.activeDevices}).`,
      impact: "Potential 20-30% increase in deployments",
      action: "Create promotional offers or bundle deals",
    });
  }

  // Retention recommendations
  if (data.churnRate > 5) {
    recommendations.push({
      id: "high-churn",
      type: "retention" as const,
      priority: "high" as const,
      title: "Address Customer Churn",
      description: `Churn rate of ${data.churnRate}% is above healthy threshold.`,
      impact: "Reduce revenue loss by up to 15%",
      action: "Implement customer success program",
    });
  }

  if (data.inactiveDevices > 0) {
    recommendations.push({
      id: "inactive-devices",
      type: "retention" as const,
      priority: "high" as const,
      title: "Re-engage Inactive Customers",
      description: `${data.inactiveDevices} devices are currently inactive.`,
      impact: "Prevent potential churn",
      action: "Contact customers to resolve issues",
    });
  }

  // Operational recommendations
  if (data.alertCount > 50) {
    recommendations.push({
      id: "alert-fatigue",
      type: "operational" as const,
      priority: "medium" as const,
      title: "Optimize Alert Thresholds",
      description: `High alert volume (${data.alertCount}) may cause alert fatigue.`,
      impact: "Improved response times",
      action: "Review and adjust alert rules",
    });
  }

  // Upsell recommendation
  if (data.activeDevices > 10 && data.mrr < data.activeDevices * 50) {
    recommendations.push({
      id: "upsell-opportunity",
      type: "revenue" as const,
      priority: "medium" as const,
      title: "Upsell Premium Features",
      description: "Customers with multiple devices are candidates for premium plans.",
      impact: "Potential 25% MRR increase",
      action: "Identify and target multi-device customers",
    });
  }

  return recommendations.slice(0, 5);
}
