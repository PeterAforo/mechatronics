import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Check, Droplets, Zap, Thermometer, Shield, Factory, Heart,
  ShoppingCart
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

const categoryColors: Record<string, { bg: string; text: string }> = {
  water: { bg: "bg-cyan-500/10", text: "text-cyan-600" },
  power: { bg: "bg-yellow-500/10", text: "text-yellow-600" },
  environment: { bg: "bg-blue-500/10", text: "text-blue-600" },
  security: { bg: "bg-red-500/10", text: "text-red-600" },
  industrial: { bg: "bg-orange-500/10", text: "text-orange-600" },
  healthcare: { bg: "bg-pink-500/10", text: "text-pink-600" },
  other: { bg: "bg-gray-500/10", text: "text-gray-600" },
};

export default async function ProductDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  
  const product = await prisma.deviceProduct.findUnique({
    where: { productCode: code },
    include: { deviceType: true },
  });

  if (!product || !product.isPublished) {
    notFound();
  }

  const Icon = categoryIcons[product.category] || Factory;
  const colors = categoryColors[product.category] || categoryColors.other;

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

      <main className="container mx-auto px-4 pt-28 pb-16">
        <Link href="/#products" className="inline-flex items-center text-gray-500 hover:text-[#f74780] mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image/Icon */}
          <div className="bg-gray-50 rounded-2xl p-12 flex items-center justify-center border border-gray-200">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-96 object-contain" />
            ) : (
              <div className={`p-8 ${colors.bg} rounded-3xl`}>
                <Icon className={`h-32 w-32 ${colors.text}`} />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <Badge className="mb-4 capitalize bg-gray-100 text-gray-700 border-gray-200">
              {product.category}
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-lg text-gray-500 mb-8">
              {product.shortDescription}
            </p>

            {/* Pricing */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {product.currency} {Number(product.setupFee).toFixed(2)}
                </span>
                <span className="text-gray-500">one-time setup</span>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-semibold text-[#f74780]">
                  {product.currency} {Number(product.monthlyFee).toFixed(2)}
                </span>
                <span className="text-gray-500">/ month</span>
              </div>
              
              <Link href={`/register?product=${product.productCode}`}>
                <Button size="lg" className="w-full bg-[#f74780] hover:bg-[#e03a6f]">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Order Now
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s Included</h3>
              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500/10 rounded">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-600">Professional installation by our technicians</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500/10 rounded">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-600">Real-time monitoring dashboard</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500/10 rounded">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-600">SMS, email, and push notifications</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500/10 rounded">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-600">24/7 technical support</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500/10 rounded">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-600">Historical data and analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <div className="mt-12 bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
          </div>
        )}

        {/* Device Type Info */}
        {product.deviceType && (
          <div className="mt-8 bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-500 text-sm">Device Model</p>
                <p className="text-gray-900 font-medium">{product.deviceType.typeCode}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Manufacturer</p>
                <p className="text-gray-900 font-medium">{product.deviceType.manufacturer || "Mechatronics"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Communication</p>
                <p className="text-gray-900 font-medium capitalize">{product.deviceType.communicationProtocol}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Category</p>
                <p className="text-gray-900 font-medium capitalize">{product.deviceType.category}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Mechatronics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
