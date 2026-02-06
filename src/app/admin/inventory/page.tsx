import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Package, Boxes, ShoppingCart, AlertTriangle } from "lucide-react";
import InventoryList from "./InventoryList";

export default async function InventoryPage() {
  // Fetch all products with their device types
  const products = await prisma.deviceProduct.findMany({
    where: { isPublished: true },
    include: {
      deviceType: true,
    },
    orderBy: { name: "asc" },
  });

  // Fetch inventory counts grouped by device type and status
  const inventoryCounts = await prisma.deviceInventory.groupBy({
    by: ["deviceTypeId", "status"],
    _count: { id: true },
  });

  // Build a map of deviceTypeId -> { in_stock, sold, installed, etc. }
  const inventoryByDeviceType: Record<string, Record<string, number>> = {};
  for (const item of inventoryCounts) {
    const dtId = item.deviceTypeId.toString();
    if (!inventoryByDeviceType[dtId]) {
      inventoryByDeviceType[dtId] = { in_stock: 0, sold: 0, installed: 0, returned: 0, retired: 0 };
    }
    inventoryByDeviceType[dtId][item.status] = item._count.id;
  }

  // Build product inventory data
  const productInventory = products.map((product) => {
    const dtId = product.deviceTypeId?.toString() || "";
    const counts = inventoryByDeviceType[dtId] || { in_stock: 0, sold: 0, installed: 0, returned: 0, retired: 0 };
    const available = counts.in_stock || 0;
    const deployed = (counts.sold || 0) + (counts.installed || 0);
    const total = available + deployed + (counts.returned || 0) + (counts.retired || 0);
    
    return {
      id: product.id.toString(),
      name: product.name,
      productCode: product.productCode,
      category: product.category,
      deviceTypeName: product.deviceType?.name || "No device type",
      available,
      deployed,
      total,
      lowStock: available < 5 && total > 0,
    };
  });

  // Fetch all inventory for the list
  const inventory = await prisma.deviceInventory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      deviceType: true,
    },
  });

  const serializedInventory = inventory.map((item) => ({
    id: item.id.toString(),
    serialNumber: item.serialNumber,
    imei: item.imei,
    firmwareVersion: item.firmwareVersion,
    status: item.status,
    deviceTypeName: item.deviceType?.name || "Unknown",
  }));

  // Calculate totals
  const totalAvailable = productInventory.reduce((sum, p) => sum + p.available, 0);
  const totalDeployed = productInventory.reduce((sum, p) => sum + p.deployed, 0);
  const totalUnits = inventory.length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage device units and stock</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/inventory/import">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          </Link>
          <Link href="/admin/inventory/new">
            <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Boxes className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Units</p>
              <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-2xl font-bold text-gray-900">{totalAvailable}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Deployed</p>
              <p className="text-2xl font-bold text-gray-900">{totalDeployed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Inventory Cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productInventory.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.productCode} • {product.deviceTypeName}</p>
                </div>
                {product.lowStock && (
                  <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    Low Stock
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Stock Level</span>
                  <span className="font-medium text-gray-900">{product.total} units</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  {product.total > 0 ? (
                    <>
                      <div
                        className="h-full bg-green-500 float-left"
                        style={{ width: `${(product.available / product.total) * 100}%` }}
                      />
                      <div
                        className="h-full bg-blue-500 float-left"
                        style={{ width: `${(product.deployed / product.total) * 100}%` }}
                      />
                    </>
                  ) : (
                    <div className="h-full bg-gray-200 w-full" />
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-gray-600">Available: <span className="font-semibold text-gray-900">{product.available}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-600">Deployed: <span className="font-semibold text-gray-900">{product.deployed}</span></span>
                </div>
              </div>
            </div>
          ))}
          
          {productInventory.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No products found. <Link href="/admin/products" className="text-purple-600 hover:underline">Add products</Link> to track inventory.
            </div>
          )}
        </div>
      </div>

      <InventoryList inventory={serializedInventory} />
    </main>
  );
}
