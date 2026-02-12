"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { SimpleUserButton } from "@/components/simple-user-button";
import { Input } from "@/components/ui/input";
import { Shield, ArrowLeft, Search } from "lucide-react";
import { getUserRole, getOrders, cleanupOldOrders } from "@/lib/storage";
import { Order } from "@/lib/types";
import OrderListItem from "@/components/order-list-item";
import AcceptOrderDialog from "@/components/admin/accept-order-dialog";
import RejectOrderDialog from "@/components/admin/reject-order-dialog";
import { useSimpleAuth } from "@/lib/simple-auth";

export default function AdminDashboard() {
  const { user } = useSimpleAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadOrders = async () => {
    await cleanupOldOrders();
    const allOrders = await getOrders();
    setOrders(allOrders);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/sign-in");
      return;
    }

    if (mounted && user) {
      const checkRoleAndLoadOrders = async () => {
        const role = await getUserRole(user.id);
        if (role !== "admin") {
          router.push(`/dashboard/${role}`);
          return;
        }
        await loadOrders();
      };
      checkRoleAndLoadOrders();
    }
  }, [user, router, mounted]);

  const handleAcceptOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowAcceptDialog(true);
  };

  const handleRejectOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowRejectDialog(true);
  };

  const handleDialogClose = () => {
    setShowAcceptDialog(false);
    setShowRejectDialog(false);
    setSelectedOrder(null);
    loadOrders();
  };

  const sortByOrderNumber = (a: Order, b: Order) => {
    return a.orderNumber.localeCompare(b.orderNumber);
  };

  const filteredOrders = searchQuery.trim()
    ? orders.filter((o) => o.orderNumber.includes(searchQuery.trim()))
    : orders;

  const newOrders = filteredOrders
    .filter((o) => o.status === "pending")
    .sort(sortByOrderNumber);
  const processingOrders = filteredOrders
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
                <Shield className="h-6 w-6 text-destructive" />
                <div>
                  <h1 className="text-xl font-bold">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage all orders
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

        <Tabs defaultValue="new" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="new">
              New Orders ({newOrders.length})
            </TabsTrigger>
            <TabsTrigger value="processing">
              Processing ({processingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered ({deliveredOrders.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4">
            {newOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No new orders
                </CardContent>
              </Card>
            ) : (
              newOrders.map((order) => (
                <OrderListItem
                  key={order.id}
                  order={order}
                  onUpdate={loadOrders}
                  onAccept={() => handleAcceptOrder(order)}
                  onReject={() => handleRejectOrder(order)}
                  isAdmin
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            {processingOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No orders in processing
                </CardContent>
              </Card>
            ) : (
              processingOrders.map((order) => (
                <OrderListItem
                  key={order.id}
                  order={order}
                  onUpdate={loadOrders}
                  isAdmin
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
                  isAdmin
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
                  isAdmin
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {showAcceptDialog && selectedOrder && (
        <AcceptOrderDialog order={selectedOrder} onClose={handleDialogClose} />
      )}

      {showRejectDialog && selectedOrder && (
        <RejectOrderDialog order={selectedOrder} onClose={handleDialogClose} />
      )}
    </div>
  );
}
