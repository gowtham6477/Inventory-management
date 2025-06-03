
import ProductCatalog from "./ProductCatalog";
import CustomerOrders from "./CustomerOrders";

const CustomerDashboard = ({ activeView, user }) => {
  return (
    <div className="p-6">
      {activeView === "catalog" && <ProductCatalog user={user} />}
      {activeView === "my-orders" && <CustomerOrders user={user} />}
    </div>
  );
};

export default CustomerDashboard;
