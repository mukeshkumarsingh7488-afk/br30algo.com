import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Package, FileText, BarChart3, AlertTriangle, CheckCircle2, TrendingUp, ArrowUpRight, MapPin } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState("All");
  const [allRetailers, setAllRetailers] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInvoices: 0,
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("sudha_token");
      if (!token) return;

      const [resUsers, resProducts, resInvoices] = await Promise.all([axios.get(`${API_URL}/users/list`).catch(() => ({ data: { data: [] } })), axios.get(`${API_URL}/products`).catch(() => ({ data: { count: 0 } })), axios.get(`${API_URL}/invoices/history`).catch(() => ({ data: { count: 0 } }))]);

      setAllRetailers(resUsers.data?.data || []);
      setStats({
        totalProducts: resProducts.data?.count || 0,
        totalInvoices: resInvoices.data?.count || 0,
      });
    } catch (error) {
      console.error("❌ Stats Loading Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredRetailersCount = selectedRoute === "All" ? allRetailers.length : allRetailers.filter((u) => u.route === selectedRoute).length;

  const productsCount = stats.totalProducts || 0;
  const invoicesCount = stats.totalInvoices || 0;

  return (
    <div className="space-y-5 select-none text-xs font-sans max-h-[calc(100vh-32px)] overflow-y-auto scrollbar-none pb-2">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-2xl text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">Sudha Dairy Distribution Hub</h2>
          <p className="text-blue-100 font-medium text-[11px] mt-0.5">Real-time centralized inventory control dashboard & billing matrix</p>
        </div>

        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm w-full sm:w-auto">
          <MapPin className="w-4 h-4 text-blue-200 flex-shrink-0" />
          <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} className="bg-transparent text-white font-black text-xs outline-none cursor-pointer w-full sm:w-auto" style={{ colorScheme: "dark" }}>
            <option value="All" className="text-slate-800 font-bold">
              All Routes
            </option>
            <option value="Parihar Route" className="text-slate-800 font-bold">
              Parihar Route
            </option>
            <option value="Sonbarsa Route" className="text-slate-800 font-bold">
              Sonbarsa Route
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between transition hover:shadow-md">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{selectedRoute === "All" ? "Active Retailers" : `${selectedRoute} Shops`}</span>
              <span className="text-xl font-black text-gray-800 block mt-0.5">{loading ? "..." : `${filteredRetailersCount} Shops`}</span>
            </div>
          </div>
          <div className="text-emerald-500 bg-emerald-50 p-1 rounded-lg text-[10px] font-bold flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> Live
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between transition hover:shadow-md">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Catalog Items</span>
              <span className="text-xl font-black text-gray-800 block mt-0.5">{loading ? "..." : `${productsCount} Products`}</span>
            </div>
          </div>
          <div className="text-indigo-500 bg-indigo-50 p-1 rounded-lg text-[10px] font-bold flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-0.5" /> Synced
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between transition hover:shadow-md">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Depot Invoices</span>
              <span className="text-xl font-black text-gray-800 block mt-0.5">{loading ? "..." : `${invoicesCount} Audited`}</span>
            </div>
          </div>
          <div className="text-emerald-500 bg-emerald-50 p-1 rounded-lg text-[10px] font-bold flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" /> Secured
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="border-b pb-2">
          <h3 className="text-sm font-black text-gray-800 flex items-center gap-1">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Distribution Hub Volume Ledger & Monthly Analytics</span>
          </h3>
          <p className="text-gray-400 text-[10px] mt-0.5">Automated visual mapping of supply chains, route metrics and retailer settlement balances</p>
        </div>
        <div className="h-44 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 font-bold space-y-1">
          <BarChart3 className="w-7 h-7 text-gray-300 animate-pulse" />
          <span className="text-[11px]">Analytics graphs will generate automatically as retailers execute live mobile checkout orders.</span>
        </div>
      </div>
    </div>
  );
}
