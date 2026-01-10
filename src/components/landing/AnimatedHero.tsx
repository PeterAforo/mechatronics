"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ArrowRight,
  Droplets,
  Zap,
  Thermometer,
  Wifi,
  Activity,
  Signal
} from "lucide-react";

const heroSlides = [
  {
    id: 1,
    icon: Droplets,
    title: "Water Level Monitoring",
    subtitle: "Never run out of water again",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: 2,
    icon: Zap,
    title: "Power Consumption Tracking",
    subtitle: "Reduce electricity bills by 30%",
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: 3,
    icon: Thermometer,
    title: "Temperature Control",
    subtitle: "Protect your cold storage assets",
    color: "blue",
    gradient: "from-blue-500 to-indigo-600",
  },
];

export default function AnimatedHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Initial entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Animate particles/background elements
      tl.fromTo(
        ".hero-particle",
        { opacity: 0, scale: 0 },
        { opacity: 0.6, scale: 1, duration: 1, stagger: 0.1 },
        0
      );

      // Badge animation
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.2
      );

      // Title animation - split by lines
      tl.fromTo(
        ".hero-title-line",
        { opacity: 0, y: 50, rotationX: -20 },
        { opacity: 1, y: 0, rotationX: 0, duration: 1, stagger: 0.15 },
        0.4
      );

      // Subtitle animation
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.8
      );

      // Buttons animation
      tl.fromTo(
        ".hero-button",
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 },
        1
      );

      // Features animation
      tl.fromTo(
        ".hero-feature",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1 },
        1.2
      );

      // Device mockup animation
      tl.fromTo(
        deviceRef.current,
        { opacity: 0, x: 100, rotationY: -15 },
        { opacity: 1, x: 0, rotationY: 0, duration: 1.2 },
        0.6
      );

      // Floating animation for device
      gsap.to(deviceRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Pulse animation for signal icons
      gsap.to(".signal-pulse", {
        scale: 1.2,
        opacity: 0.5,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.3,
      });

      // Data flow animation
      gsap.to(".data-dot", {
        y: -100,
        opacity: 0,
        duration: 2,
        repeat: -1,
        ease: "none",
        stagger: {
          each: 0.5,
          repeat: -1,
        },
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Slide rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animate slide change
  useEffect(() => {
    gsap.fromTo(
      ".slide-icon",
      { scale: 0.5, opacity: 0, rotation: -180 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" }
    );
    gsap.fromTo(
      ".slide-text",
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.6, delay: 0.2 }
    );
  }, [currentSlide]);

  const currentSlideData = heroSlides[currentSlide];
  const SlideIcon = currentSlideData.icon;

  return (
    <section
      ref={heroRef}
      className="pt-32 pb-20 bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 relative overflow-hidden min-h-[90vh] flex items-center"
    >
      {/* Animated Background Particles */}
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="hero-particle absolute top-20 left-[10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="hero-particle absolute top-40 right-[15%] w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="hero-particle absolute bottom-20 left-[20%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Floating tech icons */}
        <div className="hero-particle absolute top-32 left-[5%] text-white/20">
          <Wifi className="w-8 h-8 signal-pulse" />
        </div>
        <div className="hero-particle absolute top-48 right-[8%] text-white/20">
          <Activity className="w-10 h-10 signal-pulse" />
        </div>
        <div className="hero-particle absolute bottom-32 left-[12%] text-white/20">
          <Signal className="w-6 h-6 signal-pulse" />
        </div>
        <div className="hero-particle absolute bottom-48 right-[18%] text-white/20">
          <Wifi className="w-12 h-12 signal-pulse" />
        </div>

        {/* Data flow dots */}
        <div className="absolute left-1/4 bottom-0">
          <div className="data-dot w-2 h-2 bg-cyan-400/60 rounded-full absolute" />
          <div className="data-dot w-2 h-2 bg-cyan-400/60 rounded-full absolute" style={{ left: 20 }} />
          <div className="data-dot w-2 h-2 bg-cyan-400/60 rounded-full absolute" style={{ left: 40 }} />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div ref={badgeRef}>
              <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-4 py-1.5 backdrop-blur-sm">
                IoT Monitoring Solutions for Africa
              </Badge>
            </div>

            <h1 ref={titleRef} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="hero-title-line block">Smart Monitoring for</span>
              <span className="hero-title-line block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">
                Water, Power & Temperature
              </span>
            </h1>

            <p ref={subtitleRef} className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
              Professional IoT devices that monitor your water tanks, power consumption, and coldroom temperatures. 
              Get real-time alerts via SMS, email, and push notifications.
            </p>

            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="#products" className="hero-button">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 rounded-lg px-8 py-6 text-lg font-semibold transition-all hover:scale-105 w-full sm:w-auto">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register" className="hero-button">
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-lg px-8 py-6 text-lg w-full sm:w-auto backdrop-blur-sm">
                  Create Free Account
                </Button>
              </Link>
            </div>

            <div ref={featuresRef} className="flex flex-wrap gap-6 text-white/80">
              <span className="hero-feature flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400" />
                One-time setup fee
              </span>
              <span className="hero-feature flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400" />
                Low monthly subscription
              </span>
              <span className="hero-feature flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400" />
                Professional installation
              </span>
            </div>
          </div>

          {/* Right Content - Animated Device Mockup */}
          <div ref={deviceRef} className="hidden lg:block">
            <div className="relative">
              {/* Main device card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                {/* Device header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${currentSlideData.gradient} slide-icon`}>
                      <SlideIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="slide-text">
                      <h3 className="text-white font-semibold text-lg">{currentSlideData.title}</h3>
                      <p className="text-white/70 text-sm">{currentSlideData.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm font-medium">Live</span>
                  </div>
                </div>

                {/* Animated chart/graph area */}
                <div className="bg-white/5 rounded-2xl p-6 mb-6">
                  <div className="flex items-end justify-between h-32 gap-2">
                    {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50, 88].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-cyan-500/80 to-cyan-300/80 rounded-t-sm transition-all duration-500"
                        style={{ 
                          height: `${height}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 text-white/50 text-xs">
                    <span>12:00</span>
                    <span>Now</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Current", value: "78%", trend: "+2%" },
                    { label: "Average", value: "72%", trend: "+5%" },
                    { label: "Alerts", value: "0", trend: "Clear" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-white/60 text-xs mb-1">{stat.label}</p>
                      <p className="text-white text-2xl font-bold">{stat.value}</p>
                      <p className="text-green-400 text-xs">{stat.trend}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating notification cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-xl animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Tank Full</p>
                    <p className="text-gray-500 text-xs">Just now</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Power Normal</p>
                    <p className="text-gray-500 text-xs">2.4 kWh today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-8 bg-white" : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
