
import ProductManagement from "./ProductManagement";
import OrderManagement from "./OrderManagement";

const AdminDashboard = ({ activeView }) => {
  return (
    <div className="p-6">
      {activeView === "products" && <ProductManagement />}
      {activeView === "orders" && <OrderManagement />}
    </div>
  );
};

export default AdminDashboard;
