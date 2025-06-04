import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import AdminDashboard from "../admin/AdminDashboard";
import CustomerDashboard from "../customer/CustomerDashboard";
import UserManagement from "../admin/UserManagement";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/api/client"; 

const Dashboard = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [activeView, setActiveView] = useState("");

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get("/auth/profile");
      const userData = response.data.user;
      setUserProfile(userData);
      setActiveView(userData.role === "admin" ? "products" : "catalog");
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  if (!userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        userProfile={userProfile}
        activeView={activeView} 
        onViewChange={setActiveView}
      />
      <main className="flex-1 overflow-auto">
        {userProfile.role === "admin" ? (
          activeView === 'users' ? (
            <div className="p-6">
              <UserManagement />
            </div>
          ) : (
            <AdminDashboard activeView={activeView} />
          )
        ) : (
          <CustomerDashboard activeView={activeView} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
