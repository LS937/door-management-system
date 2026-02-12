"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { updateOrder } from "@/lib/storage";
import { format } from "date-fns";

interface OrderListItemProps {
  order: Order;
  onUpdate: () => void;
  isAdmin?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: Package },
  accepted: { label: "Accepted", color: "bg-blue-500", icon: CheckCircle },
  prepared: { label: "Prepared", color: "bg-green-500", icon: Package },
  pickup_requested: {
    label: "Pickup Requested",
    color: "bg-purple-500",
    icon: Truck,
  },
  delivered: { label: "Delivered", color: "bg-gray-500", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500", icon: XCircle },
};

export default function OrderListItem({
  order,
  onUpdate,
  isAdmin,
  onAccept,
  onReject,
}: OrderListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const handleMarkPrepared = async () => {
    try {
      await updateOrder(order.id, { status: "prepared" });
      onUpdate();
    } catch (error) {
      console.error('Error marking order as prepared:', error);
    }
  };

  const handleMarkDelivered = async () => {
    try {
      await updateOrder(order.id, {
        status: "delivered",
        deliveredAt: new Date().toISOString(),
      });
      onUpdate();
    } catch (error) {
      console.error('Error marking order as delivered:', error);
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Collapsed View - Order Number Row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <StatusIcon className="h-5 w-5 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
            <span className="font-bold text-lg text-primary truncate">
              ORDER NO {order.orderNumber}
            </span>
            <span className="text-sm text-muted-foreground truncate hidden sm:block">
              — {order.contactPerson}
            </span>
            <Badge className={`${status.color} w-fit shrink-0`}>
              {status.label}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {format(new Date(order.createdAt), "PP")}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded View - Full Order Details */}
      {isExpanded && (
        <CardContent className="space-y-4 pt-0 pb-4 border-t">
          <div className="grid gap-3">
            {order.photoUrl && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Order Photo
                </p>
                <div className="relative w-full max-w-md">
                  <img
                    src={order.photoUrl}
                    alt={`Order ${order.orderNumber}`}
                    className="w-full h-auto rounded-lg border border-border shadow-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Order Message
              </p>
              <p className="text-sm">{order.orderMessage || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Contact Person
              </p>
              <p className="text-sm">{order.contactPerson || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Customer Information
              </p>
              <div className="text-sm space-y-1 mt-1">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {order.customerInfo.name || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {order.customerInfo.email || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {order.customerInfo.phone || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {order.customerInfo.address || "N/A"}
                </p>
              </div>
            </div>

            {order.expectedDeliveryDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Expected Delivery
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(order.expectedDeliveryDate), "PPP")}
                </p>
              </div>
            )}

            {order.rejectionReason && (
              <div>
                <p className="text-sm font-medium text-destructive">
                  Rejection Reason
                </p>
                <p className="text-sm text-destructive">
                  {order.rejectionReason}
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p>Created: {format(new Date(order.createdAt), "PPP p")}</p>
              <p>Updated: {format(new Date(order.updatedAt), "PPP p")}</p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {order.status === "pending" && (
                <>
                  <Button onClick={onAccept} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Order
                  </Button>
                  <Button
                    onClick={onReject}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Order
                  </Button>
                </>
              )}

              {order.status === "accepted" && (
                <Button onClick={handleMarkPrepared} className="flex-1">
                  <Package className="h-4 w-4 mr-2" />
                  Mark as Prepared
                </Button>
              )}

              {(order.status === "prepared" ||
                order.status === "pickup_requested") && (
                <Button onClick={handleMarkDelivered} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
