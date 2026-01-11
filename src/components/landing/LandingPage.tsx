"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowRight,
  Droplets,
  Zap,
  Thermometer,
  Shield,
  Factory,
  Heart,
  Bell,
  BarChart3,
  Smartphone,
  Clock,
  Menu,
  X,
  Eye,
  Mail,
  Send,
  Linkedin
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedHero from "./AnimatedHero";
import { AnimatedSection, AnimatedStagger } from "./AnimatedSections";

gsap.registerPlugin(ScrollTrigger);

interface Product {
  id: string;
  name: string;
  productCode: string;
  category: string;
  shortDescription: string | null;
  description: string | null;
  currency: string;
  setupFee: number;
  monthlyFee: number;
}

const categoryIcons: Record<string, React.ElementType> = {
  water: Droplets,
  power: Zap,
  environment: Thermometer,
  security: Shield,
  industrial: Factory,
  healthcare: Heart,
  other: Factory,
};

const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
  water: { bg: "bg-cyan-50", text: "text-cyan-600", gradient: "from-cyan-50 to-white" },
  power: { bg: "bg-amber-50", text: "text-amber-600", gradient: "from-amber-50 to-white" },
  environment: { bg: "bg-blue-50", text: "text-blue-600", gradient: "from-blue-50 to-white" },
  security: { bg: "bg-red-50", text: "text-red-600", gradient: "from-red-50 to-white" },
  industrial: { bg: "bg-orange-50", text: "text-orange-600", gradient: "from-orange-50 to-white" },
  healthcare: { bg: "bg-pink-50", text: "text-pink-600", gradient: "from-pink-50 to-white" },
  other: { bg: "bg-gray-50", text: "text-gray-600", gradient: "from-gray-50 to-white" },
};

