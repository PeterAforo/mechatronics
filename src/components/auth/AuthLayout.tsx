"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Droplets, Zap, Thermometer, Activity, Shield, BarChart3 } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const features = [
  { icon: Activity, text: "Real-time Monitoring", delay: 0.2 },
  { icon: Shield, text: "Enterprise Security", delay: 0.4 },
  { icon: BarChart3, text: "Advanced Analytics", delay: 0.6 },
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gradient animation
      gsap.to(gradientRef.current, {
        backgroundPosition: "200% 200%",
        duration: 15,
        repeat: -1,
        ease: "none",
      });

      // Title animation with split text effect
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 60, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power4.out" }
        );
      }

      // Subtitle animation
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" }
        );
      }

      // Features stagger animation
      if (featuresRef.current) {
        gsap.fromTo(
          featuresRef.current.children,
          { opacity: 0, x: -30 },
          { 
            opacity: 1, 
            x: 0, 
            duration: 0.8, 
            stagger: 0.2, 
            delay: 0.6,
            ease: "power2.out" 
          }
        );
      }

      // Floating particles animation
      if (particlesRef.current) {
        const particles = particlesRef.current.children;
        Array.from(particles).forEach((particle, i) => {
          gsap.to(particle, {
            y: "random(-20, 20)",
            x: "random(-10, 10)",
            rotation: "random(-15, 15)",
            duration: "random(3, 5)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.2,
          });
        });
      }

      // Continuous glow pulse
      gsap.to(".glow-orb", {
        scale: 1.2,
        opacity: 0.6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form Container (30%) */}
      <div className="w-full lg:w-[30%] min-h-screen flex flex-col bg-white relative z-10">
        {/* Logo */}
        <div className="p-6 lg:p-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex gap-1.5">
              <div className="p-2 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-shadow">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="p-2 bg-gradient-to-br from-rose-400 to-pink-600 rounded-lg shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/40 transition-shadow">
                <Thermometer className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
              MECHATRONICS
            </span>
          </Link>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-10 py-8">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 lg:p-8 text-center">
          <p className="text-xs text-gray-400">
            © 2026 Mechatronics Ghana Ltd. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Hero Section (70%) */}
      <div 
        ref={heroRef}
        className="hidden lg:flex lg:w-[70%] relative overflow-hidden"
      >
        {/* Animated Gradient Background */}
        <div 
          ref={gradientRef}
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                135deg,
                #0f172a 0%,
                #1e1b4b 25%,
                #312e81 50%,
                #1e1b4b 75%,
                #0f172a 100%
              )
            `,
            backgroundSize: "400% 400%",
          }}
        />

        {/* Mesh Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 40% 60%, rgba(6, 182, 212, 0.2) 0%, transparent 40%)
            `,
          }}
        />

        {/* Floating Particles */}
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-3 h-3 bg-cyan-400/30 rounded-full blur-sm" />
          <div className="absolute top-[25%] right-[20%] w-4 h-4 bg-pink-400/30 rounded-full blur-sm" />
          <div className="absolute top-[60%] left-[25%] w-2 h-2 bg-indigo-400/40 rounded-full blur-sm" />
          <div className="absolute top-[40%] right-[30%] w-5 h-5 bg-amber-400/20 rounded-full blur-sm" />
          <div className="absolute bottom-[20%] left-[40%] w-3 h-3 bg-emerald-400/30 rounded-full blur-sm" />
          <div className="absolute bottom-[35%] right-[15%] w-4 h-4 bg-violet-400/25 rounded-full blur-sm" />
        </div>

        {/* Glow Orbs */}
        <div className="glow-orb absolute top-[20%] left-[30%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="glow-orb absolute bottom-[20%] right-[20%] w-80 h-80 bg-pink-500/15 rounded-full blur-3xl" />
        <div className="glow-orb absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          {/* Main Title */}
          <h1 
            ref={titleRef}
            className="text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white leading-tight mb-6"
          >
            <span className="block">{title}</span>
            <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              {subtitle}
            </span>
          </h1>

          {/* Description */}
          <p 
            ref={subtitleRef}
            className="text-lg xl:text-xl text-gray-300 max-w-lg mb-12 leading-relaxed"
          >
            Transform your operations with intelligent IoT monitoring. 
            Real-time insights for water, power, and temperature systems 
            across your entire infrastructure.
          </p>

          {/* Features */}
          <div ref={featuresRef} className="space-y-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 group"
              >
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 group-hover:bg-white/20 group-hover:border-white/20 transition-all duration-300">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-white/90 font-medium text-lg">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 flex gap-12">
            <div>
              <p className="text-4xl font-bold text-white">500+</p>
              <p className="text-gray-400 mt-1">Active Devices</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">99.9%</p>
              <p className="text-gray-400 mt-1">Uptime</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">24/7</p>
              <p className="text-gray-400 mt-1">Monitoring</p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-20">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="url(#grad1)" strokeWidth="0.3" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="url(#grad1)" strokeWidth="0.2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
