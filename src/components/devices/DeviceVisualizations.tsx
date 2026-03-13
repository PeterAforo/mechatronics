"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface VisualizationProps {
  value: number;
  min: number;
  max: number;
  unit?: string;
  label?: string;
  isWarning?: boolean;
}

// Water Tank Visualization
export function WaterTankSVG({ value, min, max, unit = "%", label = "Water Level", isWarning }: VisualizationProps) {
  const waterRef = useRef<SVGRectElement>(null);
  const bubblesRef = useRef<SVGGElement>(null);
  const valueRef = useRef<SVGTextElement>(null);
  
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const waterHeight = (percentage / 100) * 120;
  
  useEffect(() => {
    if (waterRef.current) {
      gsap.to(waterRef.current, {
        height: waterHeight,
        y: 140 - waterHeight,
        duration: 1.2,
        ease: "power2.out",
      });
    }
    
    if (valueRef.current) {
      gsap.fromTo(valueRef.current, 
        { opacity: 0.5, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out" }
      );
    }
    
    // Animate bubbles
    if (bubblesRef.current && percentage > 10) {
      const bubbles = bubblesRef.current.children;
      gsap.fromTo(bubbles, 
        { y: 0, opacity: 0 },
        { 
          y: -30, 
          opacity: 0.6, 
          duration: 2,
          stagger: 0.3,
          repeat: -1,
          ease: "power1.inOut"
        }
      );
    }
  }, [waterHeight, percentage]);
  
  const getWaterColor = () => {
    if (isWarning) return "#f59e0b";
    if (percentage < 20) return "#ef4444";
    if (percentage < 40) return "#f59e0b";
    return "#3b82f6";
  };
  
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="200" viewBox="0 0 140 200">
        {/* Tank outline */}
        <defs>
          <linearGradient id="tankGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={getWaterColor()} stopOpacity="0.9" />
            <stop offset="100%" stopColor={getWaterColor()} stopOpacity="0.6" />
          </linearGradient>
          <filter id="waterWave">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
          </filter>
        </defs>
        
        {/* Tank body */}
        <rect x="20" y="20" width="100" height="140" rx="8" fill="url(#tankGradient)" stroke="#d1d5db" strokeWidth="2" />
        
        {/* Water */}
        <clipPath id="tankClip">
          <rect x="22" y="22" width="96" height="136" rx="6" />
        </clipPath>
        <g clipPath="url(#tankClip)">
          <rect 
            ref={waterRef}
            x="22" 
            y="140" 
            width="96" 
            height="0"
            fill="url(#waterGradient)"
          />
          {/* Water surface wave effect */}
          <ellipse 
            cx="70" 
            cy={140 - waterHeight + 2}
            rx="46" 
            ry="4"
            fill={getWaterColor()}
            opacity="0.5"
          />
        </g>
        
        {/* Bubbles */}
        <g ref={bubblesRef}>
          <circle cx="40" cy="130" r="3" fill="white" opacity="0" />
          <circle cx="60" cy="135" r="2" fill="white" opacity="0" />
          <circle cx="85" cy="128" r="2.5" fill="white" opacity="0" />
          <circle cx="95" cy="132" r="2" fill="white" opacity="0" />
        </g>
        
        {/* Level markers */}
        {[0, 25, 50, 75, 100].map((level) => (
          <g key={level}>
            <line 
              x1="122" 
              y1={158 - (level / 100) * 120} 
              x2="130" 
              y2={158 - (level / 100) * 120}
              stroke="#9ca3af" 
              strokeWidth="1"
            />
            <text 
              x="132" 
              y={162 - (level / 100) * 120}
              fontSize="8" 
              fill="#9ca3af"
            >
              {level}
            </text>
          </g>
        ))}
        
        {/* Value display */}
        <text 
          ref={valueRef}
          x="70" 
          y="180"
          textAnchor="middle" 
          fontSize="24" 
          fontWeight="bold"
          fill={getWaterColor()}
        >
          {value.toFixed(1)}{unit}
        </text>
      </svg>
      <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
    </div>
  );
}

