import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/common/LoginPage";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

// 📥 एडमिन और रिटेलर के सारे 9 पैनल्स पूरी तरह इम्पोर्टेड हैं (StockPanel के साथ)
import Overview from "../pages/admin/Overview";
import ListProduct from "../pages/admin/ListProduct";
import ManageProduct from "../pages/admin/ManageProduct";
import StockPanel from "../pages/admin/StockPanel"; // 🆕 नया स्टॉक लेज़र पैनल लिंक किया
import RegisterUser from "../pages/admin/RegisterUser";
import ManageUser from "../pages/admin/ManageUser";
import InvoiceEntry from "../pages/admin/InvoiceEntry";
import OrderHistory from "../pages/admin/OrderHistory";
import SalesHistory from "../pages/admin/SalesHistory";
import Storefront from "../pages/retailer/Storefront";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* डिफ़ॉल्ट रूट डिसीजन */}
      <Route path="/" element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/store"} replace /> : <Navigate to="/login" replace />} />

      {/* लॉगिन रूट */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />

      {/* 🔐 एडमिन रूट कंट्रोलर पैनल (सभी 8 सब-पैनल्स) */}
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
                    return <StockPanel />; // 🆕 लाइव स्टॉक पैनल केस एक्टिव है
                  case "register-user":
                    return <RegisterUser />;
                  case "manage-user":
                    return <ManageUser />;
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

      {/* 🛒 दुकानदार (Retailer) मोबाइल शॉपिंग स्टोर रूट */}
      <Route
        path="/store"
        element={
          <ProtectedRoute allowedRoles={["retailer"]}>
            <Storefront />
          </ProtectedRoute>
        }
      />

      {/* गलत पाथ आने पर सुरक्षित रीडायरेक्ट */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
