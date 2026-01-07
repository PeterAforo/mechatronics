"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, AlertTriangle, CheckCircle } from "lucide-react";

interface TankFillWidgetProps {
  value: number;
  label?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  lowThreshold?: number;
  criticalThreshold?: number;
}

export function TankFillWidget({
  value,
  label = "Water Level",
  unit = "%",
  minValue = 0,
  maxValue = 100,
  lowThreshold = 20,
  criticalThreshold = 10,
}: TankFillWidgetProps) {
  // Normalize value to percentage
  const percentage = Math.min(100, Math.max(0, ((value - minValue) / (maxValue - minValue)) * 100));
  
  // Determine status
  const isCritical = value <= criticalThreshold;
  const isLow = value <= lowThreshold && !isCritical;
  const isGood = value > lowThreshold;

  // Colors based on level
  const getWaterColor = () => {
    if (isCritical) return "from-red-500 to-red-600";
    if (isLow) return "from-yellow-500 to-orange-500";
    return "from-cyan-400 to-blue-500";
  };

  const getStatusBadge = () => {
    if (isCritical) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Critical
        </Badge>
      );
    }
    if (isLow) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Low
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Normal
      </Badge>
    );
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-400" />
            {label}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Tank Visualization */}
          <div className="relative w-24 h-40">
            {/* Tank outline */}
            <div className="absolute inset-0 border-4 border-slate-600 rounded-b-3xl rounded-t-lg bg-slate-800/50 overflow-hidden">
              {/* Water fill */}
              <div 
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getWaterColor()} transition-all duration-1000 ease-out`}
                style={{ height: `${percentage}%` }}
              >
                {/* Wave effect */}
                <div className="absolute top-0 left-0 right-0 h-3 overflow-hidden">
                  <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full">
                    <path 
                      d="M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5 V 10 H 0 Z" 
                      fill="currentColor" 
                      className="text-white/20 animate-pulse"
                    />
                  </svg>
                </div>
              </div>
              
              {/* Level markers */}
              <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
                <span className="text-[10px] text-slate-500">100%</span>
                <span className="text-[10px] text-slate-500">75%</span>
                <span className="text-[10px] text-slate-500">50%</span>
                <span className="text-[10px] text-slate-500">25%</span>
                <span className="text-[10px] text-slate-500">0%</span>
              </div>
            </div>
            
            {/* Tank cap */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-600 rounded-t-lg border-2 border-slate-500" />
          </div>

          {/* Value Display */}
          <div className="flex-1">
            <div className="text-5xl font-bold text-white mb-1">
              {value.toFixed(0)}
              <span className="text-2xl text-slate-400 ml-1">{unit}</span>
            </div>
            <p className="text-slate-400 text-sm">
              {isCritical && "Refill immediately!"}
              {isLow && "Consider refilling soon"}
              {isGood && "Tank level is healthy"}
            </p>
            
            {/* Progress bar alternative */}
            <div className="mt-4 h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getWaterColor()} transition-all duration-1000`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-500">
              <span>Empty</span>
              <span>Full</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
