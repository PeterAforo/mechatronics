"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Cpu } from "lucide-react";

interface InventoryItem {
  id: string;
  serialNumber: string;
  deviceTypeId: string;
  deviceTypeName: string;
  deviceTypeCode: string;
  imei: string | null;
  firmwareVersion: string | null;
}

interface Product {
  id: string;
  name: string;
  productCode: string;
  deviceTypeId: string | null;
  setupFee: string;
  monthlyFee: string;
  currency: string;
}

interface AssignDeviceDialogProps {
  tenantId: string;
  tenantName: string;
}

export default function AssignDeviceDialog({ tenantId, tenantName }: AssignDeviceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedInventory, setSelectedInventory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (open) {
      fetchAssignmentData();
    }
  }, [open]);

  const fetchAssignmentData = async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}/assign-device`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch data");
      }
      
      setInventory(data.inventory || []);
      setProducts(data.products || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setFetching(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedInventory || !selectedProduct) {
      toast.error("Please select a device and product");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}/assign-device`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: selectedInventory,
          productId: selectedProduct,
          nickname: nickname || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to assign device");
      }

      toast.success(data.message);
      setOpen(false);
      setSelectedInventory("");
      setSelectedProduct("");
      setNickname("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign device");
    } finally {
      setLoading(false);
    }
  };

  const selectedInventoryItem = inventory.find(i => i.id === selectedInventory);
  const filteredProducts = selectedInventoryItem
    ? products.filter(p => !p.deviceTypeId || p.deviceTypeId === selectedInventoryItem.deviceTypeId)
    : products;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Assign Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Device to Tenant</DialogTitle>
          <DialogDescription>
            Assign a device from inventory to <strong>{tenantName}</strong>. This will create a subscription and activate the device.
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {inventory.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <Cpu className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No devices available in inventory</p>
                <p className="text-sm text-gray-400 mt-1">Add devices to inventory first</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Select Device from Inventory</Label>
                  <Select value={selectedInventory} onValueChange={setSelectedInventory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a device..." />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{item.serialNumber}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600">{item.deviceTypeName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedInventoryItem && (
                    <p className="text-xs text-gray-500">
                      Type: {selectedInventoryItem.deviceTypeCode} | 
                      IMEI: {selectedInventoryItem.imei || "N/A"} | 
                      FW: {selectedInventoryItem.firmwareVersion || "N/A"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Select Product/Subscription</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            <span>{product.name}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600">
                              {product.currency} {Number(product.monthlyFee).toFixed(2)}/mo
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Device Nickname (optional)</Label>
                  <Input
                    placeholder="e.g., Main Office Water Tank"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#f74780] hover:bg-[#e03a6f] text-white"
            onClick={handleAssign}
            disabled={loading || fetching || !selectedInventory || !selectedProduct}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Assign Device
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
