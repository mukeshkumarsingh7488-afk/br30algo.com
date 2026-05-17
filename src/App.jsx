import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext"; // नई लाइन
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          {" "}
          {/* पूरे ऐप को प्रोडक्ट्स से कनेक्ट किया */}
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
            <AppRoutes />
          </div>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}
