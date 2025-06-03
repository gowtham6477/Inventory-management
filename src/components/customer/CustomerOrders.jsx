import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/client";
import { useAuth } from "@/hooks/useAuth";

const CustomerOrders = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const response = await apiClient.get(`/orders/user/${user.id}`);
      setOrders(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleCancelOrder = async (orderId, productId, quantity) => {
    if (!productId) {
      toast({
        title: "Error",
        description: "Product ID not found.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Delete order
      await apiClient.delete(`/orders/${orderId}`);

      // Fetch current product quantity
      const productResponse = await apiClient.get(`/products/${productId}`);
      const currentQuantity = productResponse.data?.quantity || 0;

      // Update product with restored quantity
      await apiClient.put(`/products/${productId}`, {
        quantity: currentQuantity + quantity,
      });

      toast({
        title: "Order Cancelled",
        description: "Your order has been successfully cancelled.",
      });

      await fetchOrders();
    } catch (error) {
      console.error("Cancel Error:", error?.response?.data || error.message);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to cancel the order.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: "secondary", label: "Pending" },
      processing: { variant: "default", label: "Processing" },
      shipped: { variant: "outline", label: "Shipped" },
      delivered: { variant: "success", label: "Delivered" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };

    const config = statusMap[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canCancelOrder = (status) => status === "pending";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">You haven't placed any orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const productId = order.product?._id || order.product?.id;

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id?.slice(0, 8) || "N/A"}
                      </CardTitle>
                      <CardDescription>
                        Placed on{" "}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "Unknown date"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Product</p>
                      <p className="text-sm">{order.product?.name || "Unknown product"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Quantity</p>
                      <p className="text-sm">{order.quantity ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Price</p>
                      <p className="text-sm font-bold">
                        ${order.totalPrice ? parseFloat(order.totalPrice).toFixed(2) : "0.00"}
                      </p>
                    </div>
                  </div>

                  {canCancelOrder(order.status) && (
                    <div className="mt-4 flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            disabled={loading}
                          >
                            Cancel Order
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this order? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Order</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleCancelOrder(order.id, productId, order.quantity)
                              }
                            >
                              Cancel Order
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