export default function LandingPage({ products }: { products: Product[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Thanks for subscribing!");
        setEmail("");
      } else {
        toast.error(data.error || "Failed to subscribe");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm" : "bg-transparent"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                  <Droplets className="h-4 w-4 text-cyan-500" />
                </div>
                <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                  <Zap className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
              <span className={`text-2xl font-bold transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>
                Mechatronics
              </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection("products")} 
                className={`font-medium transition-colors ${scrolled ? "text-gray-700 hover:text-indigo-600" : "text-white/90 hover:text-white"}`}
              >
                Products
              </button>
              <button 
                onClick={() => scrollToSection("features")} 
                className={`font-medium transition-colors ${scrolled ? "text-gray-700 hover:text-indigo-600" : "text-white/90 hover:text-white"}`}
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection("how-it-works")} 
                className={`font-medium transition-colors ${scrolled ? "text-gray-700 hover:text-indigo-600" : "text-white/90 hover:text-white"}`}
              >
                How It Works
              </button>
              <Link 
                href="/about" 
                className={`font-medium transition-colors ${scrolled ? "text-gray-700 hover:text-indigo-600" : "text-white/90 hover:text-white"}`}
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className={`font-medium transition-colors ${scrolled ? "text-gray-700 hover:text-indigo-600" : "text-white/90 hover:text-white"}`}
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className={`font-medium hidden sm:block transition-colors ${scrolled ? "text-gray-700 hover:text-indigo-600" : "text-white/90 hover:text-white"}`}
              >
                Sign in
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg px-6 transition-all hover:scale-105 shadow-lg">
                  Get Started
                </Button>
              </Link>
              <button 
                className="lg:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className={`h-6 w-6 ${scrolled ? "text-gray-900" : "text-white"}`} />
                ) : (
                  <Menu className={`h-6 w-6 ${scrolled ? "text-gray-900" : "text-white"}`} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-100 py-4">
              <nav className="flex flex-col gap-4">
                <button onClick={() => scrollToSection("products")} className="text-gray-700 hover:text-indigo-600 font-medium py-2">
                  Products
                </button>
                <button onClick={() => scrollToSection("features")} className="text-gray-700 hover:text-indigo-600 font-medium py-2">
                  Features
                </button>
                <button onClick={() => scrollToSection("how-it-works")} className="text-gray-700 hover:text-indigo-600 font-medium py-2">
                  How It Works
                </button>
                <Link href="/about" className="text-gray-700 hover:text-indigo-600 font-medium py-2">
                  About Us
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-indigo-600 font-medium py-2">
                  Contact
                </Link>
                <Link href="/login" className="text-gray-700 hover:text-indigo-600 font-medium py-2">
                  Sign in
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Animated Hero Section */}
      <AnimatedHero />

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Mechatronics?
            </h2>
            <p className="text-xl text-gray-500">
              Complete IoT monitoring solutions for homes, businesses, and industries
            </p>
          </AnimatedSection>

          <AnimatedStagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Bell, title: "Real-time Alerts", desc: "Get instant SMS, email, and push notifications when something needs attention" },
              { icon: BarChart3, title: "Live Dashboard", desc: "Monitor all your devices from a single, easy-to-use dashboard" },
              { icon: Smartphone, title: "Mobile Access", desc: "Check your water levels, power usage, and temperatures from anywhere" },
              { icon: Clock, title: "24/7 Monitoring", desc: "Our devices work around the clock, even when you're asleep" },
            ].map((feature, idx) => (
              <div key={idx} className="stagger-item text-center group">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute w-20 h-20 bg-indigo-100 rounded-full transform group-hover:scale-110 transition-transform duration-300"></div>
                  <feature.icon className="h-12 w-12 text-indigo-600 relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </AnimatedStagger>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Our Monitoring Solutions
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose from our range of IoT monitoring devices designed for homes, farms, hospitals, and industries
            </p>
          </AnimatedSection>

          {products.length > 0 ? (
            <AnimatedStagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {products.map((product) => {
                const colors = categoryColors[product.category] || categoryColors.other;
                const Icon = categoryIcons[product.category] || Factory;
                
                return (
                  <Card key={product.id} className="stagger-item bg-white/95 backdrop-blur-sm border-0 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 overflow-hidden group hover:-translate-y-2">
                    <CardHeader className="pb-2 pt-8 text-center">
                      {/* Centered large icon */}
                      <div className="flex justify-center mb-6">
                        <div className={`p-6 rounded-2xl ${colors.bg} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                          <Icon className={`h-12 w-12 ${colors.text}`} />
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize bg-gray-100 mx-auto mb-3">
                        {product.category}
                      </Badge>
                      <CardTitle className="text-xl text-gray-900">{product.name}</CardTitle>
                      <CardDescription className="text-gray-500 mt-2">
                        {product.shortDescription || product.description?.slice(0, 100)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Setup Fee</span>
                          <span className="text-gray-900 font-bold text-lg">
                            {product.currency} {Number(product.setupFee).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Monthly</span>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 font-bold text-lg">
                            {product.currency} {Number(product.monthlyFee).toFixed(2)}/mo
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-6">
                      <Link href={`/products/${product.productCode}`} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 group-hover:scale-[1.02] shadow-lg hover:shadow-xl py-6">
                          <Eye className="mr-2 h-5 w-5" />
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </AnimatedStagger>
          ) : (
            <AnimatedSection animation="scale" className="text-center py-16 bg-white/95 backdrop-blur-sm rounded-2xl">
              <div className="p-4 bg-gray-100 rounded-xl inline-block mb-4">
                <Factory className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Products Coming Soon</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Our product catalog is being prepared. Register now to be notified when products are available.
              </p>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold">
                  Get Notified
                </Button>
              </Link>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-500">
              Get started in 3 simple steps
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left side - Image */}
            <AnimatedSection animation="slideLeft" className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop"
                  alt="IoT Device Installation"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium opacity-80">Professional Installation</p>
                  <p className="text-xl font-bold">By Certified Technicians</p>
                </div>
              </div>
            </AnimatedSection>

            {/* Right side - Steps */}
            <AnimatedStagger className="space-y-8">
              {[
                { step: "1", title: "Choose a Product", desc: "Select the monitoring solution that fits your needs - water, power, or temperature", icon: "🛒" },
                { step: "2", title: "We Install It", desc: "Our technicians will professionally install the device at your location", icon: "🔧" },
                { step: "3", title: "Monitor & Get Alerts", desc: "Access your dashboard and receive real-time alerts on your phone", icon: "📱" },
              ].map((item, idx) => (
                <div key={idx} className="stagger-item flex gap-6 group">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </AnimatedStagger>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Who Uses Our Solutions?
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              From homes to industries, our IoT solutions serve diverse needs
            </p>
          </AnimatedSection>

          <AnimatedStagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Droplets, title: "Homes & Apartments", desc: "Monitor water tank levels and never run out of water", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop" },
              { icon: Zap, title: "Businesses", desc: "Track power consumption and reduce electricity bills", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop" },
              { icon: Thermometer, title: "Restaurants & Pharmacies", desc: "Monitor coldroom temperatures and prevent spoilage", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop" },
              { icon: Factory, title: "Farms & Industries", desc: "Industrial-grade monitoring for large-scale operations", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop" },
            ].map((item, idx) => (
              <Card key={idx} className="stagger-item bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden hover:-translate-y-2">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </AnimatedStagger>
        </div>
      </section>

      {/* CTA Banner with Image */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="scale">
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 rounded-3xl overflow-hidden relative">
              <div className="grid lg:grid-cols-2 items-center">
                <div className="p-12 md:p-16 text-center lg:text-left relative z-10">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Ready to Start Monitoring?
                  </h2>
                  <p className="text-xl text-white/90 mb-8 max-w-xl">
                    Create your free account today and browse our products. Our team will help you choose the right solution.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link href="/register">
                      <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 rounded-lg px-8 py-6 text-lg font-semibold transition-all hover:scale-105 shadow-xl">
                        Create Free Account
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <button onClick={() => scrollToSection("products")}>
                      <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-lg px-8 py-6 text-lg">
                        View Products
                      </Button>
                    </button>
                  </div>
                </div>
                <div className="hidden lg:block relative h-full min-h-[400px]">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
                    alt="Dashboard Analytics"
                    width={600}
                    height={400}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-transparent" />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/20 rounded-2xl mb-6">
                <Mail className="h-8 w-8 text-indigo-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Stay Updated
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Subscribe to our newsletter for the latest updates, tips, and exclusive offers on IoT monitoring solutions.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-14 px-6 rounded-xl focus:ring-2 focus:ring-indigo-400"
                  required
                />
                <Button 
                  type="submit"
                  disabled={subscribing}
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold h-14 px-8 rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  {subscribing ? "Subscribing..." : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Subscribe
                    </>
                  )}
                </Button>
              </form>
              <p className="text-sm text-gray-400 mt-4">
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                    <Droplets className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                    <Zap className="h-4 w-4 text-yellow-400" />
                  </div>
                </div>
                <span className="text-xl font-bold text-white">Mechatronics</span>
              </Link>
              <p className="text-gray-400 text-sm mb-6 max-w-sm">
                Professional IoT monitoring solutions for water, power, and temperature. Made in Ghana for Africa.
              </p>
              <div className="flex gap-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h6 className="font-bold text-white mb-4">Products</h6>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection("products")} className="text-gray-400 hover:text-indigo-400 transition-colors">Water Monitors</button></li>
                <li><button onClick={() => scrollToSection("products")} className="text-gray-400 hover:text-indigo-400 transition-colors">Power Monitors</button></li>
                <li><button onClick={() => scrollToSection("products")} className="text-gray-400 hover:text-indigo-400 transition-colors">Temperature Monitors</button></li>
                <li><button onClick={() => scrollToSection("products")} className="text-gray-400 hover:text-indigo-400 transition-colors">All Products</button></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h6 className="font-bold text-white mb-4">Company</h6>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-indigo-400 transition-colors">About Us</Link></li>
                <li><button onClick={() => scrollToSection("how-it-works")} className="text-gray-400 hover:text-indigo-400 transition-colors">How It Works</button></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-indigo-400 transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-indigo-400 transition-colors">FAQs</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h6 className="font-bold text-white mb-4">Support</h6>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-gray-400 hover:text-indigo-400 transition-colors">Customer Portal</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              </ul>
              <div className="mt-6">
                <p className="text-gray-400 text-sm">
                  <span className="block text-white font-medium mb-1">Contact</span>
                  info@mechatronics.com.gh<br />
                  +233 XX XXX XXXX
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-800 mb-8" />

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Mechatronics. All Rights Reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Made with ❤️ in Ghana 🇬🇭
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
