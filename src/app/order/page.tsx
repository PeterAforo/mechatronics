"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  ArrowLeft, Loader2, ShoppingCart, CreditCard, Check,
  Droplets, Zap
} from "lucide-react";

interface Product {
  id: string;
  productCode: string;
  name: string;
  shortDescription: string;
  category: string;
  setupFee: string;
  monthlyFee: string;
  currency: string;
}

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<"review" | "checkout" | "success">("review");
  const [orderRef, setOrderRef] = useState("");

  const productCode = searchParams.get("product");

  useEffect(() => {
    if (!productCode) {
      router.push("/");
      return;
    }

    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${productCode}`);
        if (!res.ok) {
          toast.error("Product not found");
          router.push("/");
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch {
        toast.error("Failed to load product");
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productCode, router]);

  const setupTotal = product ? Number(product.setupFee) * quantity : 0;
  const monthlyTotal = product ? Number(product.monthlyFee) * quantity : 0;
  const grandTotal = setupTotal + monthlyTotal;

  const handlePlaceOrder = async () => {
    if (status !== "authenticated") {
      router.push(`/register?product=${productCode}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          quantity,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to place order");
      }

      const order = await res.json();
      setOrderRef(order.orderRef);
      setStep("success");
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f74780]" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50">
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
        <Link href={`/products/${product.productCode}`} className="inline-flex items-center text-gray-500 hover:text-[#f74780] mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Product
        </Link>

        {step === "success" ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-full mb-6">
              <Check className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-500 mb-2">Your order reference is:</p>
            <p className="text-2xl font-mono text-[#f74780] mb-8">{orderRef}</p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 max-w-md mx-auto">
              <p className="text-amber-800 font-medium mb-1">Awaiting Payment Confirmation</p>
              <p className="text-amber-700 text-sm">
                Please complete your payment. Once confirmed, your subscription will be activated and you&apos;ll receive access to your devices.
              </p>
            </div>

            <p className="text-gray-500 mb-8">
              You can track your order status in your portal. We&apos;ll notify you once your order is activated.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/portal">
                <Button className="bg-[#f74780] hover:bg-[#e03a6f]">
                  Go to Portal
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Details
                </h2>
                
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.shortDescription}</p>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Setup: </span>
                      <span className="text-gray-900">{product.currency} {Number(product.setupFee).toFixed(2)}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-gray-500">Monthly: </span>
                      <span className="text-[#f74780]">{product.currency} {Number(product.monthlyFee).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {status !== "authenticated" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h3 className="font-medium text-amber-800 mb-2">Create an account to continue</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    You need to register to place an order. It only takes a minute!
                  </p>
                  <div className="flex gap-3">
                    <Link href={`/register?product=${productCode}`}>
                      <Button className="bg-[#f74780] hover:bg-[#e03a6f]">
                        Register Now
                      </Button>
                    </Link>
                    <Link href={`/login?callbackUrl=/order?product=${productCode}`}>
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                        Already have an account? Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm sticky top-28">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-500">
                    <span>Setup Fee ({quantity}x)</span>
                    <span className="text-gray-900">{product.currency} {setupTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>First Month ({quantity}x)</span>
                    <span className="text-gray-900">{product.currency} {monthlyTotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total Due Today</span>
                      <span className="font-bold text-xl text-[#f74780]">
                        {product.currency} {grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={submitting || status !== "authenticated"}
                  className="w-full bg-[#f74780] hover:bg-[#e03a6f]"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-400 mt-4 text-center">
                  By placing this order, you agree to our terms of service.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f74780]" />
      </div>
    }>
      <OrderContent />
    </Suspense>
  );
}
