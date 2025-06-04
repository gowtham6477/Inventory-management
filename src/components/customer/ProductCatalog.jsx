import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/client";
import { useAuth } from "@/hooks/useAuth";

const ProductCatalog = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      
      const response = await apiClient.get("/products?inStock=true");
      setProducts(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory && product.quantity > 0;
  });

  const categories = [...new Set(products.map((p) => p.category))].filter(
    Boolean
  );

  const handleOrder = async () => {
    if (!selectedProduct || !user || !user.id) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      return;
    }

    if (orderQuantity < 1 || orderQuantity > selectedProduct.quantity) {
      toast({
        title: "Invalid Quantity",
        description: `Select between 1 and ${selectedProduct.quantity}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    
    const orderData = {
      product: selectedProduct._id || selectedProduct.id,
      quantity: orderQuantity,
    };

    try {
      await apiClient.post("/orders", orderData);

      toast({
        title: "Order Placed",
        description: `Ordered ${orderQuantity} x ${selectedProduct.name}`,
      });

      setSelectedProduct(null);
      setOrderQuantity(1);

      await fetchProducts();
    } catch (error) {
      toast({
        title: "Order Failed",
        description:
          error?.response?.data?.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
        <p className="text-gray-600">Browse and order products</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card
            key={product._id || product.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription>{product.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    ${product.price}
                  </p>
                  <p className="text-sm text-gray-500">{product.quantity} available</p>
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  In Stock
                </div>
              </div>

              {}
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedProduct(product);
                  setOrderQuantity(1);
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Order Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {}
      <Dialog
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        {selectedProduct && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Place Order</DialogTitle>
              <DialogDescription>
                {selectedProduct.name} - ${selectedProduct.price} each
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct.quantity}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Total</Label>
                <div className="col-span-3 text-lg font-bold">
                  ${(selectedProduct.price * orderQuantity).toFixed(2)}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleOrder} disabled={loading}>
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default ProductCatalog;
