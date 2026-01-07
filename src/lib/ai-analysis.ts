// AI Predictive Maintenance Analysis
// Analyzes telemetry data to predict potential device failures and maintenance needs

export interface TelemetryPoint {
  variableCode: string;
  value: number;
  capturedAt: Date;
}

export interface AnalysisResult {
  deviceId: string;
  deviceName: string;
  healthScore: number; // 0-100
  status: "healthy" | "warning" | "critical";
  predictions: Prediction[];
  recommendations: Recommendation[];
  trends: Trend[];
}

export interface Prediction {
  type: "failure" | "maintenance" | "anomaly";
  probability: number; // 0-1
  timeframe: string;
  description: string;
  variableCode?: string;
}

export interface Recommendation {
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  action: string;
  estimatedImpact: string;
}

export interface Trend {
  variableCode: string;
  direction: "increasing" | "decreasing" | "stable" | "volatile";
  changePercent: number;
  period: string;
}

export interface DeviceConfig {
  deviceTypeCategory: string;
  variables: Array<{
    code: string;
    label: string;
    unit: string;
    minValue?: number;
    maxValue?: number;
  }>;
}

// Analyze telemetry data and generate predictions
export function analyzeDeviceTelemetry(
  telemetry: TelemetryPoint[],
  config: DeviceConfig
): AnalysisResult {
  const trends = calculateTrends(telemetry, config);
  const anomalies = detectAnomalies(telemetry, config);
  const predictions = generatePredictions(telemetry, trends, anomalies, config);
  const recommendations = generateRecommendations(predictions, trends, config);
  const healthScore = calculateHealthScore(predictions, anomalies, trends);

  return {
    deviceId: "",
    deviceName: "",
    healthScore,
    status: healthScore >= 80 ? "healthy" : healthScore >= 50 ? "warning" : "critical",
    predictions,
    recommendations,
    trends,
  };
}

// Calculate trends for each variable
function calculateTrends(telemetry: TelemetryPoint[], config: DeviceConfig): Trend[] {
  const trends: Trend[] = [];
  const variableCodes = [...new Set(telemetry.map((t) => t.variableCode))];

  for (const code of variableCodes) {
    const points = telemetry
      .filter((t) => t.variableCode === code)
      .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());

    if (points.length < 2) continue;

    const firstHalf = points.slice(0, Math.floor(points.length / 2));
    const secondHalf = points.slice(Math.floor(points.length / 2));

    const firstAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;

    const changePercent = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    // Calculate volatility (standard deviation)
    const mean = points.reduce((sum, p) => sum + p.value, 0) / points.length;
    const variance = points.reduce((sum, p) => sum + Math.pow(p.value - mean, 2), 0) / points.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = mean !== 0 ? (stdDev / mean) * 100 : 0;

    let direction: Trend["direction"];
    if (coefficientOfVariation > 30) {
      direction = "volatile";
    } else if (Math.abs(changePercent) < 5) {
      direction = "stable";
    } else if (changePercent > 0) {
      direction = "increasing";
    } else {
      direction = "decreasing";
    }

    trends.push({
      variableCode: code,
      direction,
      changePercent: Math.round(changePercent * 10) / 10,
      period: "last 7 days",
    });
  }

  return trends;
}

// Detect anomalies in telemetry data
function detectAnomalies(
  telemetry: TelemetryPoint[],
  config: DeviceConfig
): Array<{ variableCode: string; severity: number; description: string }> {
  const anomalies: Array<{ variableCode: string; severity: number; description: string }> = [];

  for (const variable of config.variables) {
    const points = telemetry.filter((t) => t.variableCode === variable.code);
    if (points.length === 0) continue;

    const values = points.map((p) => p.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    );

    // Check for out-of-range values
    const latestValue = values[values.length - 1];
    
    if (variable.minValue !== undefined && latestValue < variable.minValue) {
      anomalies.push({
        variableCode: variable.code,
        severity: 0.8,
        description: `${variable.label} is below minimum threshold (${latestValue} < ${variable.minValue})`,
      });
    }

    if (variable.maxValue !== undefined && latestValue > variable.maxValue) {
      anomalies.push({
        variableCode: variable.code,
        severity: 0.8,
        description: `${variable.label} is above maximum threshold (${latestValue} > ${variable.maxValue})`,
      });
    }

    // Check for statistical anomalies (values > 2 std devs from mean)
    if (Math.abs(latestValue - mean) > 2 * stdDev) {
      anomalies.push({
        variableCode: variable.code,
        severity: 0.6,
        description: `${variable.label} shows unusual reading (${latestValue.toFixed(2)}, expected ~${mean.toFixed(2)})`,
      });
    }
  }

  return anomalies;
}

