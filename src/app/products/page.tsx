import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WebsiteLayout, PageHeader } from "@/components/website";
import { 
  Droplets, Zap, Thermometer, Shield, Factory, Heart, ArrowRight
} from "lucide-react";

// Force dynamic rendering - database queries can't run at build time
export const dynamic = "force-dynamic";

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

export default async function ProductsPage() {
  const products = await prisma.deviceProduct.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: { deviceType: true },
  });

  return (
    <WebsiteLayout>
      <PageHeader
        title="Our Products"
        subtitle="Smart IoT monitoring solutions for water, power, and temperature"
        breadcrumbs={[{ label: "Products" }]}
        backgroundImage="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=600&fit=crop"
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const Icon = categoryIcons[product.category] || Factory;
              const colors = categoryColors[product.category] || categoryColors.other;

              return (
                <div
                  key={product.id.toString()}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`h-48 ${colors.bg} flex items-center justify-center`}>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <Icon className={`h-20 w-20 ${colors.text} group-hover:scale-110 transition-transform`} />
                    )}
                  </div>
                  <div className="p-6">
                    <Badge className="mb-3 capitalize bg-gray-100 text-gray-700 border-gray-200">
                      {product.category}
                    </Badge>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-[#f74780]">
                        {product.currency} {Number(product.monthlyFee).toFixed(0)}
                      </span>
                      <span className="text-gray-500 text-sm">/month</span>
                    </div>
                    <Link href={`/products/${product.productCode}`}>
                      <Button className="w-full bg-[#f74780] hover:bg-[#e03a6f]">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="text-center py-16">
              <Factory className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-500">Check back soon for new products.</p>
            </div>
          )}
        </div>
      </section>
    </WebsiteLayout>
  );
}
