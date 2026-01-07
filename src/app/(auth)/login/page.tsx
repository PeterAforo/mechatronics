"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Droplets, Zap } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try tenant login first
      const tenantResult = await signIn("tenant-credentials", {
        email,
        password,
        redirect: false,
      });

      // If tenant login succeeds, redirect to portal
      if (!tenantResult?.error) {
        toast.success("Welcome back!");
        const redirectUrl = callbackUrl || "/portal";
        router.push(redirectUrl);
        router.refresh();
        return;
      }

      // If tenant login fails, try admin login
      const adminResult = await signIn("admin-credentials", {
        email,
        password,
        redirect: false,
      });

      if (!adminResult?.error) {
        toast.success("Welcome back!");
        const redirectUrl = callbackUrl || "/admin";
        router.push(redirectUrl);
        router.refresh();
        return;
      }

      // Both failed
      toast.error("Invalid email or password");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-2">
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <Droplets className="h-8 w-8 text-cyan-500" />
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Mechatronics</h1>
          <p className="text-gray-500 mt-2">IoT Monitoring Platform</p>
        </div>

        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Sign In</CardTitle>
            <CardDescription>
              Access your devices and dashboards
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-[#f74780] hover:bg-[#e03a6f]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <div className="text-center text-sm text-gray-500">
                <Link href="/forgot-password" className="hover:text-[#f74780] transition-colors">
                  Forgot your password?
                </Link>
              </div>
              <div className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-[#f74780] hover:text-[#e03a6f] transition-colors font-medium">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-gray-400 text-sm mt-8">
          © 2026 Mechatronics. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