// Generate predictions based on trends and anomalies
function generatePredictions(
  telemetry: TelemetryPoint[],
  trends: Trend[],
  anomalies: Array<{ variableCode: string; severity: number; description: string }>,
  config: DeviceConfig
): Prediction[] {
  const predictions: Prediction[] = [];

  // Predict based on trends
  for (const trend of trends) {
    const variable = config.variables.find((v) => v.code === trend.variableCode);
    if (!variable) continue;

    if (trend.direction === "decreasing" && trend.changePercent < -20) {
      // Rapid decrease might indicate sensor degradation or leak
      if (config.deviceTypeCategory === "water") {
        predictions.push({
          type: "anomaly",
          probability: 0.7,
          timeframe: "1-2 weeks",
          description: `${variable.label} showing rapid decline - possible leak or sensor issue`,
          variableCode: trend.variableCode,
        });
      }
    }

    if (trend.direction === "volatile") {
      predictions.push({
        type: "maintenance",
        probability: 0.6,
        timeframe: "2-4 weeks",
        description: `${variable.label} readings are unstable - sensor calibration may be needed`,
        variableCode: trend.variableCode,
      });
    }

    // Predict threshold breach
    if (trend.direction === "increasing" && variable.maxValue) {
      const points = telemetry.filter((t) => t.variableCode === trend.variableCode);
      const latestValue = points[points.length - 1]?.value || 0;
      const rateOfChange = (trend.changePercent / 100) * latestValue / 7; // per day
      
      if (rateOfChange > 0) {
        const daysToMax = (variable.maxValue - latestValue) / rateOfChange;
        if (daysToMax > 0 && daysToMax < 30) {
          predictions.push({
            type: "failure",
            probability: 0.5 + (1 - daysToMax / 30) * 0.3,
            timeframe: `${Math.ceil(daysToMax)} days`,
            description: `${variable.label} may exceed maximum threshold`,
            variableCode: trend.variableCode,
          });
        }
      }
    }
  }

  // Add predictions based on anomalies
  for (const anomaly of anomalies) {
    if (anomaly.severity > 0.7) {
      predictions.push({
        type: "failure",
        probability: anomaly.severity,
        timeframe: "immediate",
        description: anomaly.description,
        variableCode: anomaly.variableCode,
      });
    }
  }

  // Category-specific predictions
  if (config.deviceTypeCategory === "water") {
    const waterLevel = telemetry.filter((t) => t.variableCode === "W" || t.variableCode === "WL");
    if (waterLevel.length > 0) {
      const avgLevel = waterLevel.reduce((sum, p) => sum + p.value, 0) / waterLevel.length;
      if (avgLevel < 20) {
        predictions.push({
          type: "maintenance",
          probability: 0.8,
          timeframe: "1-3 days",
          description: "Water level critically low - refill required soon",
        });
      }
    }
  }

  if (config.deviceTypeCategory === "power") {
    const voltage = telemetry.filter((t) => t.variableCode === "V");
    if (voltage.length > 0) {
      const avgVoltage = voltage.reduce((sum, p) => sum + p.value, 0) / voltage.length;
      if (avgVoltage < 210 || avgVoltage > 245) {
        predictions.push({
          type: "anomaly",
          probability: 0.7,
          timeframe: "ongoing",
          description: "Voltage fluctuations detected - check power supply stability",
        });
      }
    }
  }

  return predictions.sort((a, b) => b.probability - a.probability);
}

