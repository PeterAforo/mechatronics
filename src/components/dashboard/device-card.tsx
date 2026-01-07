"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Zap, Droplets, ArrowRight } from "lucide-react";

type DeviceType = "FROSTLINK" | "ELECTRA" | "HYDROLINK";

interface Device {
  id: string;
  serial: string;
  name: string;
  type: DeviceType;
  description?: string | null;
  isActive: boolean;
}

interface DeviceCardProps {
  device: Device;
}

const deviceConfig: Record<DeviceType, {
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
  iconColor: string;
  href: string;
  subtitle: string;
}> = {
  FROSTLINK: {
    icon: Thermometer,
    gradient: "from-blue-600/20 to-cyan-600/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    href: "/dashboard/frostlink",
    subtitle: "Coldroom Monitor",
  },
  ELECTRA: {
    icon: Zap,
    gradient: "from-yellow-600/20 to-orange-600/20",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
    href: "/dashboard/electra",
    subtitle: "Power Monitor",
  },
  HYDROLINK: {
    icon: Droplets,
    gradient: "from-cyan-600/20 to-teal-600/20",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    href: "/dashboard/hydrolink",
    subtitle: "Water Monitor",
  },
};

export function DeviceCard({ device }: DeviceCardProps) {
  const config = deviceConfig[device.type];
  const Icon = config.icon;

  return (
    <Link href={`${config.href}/${device.id}`}>
      <Card className={`
        border-slate-800 bg-gradient-to-br ${config.gradient} 
        hover:border-slate-700 transition-all duration-300 
        hover:scale-[1.02] hover:shadow-xl cursor-pointer
        group
      `}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl ${config.iconBg}`}>
              <Icon className={`h-8 w-8 ${config.iconColor}`} />
            </div>
            <Badge 
              variant={device.isActive ? "default" : "secondary"}
              className={device.isActive ? "bg-green-600" : "bg-slate-600"}
            >
              {device.isActive ? "Online" : "Offline"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-xl text-white mb-1">{device.name}</CardTitle>
          <CardDescription className="text-slate-400 mb-4">
            {device.description || config.subtitle}
          </CardDescription>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">{device.serial}</span>
            <div className="flex items-center text-purple-400 text-sm group-hover:text-purple-300 transition-colors">
              View Dashboard
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
