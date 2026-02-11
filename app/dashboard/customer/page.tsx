"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { SimpleUserButton } from "@/components/simple-user-button";
import { Input } from "@/components/ui/input";
import { Package, Plus, Truck, ArrowLeft, Search } from "lucide-react";
import {
  getUserRole,
  getOrdersByCustomer,
  cleanupOldOrders,
} from "@/lib/storage";
import { Order } from "@/lib/types";
import PlaceOrderDialog from "@/components/customer/place-order-dialog";
import OrderListItem from "@/components/order-list-item";
import PickupRequestDialog from "@/components/customer/pickup-request-dialog";
import { useSimpleAuth } from "@/lib/simple-auth";

export default function CustomerDashboard() {
  const { user } = useSimpleAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [showPickupRequest, setShowPickupRequest] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/sign-in");
      return;
    }

    if (mounted && user) {
      const role = getUserRole(user.id);
      if (role !== "customer") {
        router.push(`/dashboard/${role}`);
        return;
      }
      loadOrders();
    }
  }, [user, router, mounted]);

  const loadOrders = () => {
    if (user) {
      cleanupOldOrders();
      const userOrders = getOrdersByCustomer(user.id);
      setOrders(userOrders);
    }
  };

  const handleOrderPlaced = () => {
    loadOrders();
    setShowPlaceOrder(false);
  };

  const handlePickupRequested = () => {
    loadOrders();
    setShowPickupRequest(false);
  };

  const sortByOrderNumber = (a: Order, b: Order) => {
    return a.orderNumber.localeCompare(b.orderNumber);
  };

  const filteredOrders = searchQuery.trim()
    ? orders.filter((o) => o.orderNumber.includes(searchQuery.trim()))
    : orders;

  const pendingOrders = filteredOrders
    .filter((o) => o.status === "pending")
    .sort(sortByOrderNumber);
  const acceptedOrders = filteredOrders
    .filter(
      (o) =>
        o.status === "accepted" ||
        o.status === "prepared" ||
        o.status === "pickup_requested",
    )
    .sort(sortByOrderNumber);
  const deliveredOrders = filteredOrders
    .filter((o) => o.status === "delivered")
    .sort(sortByOrderNumber);
  const rejectedOrders = filteredOrders
    .filter((o) => o.status === "rejected")
    .sort(sortByOrderNumber);
  const preparedOrders = orders.filter((o) => o.status === "prepared");

  if (!mounted || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                <div>
                  <h1 className="text-xl font-bold">Customer Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your orders
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SimpleUserButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            onClick={() => setShowPlaceOrder(true)}
            className="flex-1 sm:flex-initial"
          >
            <Plus className="h-4 w-4 mr-2" />
            Place New Order
          </Button>
          <Button
            onClick={() => setShowPickupRequest(true)}
            variant="outline"
            disabled={preparedOrders.length === 0}
            className="flex-1 sm:flex-initial"
          >
            <Truck className="h-4 w-4 mr-2" />
            Request Pickup
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number..."
            inputMode="numeric"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d+$/.test(val)) {
                setSearchQuery(val);
              }
            }}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="accepted" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="accepted">
              Accepted ({acceptedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered ({deliveredOrders.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No accepted orders yet
                </CardContent>
              </Card>
            ) : (
              acceptedOrders.map((order) => (
                <OrderListItem
                  key={order.id}
                  order={order}
                  onUpdate={loadOrders}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No pending orders
                </CardContent>
              </Card>
            ) : (
              pendingOrders.map((order) => (
                <OrderListItem
                  key={order.id}
                  order={order}
                  onUpdate={loadOrders}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
            {deliveredOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No delivered orders
                </CardContent>
              </Card>
            ) : (
              deliveredOrders.map((order) => (
                <OrderListItem
                  key={order.id}
                  order={order}
                  onUpdate={loadOrders}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No rejected orders
                </CardContent>
              </Card>
            ) : (
              rejectedOrders.map((order) => (
                <OrderListItem
                  key={order.id}
                  order={order}
                  onUpdate={loadOrders}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {showPlaceOrder && user && (
        <PlaceOrderDialog
          userId={user.id}
          userEmail={user.emailAddresses[0]?.emailAddress || ""}
          onClose={() => setShowPlaceOrder(false)}
          onSuccess={handleOrderPlaced}
        />
      )}

      {showPickupRequest && user && (
        <PickupRequestDialog
          userId={user.id}
          preparedOrders={preparedOrders}
          onClose={() => setShowPickupRequest(false)}
          onSuccess={handlePickupRequested}
        />
      )}
    </div>
  );
}
