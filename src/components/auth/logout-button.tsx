"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  variant?: "ghost" | "default" | "outline";
  showIcon?: boolean;
  showText?: boolean;
}

export function LogoutButton({ 
  variant = "ghost", 
  showIcon = true,
  showText = false 
}: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Button 
      variant={variant} 
      size={showText ? "default" : "icon"}
      onClick={handleLogout}
      className="text-slate-300 hover:text-white"
    >
      {showIcon && <LogOut className={`h-5 w-5 ${showText ? "mr-2" : ""}`} />}
      {showText && "Sign Out"}
    </Button>
  );
}
