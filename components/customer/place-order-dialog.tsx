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
import { addOrder, getOrders, uploadOrderPhoto } from "@/lib/storage";
import { Order } from "@/lib/types";
import { Upload, X } from "lucide-react";

// Constants
const ORDER_NUMBER_PATTERN = /^\d+$/;

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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [orderNumberError, setOrderNumberError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size must be less than 5MB');
      return;
    }

    setPhotoError('');
    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const trimmed = formData.orderNumber.trim();
      if (!trimmed || !ORDER_NUMBER_PATTERN.test(trimmed)) {
        setOrderNumberError("Order number must be a valid integer.");
        setIsSubmitting(false);
        return;
      }

      // Check if photo is provided
      if (!photoFile) {
        setPhotoError("Photo is required for placing an order.");
        setIsSubmitting(false);
        return;
      }

      // Check for duplicate among active orders (not delivered/rejected)
      const existingOrders = await getOrders();
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
        setIsSubmitting(false);
        return;
      }

      setOrderNumberError("");

      // Create order ID first
      const orderId = crypto.randomUUID();

      // Upload photo
      let photoUrl: string | undefined = undefined;
      if (photoFile) {
        const uploadedUrl = await uploadOrderPhoto(photoFile, orderId);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      const newOrder: Order = {
        id: orderId,
        orderNumber: trimmed,
        orderMessage: formData.orderMessage || "",
        contactPerson: formData.contactPerson || "",
        customerInfo: {
          name: formData.customerName || "",
          email: formData.customerEmail || userEmail,
          phone: formData.customerPhone || "",
          address: formData.customerAddress || "",
        },
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerId: userId,
        photoUrl,
      };

      await addOrder(newOrder);
      onSuccess();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            Fill in the details for your wooden door order. Photo is required, other fields are optional.
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
                if (val === "" || ORDER_NUMBER_PATTERN.test(val)) {
                  handleChange("orderNumber", val);
                  setOrderNumberError("");
                }
              }}
              required
              disabled={isSubmitting}
            />
            {orderNumberError && (
              <p className="text-sm text-destructive">{orderNumberError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Order Photo *</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-4">
              {!photoPreview ? (
                <label htmlFor="photo" className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center py-6">
                    <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload order photo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, JPEG up to 5MB
                    </p>
                  </div>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={isSubmitting}
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Order preview"
                    className="w-full h-64 object-contain rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removePhoto}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {photoError && (
              <p className="text-sm text-destructive">{photoError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderMessage">Order Message</Label>
            <Textarea
              id="orderMessage"
              placeholder="Describe your door requirements (optional)..."
              value={formData.orderMessage}
              onChange={(e) => handleChange("orderMessage", e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              placeholder="Person to contact for this order (optional)"
              value={formData.contactPerson}
              onChange={(e) => handleChange("contactPerson", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">
              Customer Delivery Information (Optional)
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="Name of the customer receiving the doors"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    handleChange("customerEmail", e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    handleChange("customerPhone", e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress">Delivery Address</Label>
                <Textarea
                  id="customerAddress"
                  placeholder="Full delivery address"
                  value={formData.customerAddress}
                  onChange={(e) =>
                    handleChange("customerAddress", e.target.value)
                  }
                  rows={3}
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
