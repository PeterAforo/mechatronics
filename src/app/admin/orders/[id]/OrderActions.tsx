"use client";

import { useState } from "react";
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
import { Check, X, RotateCcw, Loader2 } from "lucide-react";

interface OrderActionsProps {
  orderId: string;
  status: string;
  total: string;
  currency: string;
}

export default function OrderActions({ orderId, status, total, currency }: OrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState("manual");
  const [paymentRef, setPaymentRef] = useState("");

  const handleAction = async (action: string, extraData?: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraData }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      toast.success(data.message);
      setApproveDialogOpen(false);
      setCancelDialogOpen(false);
      setRefundDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setLoading(false);
    }
  };

  if (status === "paid") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <Check className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-green-700">Order is Active</p>
            <p className="text-xs text-green-600">Customer can access their devices</p>
          </div>
          
          <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                <RotateCcw className="h-4 w-4 mr-2" />
                Refund Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Refund Order</DialogTitle>
                <DialogDescription>
                  This will cancel all subscriptions and release inventory back to stock.
                  The customer will lose access to their devices.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-lg font-semibold text-center">
                  Refund Amount: {currency} {Number(total).toFixed(2)}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleAction("refund")}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Refund
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (status === "cancelled" || status === "refunded") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <X className="h-5 w-5 text-gray-400 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-600">
            Order is {status === "cancelled" ? "Cancelled" : "Refunded"}
          </p>
          <p className="text-xs text-gray-500">No actions available</p>
        </div>
      </div>
    );
  }

  // Pending order - show approve/cancel buttons
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
      <div className="space-y-3">
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              Approve & Activate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Order</DialogTitle>
              <DialogDescription>
                Mark this order as paid and activate the customer&apos;s subscription.
                This will assign devices from inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-700">
                  Total: {currency} {Number(total).toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentProvider} onValueChange={setPaymentProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual / Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="card">Card Payment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Reference (optional)</Label>
                <Input
                  placeholder="e.g., Transaction ID, Receipt #"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAction("approve", { 
                  paymentProvider, 
                  paymentProviderRef: paymentRef 
                })}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Approve Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
              <X className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this order? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Keep Order
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleAction("cancel")}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Cancel Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