// Power Meter Visualization
export function PowerMeterSVG({ value, min, max, unit = "kW", label = "Power Usage", isWarning }: VisualizationProps) {
  const needleRef = useRef<SVGLineElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  
  // Calculate percentage based on actual min/max range
  const range = max - min;
  const percentage = range > 0 ? Math.min(100, Math.max(0, ((value - min) / range) * 100)) : 50;
  
  // Gauge geometry - centered at (120, 100), radius 70
  const cx = 120;
  const cy = 100;
  const radius = 70;
  const innerRadius = 55;
  const outerRadius = 75;
  
  // Arc spans from -135° to +135° (270° total sweep)
  const startAngleDeg = -135;
  const endAngleDeg = 135;
  const sweepAngle = 270;
  
  // Current needle angle based on value
  const needleAngleDeg = startAngleDeg + (percentage / 100) * sweepAngle;
  const needleAngleRad = (needleAngleDeg * Math.PI) / 180;
  
  // Needle end point
  const needleLength = 50;
  const needleX = cx + needleLength * Math.cos(needleAngleRad);
  const needleY = cy + needleLength * Math.sin(needleAngleRad);
  
  useEffect(() => {
    if (needleRef.current) {
      const angleRad = (needleAngleDeg * Math.PI) / 180;
      const endX = cx + needleLength * Math.cos(angleRad);
      const endY = cy + needleLength * Math.sin(angleRad);
      
      gsap.to(needleRef.current, {
        attr: { x2: endX, y2: endY },
        duration: 1,
        ease: "power2.out",
      });
    }
    
    if (dotRef.current) {
      const angleRad = (needleAngleDeg * Math.PI) / 180;
      const dotX = cx + (needleLength - 5) * Math.cos(angleRad);
      const dotY = cy + (needleLength - 5) * Math.sin(angleRad);
      
      gsap.to(dotRef.current, {
        attr: { cx: dotX, cy: dotY },
        duration: 1,
        ease: "power2.out",
      });
    }
  }, [needleAngleDeg]);
  
  const getColor = () => {
    if (isWarning || percentage > 80) return "#ef4444";
    if (percentage > 60) return "#f59e0b";
    return "#10b981";
  };

  // Create arc path
  const createArc = (startDeg: number, endDeg: number, r: number) => {
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Progress arc (from start to current value)
  const progressEndDeg = startAngleDeg + (percentage / 100) * sweepAngle;
  
  // Generate tick marks
  const ticks = [0, 20, 40, 60, 80, 100];
  
  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="150" viewBox="0 0 240 150">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="needleShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Background arc */}
        <path
          d={createArc(startAngleDeg, endAngleDeg, radius)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="14"
          strokeLinecap="round"
        />
        
        {/* Colored progress arc */}
        <path
          d={createArc(startAngleDeg, endAngleDeg, radius)}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        
        {/* Tick marks and labels */}
        {ticks.map((tick) => {
          const tickAngleDeg = startAngleDeg + (tick / 100) * sweepAngle;
          const tickAngleRad = (tickAngleDeg * Math.PI) / 180;
          
          // Tick line positions
          const x1 = cx + innerRadius * Math.cos(tickAngleRad);
          const y1 = cy + innerRadius * Math.sin(tickAngleRad);
          const x2 = cx + (innerRadius + 8) * Math.cos(tickAngleRad);
          const y2 = cy + (innerRadius + 8) * Math.sin(tickAngleRad);
          
          // Label position
          const labelR = outerRadius + 12;
          const labelX = cx + labelR * Math.cos(tickAngleRad);
          const labelY = cy + labelR * Math.sin(tickAngleRad);
          
          // Calculate actual value for this tick
          const tickValue = min + (tick / 100) * range;
          
          return (
            <g key={tick}>
              <line 
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke="#6b7280" 
                strokeWidth="2" 
              />
              <text 
                x={labelX} 
                y={labelY + 4} 
                textAnchor="middle" 
                fontSize="10" 
                fill="#6b7280"
                fontWeight="500"
              >
                {tickValue.toFixed(0)}
              </text>
            </g>
          );
        })}
        
        {/* Center hub */}
        <circle cx={cx} cy={cy} r="12" fill="#374151" />
        <circle cx={cx} cy={cy} r="8" fill="#1f2937" />
        <circle cx={cx} cy={cy} r="4" fill="#6b7280" />
        
        {/* Needle */}
        <line
          ref={needleRef}
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#1f2937"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#needleShadow)"
        />
        
        {/* Needle tip indicator */}
        <circle
          ref={dotRef}
          cx={cx + (needleLength - 5) * Math.cos(needleAngleRad)}
          cy={cy + (needleLength - 5) * Math.sin(needleAngleRad)}
          r="4"
          fill={getColor()}
        />
        
        {/* Value display */}
        <text 
          x={cx} 
          y={cy + 40}
          textAnchor="middle" 
          fontSize="20" 
          fontWeight="bold"
          fill={getColor()}
        >
          {value.toFixed(1)} {unit}
        </text>
      </svg>
      <p className="text-sm font-medium text-gray-600 -mt-1">{label}</p>
    </div>
  );
}

// Temperature Gauge Visualization
export function TemperatureGaugeSVG({ value, min, max, unit = "°C", label = "Temperature", isWarning }: VisualizationProps) {
  const mercuryRef = useRef<SVGRectElement>(null);
  const bulbRef = useRef<SVGCircleElement>(null);
  const valueRef = useRef<SVGTextElement>(null);
  
  // Calculate percentage based on actual min/max range
  const range = max - min;
  const percentage = range > 0 ? Math.min(100, Math.max(0, ((value - min) / range) * 100)) : 50;
  
  // Mercury tube dimensions
  const tubeTop = 22;
  const tubeBottom = 138; // Extended to connect with bulb
  const tubeHeight = tubeBottom - tubeTop;
  const mercuryHeight = (percentage / 100) * tubeHeight;
  const mercuryY = tubeBottom - mercuryHeight;
  
  useEffect(() => {
    if (mercuryRef.current) {
      gsap.to(mercuryRef.current, {
        attr: { 
          height: mercuryHeight,
          y: mercuryY
        },
        duration: 1,
        ease: "power2.out",
      });
    }
    
    if (bulbRef.current) {
      gsap.to(bulbRef.current, {
        scale: 1 + (percentage / 400),
        duration: 1,
        ease: "power2.out",
      });
    }
    
    if (valueRef.current) {
      gsap.fromTo(valueRef.current,
        { opacity: 0.5 },
        { opacity: 1, duration: 0.5 }
      );
    }
  }, [mercuryHeight, mercuryY, percentage]);
  
  const getColor = () => {
    if (isWarning) return "#ef4444";
    // Color based on percentage of range, not absolute value
    if (percentage > 80) return "#ef4444";
    if (percentage > 60) return "#f59e0b";
    if (percentage < 20) return "#3b82f6";
    return "#10b981";
  };

  // Generate scale markers based on actual min/max
  const scaleMarkers = [
    { value: max, y: tubeTop },
    { value: min + (range * 0.75), y: tubeTop + tubeHeight * 0.25 },
    { value: min + (range * 0.5), y: tubeTop + tubeHeight * 0.5 },
    { value: min + (range * 0.25), y: tubeTop + tubeHeight * 0.75 },
    { value: min, y: tubeBottom },
  ];
  
  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="200" viewBox="0 0 120 200">
        <defs>
          <linearGradient id="tempGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="75%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <clipPath id="tubeClip">
            <rect x="47" y={tubeTop} width="16" height={tubeHeight} rx="8" />
          </clipPath>
        </defs>
        
        {/* Thermometer body */}
        <rect x="45" y="20" width="20" height="120" rx="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        
        {/* Mercury tube background */}
        <g clipPath="url(#tubeClip)">
          <rect x="47" y={tubeTop} width="16" height={tubeHeight} fill="#e5e7eb" />
        </g>
        
        {/* Mercury fill - animated */}
        <g clipPath="url(#tubeClip)">
          <rect 
            ref={mercuryRef}
            x="47" 
            y={tubeBottom}
            width="16" 
            height="0"
            fill={getColor()}
          />
        </g>
        
        {/* Bulb */}
        <circle 
          ref={bulbRef}
          cx="55" 
          cy="155" 
          r="20"
          fill={getColor()}
          style={{ transformOrigin: "55px 155px" }}
        />
        <circle cx="55" cy="155" r="10" fill="white" opacity="0.3" />
        
        {/* Scale markers with actual values */}
        {scaleMarkers.map((marker, i) => (
          <g key={i}>
            <line x1="67" y1={marker.y} x2="75" y2={marker.y} stroke="#9ca3af" strokeWidth="1" />
            <text x="78" y={marker.y + 4} fontSize="9" fill="#6b7280">
              {marker.value.toFixed(0)}°
            </text>
          </g>
        ))}
        
        {/* Current value indicator line */}
        <line 
          x1="35" 
          y1={mercuryY} 
          x2="45" 
          y2={mercuryY} 
          stroke={getColor()} 
          strokeWidth="2"
        />
        
        {/* Value display */}
        <text 
          ref={valueRef}
          x="55" 
          y="190"
          textAnchor="middle" 
          fontSize="16" 
          fontWeight="bold"
          fill={getColor()}
          style={{ transformOrigin: "55px 190px" }}
        >
          {value.toFixed(1)}{unit}
        </text>
      </svg>
      <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
    </div>
  );
}