// Generate recommendations based on predictions and trends
function generateRecommendations(
  predictions: Prediction[],
  trends: Trend[],
  config: DeviceConfig
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // High priority recommendations for failure predictions
  const failurePredictions = predictions.filter((p) => p.type === "failure" && p.probability > 0.6);
  for (const pred of failurePredictions) {
    recommendations.push({
      priority: "critical",
      title: "Immediate Attention Required",
      description: pred.description,
      action: "Schedule immediate inspection and maintenance",
      estimatedImpact: "Prevent potential device failure and data loss",
    });
  }

  // Medium priority for maintenance predictions
  const maintenancePredictions = predictions.filter((p) => p.type === "maintenance");
  for (const pred of maintenancePredictions) {
    recommendations.push({
      priority: "medium",
      title: "Scheduled Maintenance Recommended",
      description: pred.description,
      action: `Plan maintenance within ${pred.timeframe}`,
      estimatedImpact: "Extend device lifespan and improve accuracy",
    });
  }

  // General recommendations based on device type
  if (config.deviceTypeCategory === "water") {
    const waterTrend = trends.find((t) => t.variableCode === "W" || t.variableCode === "WL");
    if (waterTrend?.direction === "decreasing") {
      recommendations.push({
        priority: "low",
        title: "Monitor Water Consumption",
        description: "Water level is trending downward",
        action: "Review consumption patterns and check for leaks",
        estimatedImpact: "Optimize water usage and reduce costs",
      });
    }
  }

  if (config.deviceTypeCategory === "power") {
    const energyTrend = trends.find((t) => t.variableCode === "KWH");
    if (energyTrend?.direction === "increasing" && energyTrend.changePercent > 15) {
      recommendations.push({
        priority: "medium",
        title: "Energy Consumption Increasing",
        description: `Energy usage up ${energyTrend.changePercent}% over the period`,
        action: "Audit connected equipment for efficiency issues",
        estimatedImpact: "Potential 10-20% reduction in energy costs",
      });
    }
  }

  // Add general best practices if no critical issues
  if (recommendations.filter((r) => r.priority === "critical").length === 0) {
    recommendations.push({
      priority: "low",
      title: "Regular Maintenance Schedule",
      description: "Device is operating normally",
      action: "Continue regular monitoring and scheduled maintenance",
      estimatedImpact: "Maintain optimal device performance",
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Calculate overall health score
function calculateHealthScore(
  predictions: Prediction[],
  anomalies: Array<{ severity: number }>,
  trends: Trend[]
): number {
  let score = 100;

  // Deduct for predictions
  for (const pred of predictions) {
    if (pred.type === "failure") {
      score -= pred.probability * 30;
    } else if (pred.type === "maintenance") {
      score -= pred.probability * 15;
    } else if (pred.type === "anomaly") {
      score -= pred.probability * 20;
    }
  }

  // Deduct for anomalies
  for (const anomaly of anomalies) {
    score -= anomaly.severity * 10;
  }

  // Deduct for volatile trends
  for (const trend of trends) {
    if (trend.direction === "volatile") {
      score -= 5;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// Generate a summary text for the analysis
export function generateAnalysisSummary(result: AnalysisResult): string {
  const statusEmoji = result.status === "healthy" ? "✅" : result.status === "warning" ? "⚠️" : "🚨";
  
  let summary = `${statusEmoji} **Device Health: ${result.healthScore}%** (${result.status.toUpperCase()})\n\n`;

  if (result.predictions.length > 0) {
    summary += "**Key Findings:**\n";
    for (const pred of result.predictions.slice(0, 3)) {
      const icon = pred.type === "failure" ? "🔴" : pred.type === "maintenance" ? "🟡" : "🟠";
      summary += `${icon} ${pred.description} (${Math.round(pred.probability * 100)}% confidence, ${pred.timeframe})\n`;
    }
    summary += "\n";
  }

  if (result.recommendations.length > 0) {
    summary += "**Recommendations:**\n";
    for (const rec of result.recommendations.slice(0, 3)) {
      const icon = rec.priority === "critical" ? "🚨" : rec.priority === "high" ? "⚠️" : rec.priority === "medium" ? "📋" : "💡";
      summary += `${icon} **${rec.title}**: ${rec.action}\n`;
    }
  }

  return summary;
}
