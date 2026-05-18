import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import AppRoutes from "./routes/AppRoutes";

if (window.location.pathname === "/sitemap.xml" || window.location.pathname === "/robots.txt") {
  window.location.href = window.location.pathname;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
            <AppRoutes />
          </div>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}
