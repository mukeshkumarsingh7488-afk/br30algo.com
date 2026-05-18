import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/common/LoginPage";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import Overview from "../pages/admin/Overview";
import ListProduct from "../pages/admin/ListProduct";
import ManageProduct from "../pages/admin/ManageProduct";
import StockPanel from "../pages/admin/StockPanel";
import RegisterUser from "../pages/admin/RegisterUser";
import RegisterDeliveryBoy from "../pages/admin/RegisterDeliveryBoy";
import ManageUser from "../pages/admin/ManageUser";
import ManageDeliveryBoy from "../pages/admin/ManageDeliveryBoy";
import InvoiceEntry from "../pages/admin/InvoiceEntry";
import OrderHistory from "../pages/admin/OrderHistory";
import SalesHistory from "../pages/admin/SalesHistory";
import Storefront from "../pages/retailer/Storefront";
import DeliveryBoyDashboard from "../pages/delivery/DeliveryBoyDashboard";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === "admin" ? "/admin" : user.role === "delivery_boy" ? "/delivery" : "/store"} replace /> : <Navigate to="/login" replace />} />

      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              {(currentPanel) => {
                switch (currentPanel) {
                  case "overview":
                    return <Overview />;
                  case "list-product":
                    return <ListProduct />;
                  case "manage-product":
                    return <ManageProduct />;
                  case "stock-panel":
                    return <StockPanel />;
                  case "register-user":
                    return <RegisterUser />;
                  case "register-delivery":
                    return <RegisterDeliveryBoy />;
                  case "manage-user":
                    return <ManageUser />;
                  case "manage-delivery":
                    return <ManageDeliveryBoy />;
                  case "invoice-entry":
                    return <InvoiceEntry />;
                  case "order-history":
                    return <OrderHistory />;
                  case "sales-history":
                    return <SalesHistory />;
                  default:
                    return <Overview />;
                }
              }}
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/store"
        element={
          <ProtectedRoute allowedRoles={["retailer"]}>
            <Storefront />
          </ProtectedRoute>
        }
      />

      <Route
        path="/delivery"
        element={
          <ProtectedRoute allowedRoles={["delivery_boy"]}>
            <DeliveryBoyDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/sitemap.xml" element={<iframe src="/sitemap.xml" title="Sitemap" className="w-screen h-screen border-none bg-white" />} />
      <Route path="/robots.txt" element={<iframe src="/robots.txt" title="Robots" className="w-screen h-screen border-none bg-white" />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
