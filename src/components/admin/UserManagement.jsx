import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/api/client";
import { useToast } from "@/hooks/use-toast";

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/users");
      setUsers(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { variant: "default", label: "Admin" },
      customer: { variant: "secondary", label: "Customer" },
      user: { variant: "secondary", label: "User" },
    };
    const config = roleConfig[role] || { variant: "outline", label: role };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "admin").length;
  const customerUsers = users.filter((user) => user.role === "customer" || user.role === "user").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </header>
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage system users and their roles</p>
      </header>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customer Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No users found.</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card
              key={user._id || user.id || `${user.email}-${Math.random()}`}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {user.name || "Unknown User"}
                    </CardTitle>
                    <CardDescription>
                      {user.email || "No email provided"}
                    </CardDescription>
                  </div>
                  {getRoleBadge(user.role)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="text-sm font-mono">
                      {user._id && typeof user._id === "string" 
                        ? user._id.slice(0, 8) + "..." 
                        : user.id || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="text-sm capitalize">{user.role || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Joined</p>
                    <p className="text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManagement;