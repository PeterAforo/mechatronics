import Link from "next/link";
import prisma from "@/lib/prisma";
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
  Clock
} from "lucide-react";

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
  water: { bg: "bg-cyan-500/20", text: "text-cyan-500", gradient: "from-cyan-900/20 to-slate-900" },
  power: { bg: "bg-yellow-500/20", text: "text-yellow-500", gradient: "from-yellow-900/20 to-slate-900" },
  environment: { bg: "bg-blue-500/20", text: "text-blue-500", gradient: "from-blue-900/20 to-slate-900" },
  security: { bg: "bg-red-500/20", text: "text-red-500", gradient: "from-red-900/20 to-slate-900" },
  industrial: { bg: "bg-orange-500/20", text: "text-orange-500", gradient: "from-orange-900/20 to-slate-900" },
  healthcare: { bg: "bg-pink-500/20", text: "text-pink-500", gradient: "from-pink-900/20 to-slate-900" },
  other: { bg: "bg-gray-500/20", text: "text-gray-500", gradient: "from-gray-900/20 to-slate-900" },
};

export default async function Home() {
  // Fetch published products from database
  const products = await prisma.deviceProduct.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
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
              <span className="text-2xl font-bold text-gray-900">Mechatronics</span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="#products" className="text-gray-700 hover:text-[#f74780] font-medium">Products</Link>
              <Link href="#features" className="text-gray-700 hover:text-[#f74780] font-medium">Features</Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-[#f74780] font-medium">How It Works</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-700 hover:text-[#f74780] font-medium hidden sm:block">
                Sign in
              </Link>
              <Link href="/register">
                <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white rounded-lg px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#6a3093] via-[#a044ff] to-[#6a3093] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-4 py-1">
              IoT Monitoring Solutions for Africa
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Smart Monitoring for<br />
              <span className="text-[#f74780]">Water, Power & Temperature</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Professional IoT devices that monitor your water tanks, power consumption, and coldroom temperatures. 
              Get real-time alerts via SMS, email, and push notifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#products">
                <Button size="lg" className="bg-[#f74780] hover:bg-[#e03a6f] text-white rounded-lg px-8 py-6 text-lg">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-lg px-8 py-6 text-lg">
                  Create Free Account
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/80">
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400" />
                One-time setup fee
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400" />
                Low monthly subscription
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400" />
                Professional installation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Mechatronics?
            </h2>
            <p className="text-xl text-gray-500">
              Complete IoT monitoring solutions for homes, businesses, and industries
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Bell, title: "Real-time Alerts", desc: "Get instant SMS, email, and push notifications when something needs attention" },
              { icon: BarChart3, title: "Live Dashboard", desc: "Monitor all your devices from a single, easy-to-use dashboard" },
              { icon: Smartphone, title: "Mobile Access", desc: "Check your water levels, power usage, and temperatures from anywhere" },
              { icon: Clock, title: "24/7 Monitoring", desc: "Our devices work around the clock, even when you're asleep" },
            ].map((feature, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute w-20 h-20 bg-[#f74780]/10 rounded-full transform group-hover:scale-110 transition-transform"></div>
                  <feature.icon className="h-12 w-12 text-[#f74780] relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Monitoring Solutions
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Choose from our range of IoT monitoring devices designed for homes, farms, hospitals, and industries
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {products.map((product) => {
                const colors = categoryColors[product.category] || categoryColors.other;
                const Icon = categoryIcons[product.category] || Factory;
                
                return (
                  <Card key={product.id.toString()} className="bg-white border-gray-200 hover:shadow-xl transition-all overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${colors.bg}`}>
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
                          <span className="text-[#f74780] font-semibold">
                            {product.currency} {Number(product.monthlyFee).toFixed(2)}/mo
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Link href={`/products/${product.productCode}`} className="w-full">
                        <Button className="w-full bg-[#f74780] hover:bg-[#e03a6f]">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="p-4 bg-gray-100 rounded-xl inline-block mb-4">
                <Factory className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Products Coming Soon</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Our product catalog is being prepared. Register now to be notified when products are available.
              </p>
              <Link href="/register">
                <Button className="bg-[#f74780] hover:bg-[#e03a6f]">
                  Get Notified
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-500">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Choose a Product", desc: "Select the monitoring solution that fits your needs - water, power, or temperature" },
              { step: "2", title: "We Install It", desc: "Our technicians will professionally install the device at your location" },
              { step: "3", title: "Monitor & Get Alerts", desc: "Access your dashboard and receive real-time alerts on your phone" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-[#f74780] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Who Uses Our Solutions?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Droplets, title: "Homes & Apartments", desc: "Monitor water tank levels and never run out of water" },
              { icon: Zap, title: "Businesses", desc: "Track power consumption and reduce electricity bills" },
              { icon: Thermometer, title: "Restaurants & Pharmacies", desc: "Monitor coldroom temperatures and prevent spoilage" },
              { icon: Factory, title: "Farms & Industries", desc: "Industrial-grade monitoring for large-scale operations" },
            ].map((item, idx) => (
              <Card key={idx} className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#f74780]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-7 w-7 text-[#f74780]" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#6a3093] via-[#a044ff] to-[#6a3093] rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ready to Start Monitoring?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Create your free account today and browse our products. Our team will help you choose the right solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-[#f74780] hover:bg-[#e03a6f] text-white rounded-lg px-8 py-6 text-lg">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="#products">
                  <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-lg px-8 py-6 text-lg">
                    View Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
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
                <li><Link href="#products" className="text-gray-500 hover:text-[#f74780]">Water Monitors</Link></li>
                <li><Link href="#products" className="text-gray-500 hover:text-[#f74780]">Power Monitors</Link></li>
                <li><Link href="#products" className="text-gray-500 hover:text-[#f74780]">Temperature Monitors</Link></li>
                <li><Link href="#products" className="text-gray-500 hover:text-[#f74780]">All Products</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h6 className="font-bold text-gray-900 mb-4">Support</h6>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-gray-500 hover:text-[#f74780]">Customer Portal</Link></li>
                <li><Link href="#how-it-works" className="text-gray-500 hover:text-[#f74780]">How It Works</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-[#f74780]">Contact Us</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-[#f74780]">FAQs</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h6 className="font-bold text-gray-900 mb-4">Contact</h6>
              <ul className="space-y-3 text-gray-500 text-sm">
                <li>Accra, Ghana</li>
                <li>info@mechatronics.com</li>
                <li>+233 XX XXX XXXX</li>
              </ul>
              <div className="flex gap-3 mt-4">
                <Link href="#" className="text-gray-400 hover:text-[#f74780]">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[#f74780]">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[#f74780]">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[#f74780]">
                  <Youtube className="h-5 w-5" />
                </Link>
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
              <Link href="#" className="text-gray-500 hover:text-[#f74780]">Terms of Service</Link>
              <Link href="#" className="text-gray-500 hover:text-[#f74780]">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
