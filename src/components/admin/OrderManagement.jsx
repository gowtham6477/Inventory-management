import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/api/client";
import { useToast } from "@/hooks/use-toast";

const OrderManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  
  const fetchOrders = async () => {
    try {
      const response = await apiClient.get("/orders");
      setOrders(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  
  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "Invalid order ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiClient.put(`/orders/${orderId}`, { status: newStatus });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      await fetchOrders();
    } catch (error) {
      console.error("Update failed:", error?.response?.data || error.message);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", label: "Pending" },
      processing: { variant: "default", label: "Processing" },
      shipped: { variant: "outline", label: "Shipped" },
      delivered: { variant: "success", label: "Delivered" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = statusConfig[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseFloat(order.totalPrice || 0),
    0
  );
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const shippedOrders = orders.filter((order) => order.status === "shipped").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">Monitor and manage customer orders</p>
      </header>

      {}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shipped Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippedOrders}</div>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={order.id || `${order.customer?.email}-${Math.random()}`}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Order #{typeof order.id === "string" ? order.id.slice(0, 8) : "N/A"}
                  </CardTitle>
                  <CardDescription>
                    {order.customer?.name || "Unknown"} • {order.customer?.email || "N/A"}
                  </CardDescription>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Product</p>
                  <p className="text-sm">{order.product?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Quantity</p>
                  <p className="text-sm">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Price</p>
                  <p className="text-sm font-bold">
                    ${parseFloat(order.totalPrice || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Order Date</p>
                  <p className="text-sm">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
