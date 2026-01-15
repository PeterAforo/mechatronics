"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, ChevronRight } from "lucide-react";
import BulkDeleteTable from "@/components/admin/BulkDeleteTable";

interface Order {
  id: string;
  orderRef: string;
  itemCount: number;
  createdAt: string;
  currency: string;
  total: number;
  status: string;
}

interface OrdersListProps {
  orders: Order[];
}

const statusColors: Record<string, string> = {
  pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  paid: "border-green-200 bg-green-50 text-green-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
  refunded: "border-gray-200 bg-gray-50 text-gray-600",
};

export default function OrdersList({ orders }: OrdersListProps) {
  return (
    <BulkDeleteTable
      items={orders}
      deleteEndpoint="/api/admin/orders/bulk-delete"
      itemName="order"
      itemNamePlural="orders"
      emptyState={
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
            <ShoppingCart className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
          <p className="text-gray-500">Orders will appear here when customers make purchases</p>
        </div>
      }
      renderItem={(order, isSelected, onToggle) => (
        <div className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${order.orderRef}`}
          />
          <Link
            href={`/admin/orders/${order.id}`}
            className="flex-1 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-yellow-50 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{order.orderRef}</p>
                <p className="text-sm text-gray-500">
                  {order.itemCount} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {order.currency} {order.total.toFixed(2)}
                </p>
              </div>
              <Badge variant="outline" className={statusColors[order.status] || statusColors.pending}>
                {order.status}
              </Badge>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>
        </div>
      )}
    />
  );
}
