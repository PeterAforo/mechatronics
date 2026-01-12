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
  const needleRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const valueRef = useRef<SVGTextElement>(null);
  
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const angle = -135 + (percentage / 100) * 270; // -135 to 135 degrees
  
  useEffect(() => {
    if (needleRef.current) {
      gsap.to(needleRef.current, {
        rotation: angle,
        transformOrigin: "100 100",
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
      });
    }
    
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: percentage > 80 ? 0.8 : 0.3,
        scale: percentage > 80 ? 1.1 : 1,
        duration: 0.5,
        repeat: percentage > 80 ? -1 : 0,
        yoyo: true,
      });
    }
    
    if (valueRef.current) {
      gsap.fromTo(valueRef.current,
        { scale: 0.8 },
        { scale: 1, duration: 0.5, ease: "back.out" }
      );
    }
  }, [angle, percentage]);
  
  const getColor = () => {
    if (isWarning || percentage > 80) return "#ef4444";
    if (percentage > 60) return "#f59e0b";
    return "#10b981";
  };
  
  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="160" viewBox="0 0 200 160">
        <defs>
          <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background arc */}
        <path
          d="M 30 130 A 70 70 0 1 1 170 130"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Colored arc */}
        <path
          d="M 30 130 A 70 70 0 1 1 170 130"
          fill="none"
          stroke="url(#meterGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(percentage / 100) * 220} 220`}
        />
        
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickAngle = (-135 + (tick / 100) * 270) * (Math.PI / 180);
          const x1 = 100 + 55 * Math.cos(tickAngle);
          const y1 = 100 + 55 * Math.sin(tickAngle);
          const x2 = 100 + 65 * Math.cos(tickAngle);
          const y2 = 100 + 65 * Math.sin(tickAngle);
          return (
            <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9ca3af" strokeWidth="2" />
          );
        })}
        
        {/* Center glow */}
        <circle 
          ref={glowRef}
          cx="100" 
          cy="100" 
          r="15"
          fill={getColor()}
          opacity="0.3"
          filter="url(#glow)"
        />
        
        {/* Needle */}
        <g ref={needleRef}>
          <polygon 
            points="100,100 95,105 100,40 105,105"
            fill={getColor()}
          />
          <circle cx="100" cy="100" r="8" fill={getColor()} />
          <circle cx="100" cy="100" r="4" fill="white" />
        </g>
        
        {/* Value display */}
        <text 
          ref={valueRef}
          x="100" 
          y="145"
          textAnchor="middle" 
          fontSize="20" 
          fontWeight="bold"
          fill={getColor()}
        >
          {value.toFixed(1)} {unit}
        </text>
      </svg>
      <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
    </div>
  );
}

// Temperature Gauge Visualization
export function TemperatureGaugeSVG({ value, min, max, unit = "°C", label = "Temperature", isWarning }: VisualizationProps) {
  const mercuryRef = useRef<SVGRectElement>(null);
  const bulbRef = useRef<SVGCircleElement>(null);
  const valueRef = useRef<SVGTextElement>(null);
  
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const mercuryHeight = (percentage / 100) * 100;
  
  useEffect(() => {
    if (mercuryRef.current) {
      gsap.to(mercuryRef.current, {
        height: mercuryHeight,
        y: 120 - mercuryHeight,
        duration: 1,
        ease: "power2.out",
      });
    }
    
    if (bulbRef.current) {
      gsap.to(bulbRef.current, {
        scale: 1 + (percentage / 500),
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
  }, [mercuryHeight, percentage]);
  
  const getColor = () => {
    if (isWarning) return "#ef4444";
    if (value > 35) return "#ef4444";
    if (value > 25) return "#f59e0b";
    if (value < 5) return "#3b82f6";
    return "#10b981";
  };
  
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="200" viewBox="0 0 100 200">
        <defs>
          <linearGradient id="tempGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="75%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        
        {/* Thermometer body */}
        <rect x="40" y="20" width="20" height="120" rx="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        
        {/* Mercury tube */}
        <clipPath id="tubeClip">
          <rect x="42" y="22" width="16" height="116" rx="8" />
        </clipPath>
        <g clipPath="url(#tubeClip)">
          <rect 
            ref={mercuryRef}
            x="42" 
            y="120" 
            width="16" 
            height="0"
            fill={getColor()}
          />
        </g>
        
        {/* Bulb */}
        <circle 
          ref={bulbRef}
          cx="50" 
          cy="155" 
          r="20"
          fill={getColor()}
          style={{ transformOrigin: "50px 155px" }}
        />
        <circle cx="50" cy="155" r="12" fill="white" opacity="0.3" />
        
        {/* Scale markers */}
        {[min, (min + max) / 2, max].map((temp, i) => (
          <g key={i}>
            <line x1="62" y1={120 - (i * 50)} x2="70" y2={120 - (i * 50)} stroke="#9ca3af" strokeWidth="1" />
            <text x="74" y={124 - (i * 50)} fontSize="10" fill="#9ca3af">{temp}°</text>
          </g>
        ))}
        
        {/* Value display */}
        <text 
          ref={valueRef}
          x="50" 
          y="190"
          textAnchor="middle" 
          fontSize="18" 
          fontWeight="bold"
          fill={getColor()}
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
  const scoreRef = useRef<SVGTextElement>(null);
  
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
        { scale: 0 },
        { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, [isOnline]);
  
  const getHealthColor = () => {
    if (healthScore >= 80) return "#10b981";
    if (healthScore >= 60) return "#f59e0b";
    return "#ef4444";
  };
  
  const getCategoryIcon = () => {
    switch (category) {
      case "water":
        return "M50,20 Q30,50 30,70 Q30,90 50,90 Q70,90 70,70 Q70,50 50,20";
      case "power":
        return "M55,15 L40,45 L50,45 L45,75 L65,40 L55,40 Z";
      case "environment":
        return "M50,20 L50,50 M50,50 L35,65 M50,50 L65,65 M30,75 L70,75";
      default:
        return "M50,25 A25,25 0 1,1 50,75 A25,25 0 1,1 50,25";
    }
  };
  
  return (
    <svg width="120" height="120" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={getHealthColor()} stopOpacity="0.8" />
          <stop offset="100%" stopColor={getHealthColor()} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      
      {/* Outer ring */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="none" 
        stroke={getHealthColor()}
        strokeWidth="4"
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
          r="35"
          fill="none"
          stroke={getHealthColor()}
          strokeWidth="2"
          opacity="0.5"
          style={{ transformOrigin: "50px 50px" }}
        />
      )}
      
      {/* Center icon */}
      <circle cx="50" cy="50" r="30" fill="url(#healthGradient)" />
      <path d={getCategoryIcon()} fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Health score */}
      <text 
        ref={scoreRef}
        x="50" 
        y="92"
        textAnchor="middle" 
        fontSize="12" 
        fontWeight="bold"
        fill={getHealthColor()}
        style={{ transformOrigin: "50px 92px" }}
      >
        {healthScore}%
      </text>
    </svg>
  );
}
