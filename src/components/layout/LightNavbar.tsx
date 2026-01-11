"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, User, Settings, LogOut, 
  ChevronDown, Search
} from "lucide-react";

interface LightNavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    tenantName?: string | null;
  };
  notificationCount?: number;
  userType: "admin" | "portal";
}

export function LightNavbar({ 
  user, 
  notificationCount = 0,
  userType
}: LightNavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const baseHref = userType === "admin" ? "/admin" : "/portal";

  return (
    <header className="fixed top-0 left-64 right-0 z-30 h-16 bg-[#fafafa] border-b border-gray-100">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Welcome & Search */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {user.name?.split(" ")[0] || "User"}!
            </h1>
          </div>
        </div>

        {/* Right side - Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 w-64 shadow-sm">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 w-full"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50"
              >
                <Bell className="h-5 w-5 text-gray-500" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white rounded-xl shadow-lg border border-gray-100">
              <DropdownMenuLabel className="text-gray-900">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-6 text-center text-sm text-gray-500">
                No new notifications
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`${baseHref}/alerts`} className="w-full text-center text-purple-600 font-medium">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-medium text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">
                    {user.role || user.tenantName || user.email}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white rounded-xl shadow-lg border border-gray-100">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium text-gray-900">{user.name || "User"}</p>
                  <p className="text-xs text-gray-500 font-normal">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`${baseHref}/profile`} className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4 text-gray-500" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${baseHref}/settings`} className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4 text-gray-500" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