// Generic Gauge for other metrics
export function GenericGaugeSVG({ value, min, max, unit = "", label = "Value", isWarning }: VisualizationProps) {
  const progressRef = useRef<SVGCircleElement>(null);
  const valueRef = useRef<SVGTextElement>(null);
  
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  useEffect(() => {
    if (progressRef.current) {
      gsap.fromTo(progressRef.current,
        { strokeDashoffset: circumference },
        { strokeDashoffset, duration: 1.5, ease: "power2.out" }
      );
    }
    
    if (valueRef.current) {
      gsap.fromTo(valueRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out" }
      );
    }
  }, [strokeDashoffset, circumference]);
  
  const getColor = () => {
    if (isWarning) return "#ef4444";
    if (percentage > 80) return "#ef4444";
    if (percentage > 60) return "#f59e0b";
    return "#8b5cf6";
  };
  
  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle 
          cx="80" 
          cy="80" 
          r="60"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
        />
        
        {/* Progress circle */}
        <circle 
          ref={progressRef}
          cx="80" 
          cy="80" 
          r="60"
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform="rotate(-90 80 80)"
          filter="url(#shadow)"
        />
        
        {/* Center content */}
        <text 
          ref={valueRef}
          x="80" 
          y="75"
          textAnchor="middle" 
          fontSize="24" 
          fontWeight="bold"
          fill={getColor()}
        >
          {value.toFixed(1)}
        </text>
        <text 
          x="80" 
          y="95"
          textAnchor="middle" 
          fontSize="12"
          fill="#9ca3af"
        >
          {unit}
        </text>
        
        {/* Percentage */}
        <text 
          x="80" 
          y="115"
          textAnchor="middle" 
          fontSize="10"
          fill="#6b7280"
        >
          {percentage.toFixed(0)}%
        </text>
      </svg>
      <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
    </div>
  );
}

