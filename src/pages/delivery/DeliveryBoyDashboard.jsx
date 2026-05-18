import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Truck, Phone, MapPin, Calendar, CheckCircle2, AlertTriangle, LogOut, Search, ShoppingBag, DollarSign } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function DeliveryBoyDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchRouteOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("sudha_token");
      const res = await axios.get(`${API_URL}/orders/master-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error("Fetch Delivery Sheets Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouteOrders();
  }, []);

  const handleProcessDelivery = async (order) => {
    const isCOD = order.paymentMode === "cod";
    const finalAmount = order.amount || order.totalAmount || 0;

    window.Swal.fire({
      title: isCOD ? `<span class="text-sm font-black text-red-600">⚠️ COLLECT CASH PAYMENT</span>` : `<span class="text-sm font-black text-gray-800">Confirm Delivery Dispatch</span>`,
      html: isCOD
        ? `
        <div class="text-center text-xs font-sans space-y-2.5 pt-2 select-none">
          <p class="font-bold text-gray-500">This is a Cash on Delivery (COD) order.</p>
          <div class="bg-red-50 p-3 rounded-xl border border-red-200">
            <span class="text-gray-400 font-bold uppercase tracking-tight block text-[9px]">Cash Amount to Collect</span>
            <span class="text-xl font-black text-red-600 block mt-0.5">₹${finalAmount.toLocaleString("en-IN")}</span>
          </div>
          <p class="font-black text-slate-700 mt-2">Have you collected the full cash from ${order.shopName}?</p>
        </div>
      `
        : `<p class="text-xs font-bold text-gray-500">Mark this pre-paid order as successfully delivered to the merchant?</p>`,
      icon: isCOD ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: isCOD ? "#16a34a" : "#2563eb",
      confirmButtonText: isCOD ? "✓ Yes, Cash Received" : "✓ Yes, Delivered",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        window.Swal.fire({
          title: "Updating Cloud Ledger...",
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          },
        });
        try {
          const token = localStorage.getItem("sudha_token");
          const res = await axios.patch(
            `${API_URL}/orders/delivery-update/${order._id}`,
            {
              status: "Delivered",
              agentId: user.id || user._id,
              agentName: user.proprietor,
              agentMobile: user.mobile,
              paymentMethod: isCOD ? "COD" : "ONLINE",
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (res.data && res.data.success) {
            await fetchRouteOrders();
            window.Swal.fire({ title: "Delivery Completed! ✓", text: "Order sheet updated and retailer notified live.", icon: "success" });
          }
        } catch (err) {
          window.Swal.fire({ title: "Update Failed", text: "Network node timeout.", icon: "error" });
        }
      }
    });
  };

  const filteredOrders = orders.filter((o) => {
    const matchesRoute = user.route === "All Routes" ? true : o.route === user.route;
    const matchesDate = o.date === selectedDate || (o.createdAt && o.createdAt.startsWith(selectedDate));
    const matchesSearch = o.shopName.toLowerCase().includes(searchQuery.toLowerCase().trim()) || o.orderId.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesRoute && matchesDate && matchesSearch;
  });

  const pendingCount = filteredOrders.filter((o) => o.status !== "Delivered").length;
  const deliveredCount = filteredOrders.filter((o) => o.status === "Delivered").length;
  const totalCashCollected = filteredOrders.filter((o) => o.status === "Delivered" && o.paymentMode === "cod").reduce((sum, o) => sum + (o.amount || o.totalAmount || 0), 0);

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col justify-between select-none relative max-w-md mx-auto shadow-2xl border-x border-gray-200 overflow-hidden text-xs font-sans">
      <div className="w-full flex flex-col bg-white sticky top-0 z-30 shadow-sm flex-shrink-0">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-3 shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 border border-white/40 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-wide truncate max-w-[160px]">{user?.proprietor} (Agent)</h1>
              <span className="text-[9px] font-bold opacity-75 block mt-0.5">🚚 Route: {user?.route}</span>
            </div>
          </div>
          <button onClick={logout} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition flex-shrink-0 text-red-200">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-white space-y-2.5 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-700 text-[11px]" />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input type="text" placeholder="Search Shop..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-[11px] font-medium" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center font-black">
            <div className="bg-amber-50 border border-amber-100 p-1.5 rounded-xl">
              <span className="text-amber-600 block text-sm font-mono">{pendingCount}</span>
              <span className="text-[8px] text-gray-400 uppercase tracking-tight">Pending</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-xl">
              <span className="text-emerald-600 block text-sm font-mono">{deliveredCount}</span>
              <span className="text-[8px] text-gray-400 uppercase tracking-tight">Delivered</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-1.5 rounded-xl">
              <span className="text-indigo-600 block text-sm font-mono">₹{totalCashCollected.toLocaleString("en-IN")}</span>
              <span className="text-[8px] text-gray-400 uppercase tracking-tight">Collected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 pb-6 scrollbar-none bg-gray-50/50 space-y-2.5">
        {loading ? (
          <div className="text-center py-20 font-bold text-gray-400 animate-pulse">Loading Route Job Sheet...</div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isDelivered = order.status === "Delivered";
            const isCOD = order.paymentMode === "cod";
            const orderAmt = order.amount || order.totalAmount || 0;

            return (
              <div key={order._id} className={`bg-white rounded-2xl border p-3 shadow-sm flex flex-col gap-2.5 transition-all ${isDelivered ? "border-gray-100 opacity-75" : isCOD ? "border-red-100 shadow-red-50/20" : "border-blue-100"}`}>
                <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                  <div>
                    <h3 className="text-xs font-black text-gray-800 uppercase tracking-tight">{order.shopName}</h3>
                    <span className="text-[9px] font-mono font-bold text-gray-400 block mt-0.5">ID: #{order.orderId}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${isDelivered ? "bg-emerald-100 text-emerald-700 border-emerald-200" : isCOD ? "bg-red-100 text-red-700 border-red-200 animate-pulse" : "bg-blue-100 text-blue-700 border-blue-200"}`}>{isDelivered ? "DELIVERED" : isCOD ? "CASH ON DELIVERY" : "PAID & CONFIRMED"}</span>
                </div>

                <div className="bg-gray-50 p-2 rounded-xl space-y-1.5 border border-gray-100 max-h-24 overflow-y-auto scrollbar-none">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] font-bold text-gray-600">
                      <span>📦 {item.name}</span>
                      <span className="font-mono text-slate-800">
                        {item.qty} × <span className="text-[9px] text-gray-400">{item.packText || "Crate"}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1 mt-0.5">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Order Value</span>
                    <span className="text-sm font-black font-mono text-slate-800">₹{orderAmt.toLocaleString("en-IN")}</span>
                  </div>
                  {!isDelivered ? (
                    <button onClick={() => handleProcessDelivery(order)} className={`px-4 py-2 font-black text-[10px] rounded-xl shadow-sm uppercase tracking-wide transition ${isCOD ? "bg-red-600 hover:bg-red-700 text-white shadow-red-100" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100"}`}>
                      Complete Delivery →
                    </button>
                  ) : (
                    <div className="flex items-center text-emerald-600 font-black text-[10px] uppercase gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Delivered ✓</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white border border-dashed rounded-2xl border-gray-200">
            <Truck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">No Orders Scheduled for this Date!</span>
          </div>
        )}
      </div>
    </div>
  );
}
