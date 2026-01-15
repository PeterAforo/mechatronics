import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductsList from "./ProductsList";

export default async function ProductsPage() {
  const products = await prisma.deviceProduct.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedProducts = products.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    productCode: p.productCode,
    category: p.category,
    currency: p.currency,
    setupFee: Number(p.setupFee),
    monthlyFee: Number(p.monthlyFee),
    isPublished: p.isPublished,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <ProductsList products={serializedProducts} />
    </main>
  );
}
