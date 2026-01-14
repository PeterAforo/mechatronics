import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronRight, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function ProductsPage() {
  const products = await prisma.deviceProduct.findMany({
    orderBy: { createdAt: "desc" },
  });

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

      {products.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {products.map((product) => (
            <Link
              key={product.id.toString()}
              href={`/admin/products/${product.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-3"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.productCode} • {product.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 ml-11 sm:ml-0">
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-gray-900">
                    {product.currency} {Number(product.setupFee).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    + {product.currency} {Number(product.monthlyFee).toFixed(2)}/mo
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    product.isPublished
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-gray-200 bg-gray-50 text-gray-600"
                  }
                >
                  {product.isPublished ? "Published" : "Draft"}
                </Badge>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No products yet</h3>
          <p className="text-gray-500 mb-4">Create your first product to get started</p>
          <Link href="/admin/products/new">
            <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
