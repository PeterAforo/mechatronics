"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, ChevronRight, Plus } from "lucide-react";
import BulkDeleteTable from "@/components/admin/BulkDeleteTable";

interface Product {
  id: string;
  name: string;
  productCode: string;
  category: string;
  currency: string;
  setupFee: number;
  monthlyFee: number;
  isPublished: boolean;
}

interface ProductsListProps {
  products: Product[];
}

export default function ProductsList({ products }: ProductsListProps) {
  return (
    <BulkDeleteTable
      items={products}
      deleteEndpoint="/api/admin/products/bulk-delete"
      itemName="product"
      itemNamePlural="products"
      emptyState={
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
      }
      renderItem={(product, isSelected, onToggle) => (
        <div className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${product.name}`}
          />
          <Link
            href={`/admin/products/${product.id}`}
            className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                  {product.currency} {product.setupFee.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  + {product.currency} {product.monthlyFee.toFixed(2)}/mo
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
        </div>
      )}
    />
  );
}