// Coldroom/Multi-Sensor Visualization
export function ColdroomSVG({ 
  temperature, 
  humidity, 
  power,
  isWarning 
}: { 
  temperature?: { value: number; unit: string; min?: number; max?: number };
  humidity?: { value: number; unit: string; min?: number; max?: number };
  power?: { value: number; unit: string };
  isWarning?: boolean;
}) {
  const tempColor = temperature ? (
    temperature.value > (temperature.max || 10) ? "#ef4444" :
    temperature.value < (temperature.min || -5) ? "#3b82f6" : "#10b981"
  ) : "#6b7280";
  
  const humidityColor = humidity ? (
    humidity.value > 80 ? "#3b82f6" :
    humidity.value < 30 ? "#f59e0b" : "#10b981"
  ) : "#6b7280";

  return (
    <div className="flex flex-col items-center">
      <svg width="280" height="200" viewBox="0 0 280 200">
        <defs>
          <linearGradient id="coldroomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <filter id="frost">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>
        
        {/* Coldroom box */}
        <rect x="20" y="20" width="240" height="140" rx="8" fill="url(#coldroomGradient)" stroke="#0ea5e9" strokeWidth="2" />
        
        {/* Frost effect on edges */}
        <rect x="20" y="20" width="240" height="10" fill="white" opacity="0.5" rx="8" />
        
        {/* Door */}
        <rect x="100" y="40" width="80" height="100" rx="4" fill="#f0f9ff" stroke="#0ea5e9" strokeWidth="1" />
        <circle cx="170" cy="90" r="4" fill="#64748b" />
        
        {/* Temperature display */}
        <g transform="translate(30, 50)">
          <rect width="60" height="70" rx="6" fill="white" stroke="#e2e8f0" />
          <text x="30" y="20" textAnchor="middle" fontSize="10" fill="#64748b">TEMP</text>
          <text x="30" y="45" textAnchor="middle" fontSize="20" fontWeight="bold" fill={tempColor}>
            {temperature?.value.toFixed(1) || "--"}
          </text>
          <text x="30" y="60" textAnchor="middle" fontSize="10" fill="#94a3b8">
            {temperature?.unit || "°C"}
          </text>
        </g>
        
        {/* Humidity display */}
        <g transform="translate(190, 50)">
          <rect width="60" height="70" rx="6" fill="white" stroke="#e2e8f0" />
          <text x="30" y="20" textAnchor="middle" fontSize="10" fill="#64748b">HUMID</text>
          <text x="30" y="45" textAnchor="middle" fontSize="20" fontWeight="bold" fill={humidityColor}>
            {humidity?.value.toFixed(1) || "--"}
          </text>
          <text x="30" y="60" textAnchor="middle" fontSize="10" fill="#94a3b8">
            {humidity?.unit || "%"}
          </text>
        </g>
        
        {/* Power indicator */}
        {power && (
          <g transform="translate(115, 170)">
            <rect width="50" height="24" rx="4" fill="#fef3c7" stroke="#f59e0b" />
            <text x="25" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#d97706">
              ⚡ {power.value.toFixed(1)}{power.unit}
            </text>
          </g>
        )}
        
        {/* Warning indicator */}
        {isWarning && (
          <g transform="translate(230, 10)">
            <circle r="12" fill="#fef2f2" stroke="#ef4444" strokeWidth="2" />
            <text y="4" textAnchor="middle" fontSize="14" fill="#ef4444">!</text>
          </g>
        )}
      </svg>
      <p className="text-sm font-medium text-gray-600 mt-1">Coldroom Status</p>
    </div>
  );
}

