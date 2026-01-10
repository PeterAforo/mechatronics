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
  X
} from "lucide-react";
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
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 transition-all hover:scale-105">
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
      <section id="products" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Monitoring Solutions
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Choose from our range of IoT monitoring devices designed for homes, farms, hospitals, and industries
            </p>
          </AnimatedSection>

          {products.length > 0 ? (
            <AnimatedStagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {products.map((product) => {
                const colors = categoryColors[product.category] || categoryColors.other;
                const Icon = categoryIcons[product.category] || Factory;
                
                return (
                  <Card key={product.id} className="stagger-item bg-white border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-8 w-8 ${colors.text}`} />
                        </div>
                        <Badge variant="secondary" className="capitalize bg-gray-100">
                          {product.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-gray-900">{product.name}</CardTitle>
                      <CardDescription className="text-gray-500">
                        {product.shortDescription || product.description?.slice(0, 100)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Setup Fee</span>
                          <span className="text-gray-900 font-semibold">
                            {product.currency} {Number(product.setupFee).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Monthly</span>
                          <span className="text-indigo-600 font-semibold">
                            {product.currency} {Number(product.monthlyFee).toFixed(2)}/mo
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Link href={`/products/${product.productCode}`} className="w-full">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all group-hover:scale-[1.02]">
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
            <AnimatedSection animation="scale" className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="p-4 bg-gray-100 rounded-xl inline-block mb-4">
                <Factory className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Products Coming Soon</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Our product catalog is being prepared. Register now to be notified when products are available.
              </p>
              <Link href="/register">
                <Button className="bg-indigo-600 hover:bg-indigo-700 transition-colors">
                  Get Notified
                </Button>
              </Link>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-500">
              Get started in 3 simple steps
            </p>
          </AnimatedSection>

          <AnimatedStagger className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Choose a Product", desc: "Select the monitoring solution that fits your needs - water, power, or temperature" },
              { step: "2", title: "We Install It", desc: "Our technicians will professionally install the device at your location" },
              { step: "3", title: "Monitor & Get Alerts", desc: "Access your dashboard and receive real-time alerts on your phone" },
            ].map((item, idx) => (
              <div key={idx} className="stagger-item text-center group">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </AnimatedStagger>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Who Uses Our Solutions?
            </h2>
          </AnimatedSection>

          <AnimatedStagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Droplets, title: "Homes & Apartments", desc: "Monitor water tank levels and never run out of water" },
              { icon: Zap, title: "Businesses", desc: "Track power consumption and reduce electricity bills" },
              { icon: Thermometer, title: "Restaurants & Pharmacies", desc: "Monitor coldroom temperatures and prevent spoilage" },
              { icon: Factory, title: "Farms & Industries", desc: "Industrial-grade monitoring for large-scale operations" },
            ].map((item, idx) => (
              <Card key={idx} className="stagger-item bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="h-7 w-7 text-indigo-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </AnimatedStagger>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="scale">
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Ready to Start Monitoring?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Create your free account today and browse our products. Our team will help you choose the right solution.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 rounded-lg px-8 py-6 text-lg font-semibold transition-all hover:scale-105">
                      Create Free Account
                    </Button>
                  </Link>
                  <button onClick={() => scrollToSection("products")}>
                    <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-lg px-8 py-6 text-lg">
                      View Products
                    </Button>
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  <div className="p-1 bg-cyan-500/20 rounded">
                    <Droplets className="h-3 w-3 text-cyan-500" />
                  </div>
                  <div className="p-1 bg-yellow-500/20 rounded">
                    <Zap className="h-3 w-3 text-yellow-500" />
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">Mechatronics</span>
              </Link>
              <p className="text-gray-500 text-sm">
                Professional IoT monitoring solutions for water, power, and temperature. Made in Ghana for Africa.
              </p>
            </div>

            {/* Products */}
            <div>
              <h6 className="font-bold text-gray-900 mb-4">Products</h6>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection("products")} className="text-gray-500 hover:text-indigo-600">Water Monitors</button></li>
                <li><button onClick={() => scrollToSection("products")} className="text-gray-500 hover:text-indigo-600">Power Monitors</button></li>
                <li><button onClick={() => scrollToSection("products")} className="text-gray-500 hover:text-indigo-600">Temperature Monitors</button></li>
                <li><button onClick={() => scrollToSection("products")} className="text-gray-500 hover:text-indigo-600">All Products</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h6 className="font-bold text-gray-900 mb-4">Support</h6>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-gray-500 hover:text-indigo-600">Customer Portal</Link></li>
                <li><button onClick={() => scrollToSection("how-it-works")} className="text-gray-500 hover:text-indigo-600">How It Works</button></li>
                <li><Link href="/contact" className="text-gray-500 hover:text-indigo-600">Contact Us</Link></li>
                <li><Link href="/faq" className="text-gray-500 hover:text-indigo-600">FAQs</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h6 className="font-bold text-gray-900 mb-4">Contact</h6>
              <ul className="space-y-3 text-gray-500 text-sm">
                <li>Accra, Ghana</li>
                <li>info@mechatronics.com.gh</li>
                <li>+233 XX XXX XXXX</li>
              </ul>
              <div className="flex gap-3 mt-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 mb-8" />

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Mechatronics. All Rights Reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-gray-500 hover:text-indigo-600">Terms of Service</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-indigo-600">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
