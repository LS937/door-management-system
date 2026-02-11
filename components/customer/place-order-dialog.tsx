"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addOrder, getOrders } from "@/lib/storage";
import { Order } from "@/lib/types";

interface PlaceOrderDialogProps {
  userId: string;
  userEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlaceOrderDialog({
  userId,
  userEmail,
  onClose,
  onSuccess,
}: PlaceOrderDialogProps) {
  const [formData, setFormData] = useState({
    orderNumber: "",
    orderMessage: "",
    contactPerson: "",
    customerName: "",
    customerEmail: userEmail,
    customerPhone: "",
    customerAddress: "",
  });
  const [orderNumberError, setOrderNumberError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = formData.orderNumber.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      setOrderNumberError("Order number must be a valid integer.");
      return;
    }

    // Check for duplicate among active orders (not delivered/rejected)
    const existingOrders = getOrders();
    const activeStatuses: Order["status"][] = [
      "pending",
      "accepted",
      "prepared",
      "pickup_requested",
    ];
    const duplicate = existingOrders.find(
      (o) => o.orderNumber === trimmed && activeStatuses.includes(o.status),
    );
    if (duplicate) {
      setOrderNumberError("An active order with this number already exists.");
      return;
    }

    setOrderNumberError("");

    const newOrder: Order = {
      id: crypto.randomUUID(),
      orderNumber: trimmed,
      orderMessage: formData.orderMessage,
      contactPerson: formData.contactPerson,
      customerInfo: {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
        address: formData.customerAddress,
      },
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerId: userId,
    };

    addOrder(newOrder);
    onSuccess();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Place New Order</DialogTitle>
          <DialogDescription>
            Fill in the details for your wooden door order
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order Number *</Label>
            <Input
              id="orderNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 1001"
              value={formData.orderNumber}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  handleChange("orderNumber", val);
                  setOrderNumberError("");
                }
              }}
              required
            />
            {orderNumberError && (
              <p className="text-sm text-destructive">{orderNumberError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderMessage">Order Message *</Label>
            <Textarea
              id="orderMessage"
              placeholder="Describe your door requirements..."
              value={formData.orderMessage}
              onChange={(e) => handleChange("orderMessage", e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person *</Label>
            <Input
              id="contactPerson"
              placeholder="Person to contact for this order"
              value={formData.contactPerson}
              onChange={(e) => handleChange("contactPerson", e.target.value)}
              required
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">
              Customer Delivery Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Name of the customer receiving the doors"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    handleChange("customerEmail", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Customer Phone *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    handleChange("customerPhone", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress">Delivery Address *</Label>
                <Textarea
                  id="customerAddress"
                  placeholder="Full delivery address"
                  value={formData.customerAddress}
                  onChange={(e) =>
                    handleChange("customerAddress", e.target.value)
                  }
                  required
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Place Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