// Multi-Category Dashboard Card
export function MultiCategoryCard({
  categories,
}: {
  categories: Array<{
    name: string;
    icon: React.ReactNode;
    color: string;
    variables: Array<{ label: string; value: number; unit: string }>;
  }>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((cat, idx) => (
        <div 
          key={idx} 
          className={`p-4 rounded-xl border-2 ${cat.color}`}
        >
          <div className="flex items-center gap-2 mb-3">
            {cat.icon}
            <span className="font-semibold text-gray-900">{cat.name}</span>
          </div>
          <div className="space-y-2">
            {cat.variables.map((v, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{v.label}</span>
                <span className="font-mono font-semibold">
                  {v.value.toFixed(1)} {v.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Device Health Overview SVG
export function DeviceHealthSVG({ 
  healthScore, 
  isOnline,
  category 
}: { 
  healthScore: number; 
  isOnline: boolean;
  category: string;
}) {
  const pulseRef = useRef<SVGCircleElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    if (pulseRef.current && isOnline) {
      gsap.to(pulseRef.current, {
        scale: 1.3,
        opacity: 0,
        duration: 1.5,
        repeat: -1,
        ease: "power1.out",
      });
    }
    
    if (scoreRef.current) {
      gsap.fromTo(scoreRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, [isOnline, healthScore]);
  
  const getHealthColor = () => {
    if (healthScore >= 80) return "#10b981";
    if (healthScore >= 60) return "#f59e0b";
    return "#ef4444";
  };
  
  const getCategoryIcon = () => {
    switch (category) {
      case "water":
        return "M50,25 Q35,45 35,60 Q35,75 50,75 Q65,75 65,60 Q65,45 50,25";
      case "power":
        return "M55,22 L42,48 L50,48 L45,68 L62,42 L54,42 Z";
      case "environment":
        return "M50,25 L50,50 M50,50 L38,62 M50,50 L62,62 M35,70 L65,70";
      default:
        return "M50,30 A20,20 0 1,1 50,70 A20,20 0 1,1 50,30";
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={getHealthColor()} stopOpacity="0.9" />
            <stop offset="100%" stopColor={getHealthColor()} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        
        {/* Outer ring background */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
        
        {/* Progress ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="none" 
          stroke={getHealthColor()}
          strokeWidth="6"
          strokeDasharray={`${(healthScore / 100) * 283} 283`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        
        {/* Pulse effect for online status */}
        {isOnline && (
          <circle 
            ref={pulseRef}
            cx="50" 
            cy="50" 
            r="32"
            fill="none"
            stroke={getHealthColor()}
            strokeWidth="2"
            opacity="0.5"
            style={{ transformOrigin: "50px 50px" }}
          />
        )}
        
        {/* Center icon */}
        <circle cx="50" cy="50" r="28" fill="url(#healthGradient)" />
        <path d={getCategoryIcon()} fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      
      {/* Health score displayed below the icon */}
      <span 
        ref={scoreRef}
        className="text-lg font-bold mt-1"
        style={{ color: getHealthColor() }}
      >
        {healthScore}%
      </span>
    </div>
  );
}
