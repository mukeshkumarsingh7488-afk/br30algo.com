import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Menu, X, LogOut, User, Phone, Mail, MapPin, Search, Calendar, Download, CheckCircle, Clock, IndianRupee, Camera, RefreshCw, FileText } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://onrender.com";

export default function DeliveryDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const drawerRef = useRef(null);

  const [agentDetails, setAgentDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsDrawerOpen(false);
      }
    }
    if (isDrawerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawerOpen]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("sudha_token");

      const profileRes = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.data?.success) {
        setAgentDetails(profileRes.data.user || profileRes.data.data);
      }

      const ordersRes = await axios.get(`${API_URL}/orders/delivery-grid?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ordersRes.data?.success) {
        setOrders(ordersRes.data.orders || []);
        setPayments(ordersRes.data.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const handlePhotoChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setPhotoLoading(true);
      const formData = new FormData();
      formData.append("profilePhoto", files[0]);

      const token = localStorage.getItem("sudha_token");
      const res = await axios.post(`${API_URL}/users/update-profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        setAgentDetails((prev) => ({
          ...prev,
          profilePhoto: res.data.url || res.data.user?.profilePhoto,
        }));
        window.Swal.fire({ title: "Success ✓", text: "Profile picture saved inside database.", icon: "success" });
        fetchDashboardData();
      }
    } catch (err) {
      window.Swal.fire({ title: "Upload Failed", text: err.response?.data?.message || "Server upload synchronization error.", icon: "error" });
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleMarkAsDelivered = async (orderId, shopName, amount) => {
    window.Swal.fire({
      title: "Confirm Delivery? 🤔",
      text: `Are you sure you delivered the goods to ${shopName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      confirmButtonText: "Yes, Delivered!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        window.Swal.fire({
          title: "Updating Database...",
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          },
        });
        try {
          const token = localStorage.getItem("sudha_token");
          const res = await axios.post(
            `${API_URL}/orders/mark-delivered`,
            { orderId, amount },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.data?.success) {
            window.Swal.fire({ title: "Success 🎉", text: "Order shifted to completed grid.", icon: "success" });
            fetchDashboardData();
          }
        } catch (err) {
          window.Swal.fire({ title: "Failed", text: "Database synchronization error.", icon: "error" });
        }
      }
    });
  };

  const handleLogoutAction = () => {
    window.Swal.fire({
      title: "Confirm Logout? ⚠️",
      text: "Are you sure you want to exit the logistics distribution node terminal?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Log Out",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("sudha_token");
        window.location.href = "/login";
      }
    });
  };

  const handleDownloadPdfReport = () => {
    const printWindow = window.open("", "_blank");
    let reportRowsHtml = "";

    const filteredOrders = orders.filter((o) => o.status === (activeTab === "pending" ? "Pending" : "Completed") && o.shopName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredPayments = payments.filter((p) => p.shopName?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === "pending" || activeTab === "completed") {
      filteredOrders.forEach((o) => {
        reportRowsHtml += `<tr><td>${o.id || o._id || "N/A"}</td><td>${o.shopName}</td><td>${o.mobile}</td><td>${o.items || "Standard Pack"}</td><td>₹${o.totalAmount}</td><td>${o.status}</td></tr>`;
      });
    } else {
      filteredPayments.forEach((p) => {
        reportRowsHtml += `<tr><td>${p.id || p._id || "N/A"}</td><td>${p.shopName}</td><td>₹${p.amount}</td><td>${p.mode || "Cash"}</td><td>${p.time || "N/A"}</td></tr>`;
      });
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Sudha Dairy Logistics Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #333; }
            h2 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 8px; text-transform: uppercase; }
            .meta { font-size: 13px; margin: 15px 0; color: #555; font-weight: bold; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; font-size: 12px; }
            th { background-color: #4f46e5; color: white; }
            tr:nth-child(even) { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <h2>Sudha Distribution Logistics Grid Report</h2>
          <div class="meta">
            <strong>Agent Name:</strong> ${agentDetails?.proprietor || "Logistics Agent"} &nbsp;|&nbsp; <strong>Route:</strong> ${agentDetails?.route || "All Routes"}<br/>
            <strong>Target Date:</strong> ${selectedDate} &nbsp;|&nbsp; <strong>Segment Status:</strong> ${activeTab.toUpperCase()}
          </div>
          <table>
            <thead>
              ${activeTab !== "collected" ? "<tr><th>Order ID</th><th>Shop Name</th><th>Contact</th><th>Items Grid</th><th>Bill Amount</th><th>Status</th></tr>" : "<tr><th>Receipt ID</th><th>Shop Name</th><th>Collected Amount</th><th>Payment Mode</th><th>Timestamp</th></tr>"}
            </thead>
            <tbody>
              ${reportRowsHtml || '<tr><td colspan="6" style="text-align:center; color: #999;">No secure matrix entries found for this date.</td></tr>'}
            </tbody>
          </table>
          <script>window.print(); setTimeout(() => { window.close(); }, 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;
  const totalRecovery = payments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-gray-100 min-h-screen font-semibold text-gray-700 flex flex-col antialiased select-none max-w-md mx-auto relative border-x border-gray-200 shadow-xl h-screen overflow-hidden w-full">
      <div className="bg-indigo-600 text-white p-3 px-4 flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDrawerOpen(true)} className="p-1.5 hover:bg-indigo-700 rounded-xl transition active:scale-95">
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xs font-black tracking-wider uppercase">Sudha Distribution Node</h1>
            <p className="text-[9px] text-indigo-200 uppercase font-bold tracking-widest">{agentDetails?.route || "Loading Grid..."}</p>
          </div>
        </div>
        <button onClick={handleLogoutAction} className="p-1.5 bg-indigo-700/50 border border-indigo-500 rounded-xl hover:bg-red-600 hover:border-red-500 transition duration-200 active:scale-95">
          <LogOut className="w-4 h-4 text-white" />
        </button>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex animate-fade-in">
          <div ref={drawerRef} className="bg-white w-72 h-full shadow-2xl flex flex-col border-r border-gray-100 animate-slide-right">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 pt-8 text-white relative">
              <button onClick={() => setIsDrawerOpen(false)} className="absolute top-4 right-4 p-1.5 bg-indigo-800/40 hover:bg-indigo-900/40 rounded-full transition">
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-indigo-200 overflow-hidden bg-white shadow-inner flex items-center justify-center">{photoLoading ? <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" /> : agentDetails?.profilePhoto ? <img src={agentDetails.profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-indigo-400" />}</div>
                  <label className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 text-indigo-600 rounded-full shadow-md cursor-pointer hover:bg-indigo-50 transition active:scale-90">
                    <Camera className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
                <h3 className="text-xs font-black mt-3 tracking-wide truncate max-w-[200px]">{agentDetails?.proprietor || "Loading Name..."}</h3>
                <span className="px-2.5 py-0.5 bg-indigo-500/40 border border-indigo-400/30 font-black text-[8px] uppercase tracking-widest rounded-full mt-1.5">LOGISTICS AGENT</span>
              </div>
            </div>

            <div className="flex-1 p-5 space-y-4 font-medium text-gray-500 overflow-y-auto scrollbar-none">
              <span className="text-[9px] font-black text-gray-400 uppercase block border-b border-gray-100 pb-2 tracking-widest">Verified Coordinate Fields</span>
              <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <User className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-[8px] text-gray-400 font-bold uppercase">Full Name</p>
                  <p className="text-xs font-black text-gray-700">{agentDetails?.proprietor || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <Phone className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-[8px] text-gray-400 font-bold uppercase">Mobile Endpoint</p>
                  <p className="text-xs font-black text-gray-700">{agentDetails?.mobile || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <Mail className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-[8px] text-gray-400 font-bold uppercase">Secure Email</p>
                  <p className="text-xs font-black text-gray-700 truncate max-w-[170px]">{agentDetails?.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-[8px] text-gray-400 font-bold uppercase">Assigned Grid</p>
                  <p className="text-xs font-black text-gray-700">{agentDetails?.route || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button onClick={handleLogoutAction} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 font-black py-2 rounded-xl uppercase tracking-wider text-[10px] shadow-sm">
                <LogOut className="w-3.5 h-3.5" />
                <span>Terminate Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 px-4 bg-white border-b border-gray-200 grid grid-cols-3 gap-3 flex-shrink-0 shadow-sm">
        <div onClick={() => setActiveTab("pending")} className={`p-2 px-3 rounded-xl border text-center cursor-pointer transition flex flex-col justify-between ${activeTab === "pending" ? "bg-amber-50 border-amber-300 ring-4 ring-amber-400/10" : "bg-gray-50/50 border-gray-200"}`}>
          <span className="text-[8px] font-black text-amber-600 uppercase block mb-0.5 tracking-wider">PENDING</span>
          <div className="flex items-center justify-center gap-1 font-black text-gray-800 text-sm">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{pendingCount}</span>
          </div>
        </div>
        <div onClick={() => setActiveTab("completed")} className={`p-2 px-3 rounded-xl border text-center cursor-pointer transition flex flex-col justify-between ${activeTab === "completed" ? "bg-emerald-50 border-emerald-300 ring-4 ring-emerald-400/10" : "bg-gray-50/50 border-gray-200"}`}>
          <span className="text-[8px] font-black text-emerald-600 uppercase block mb-0.5 tracking-wider">DELIVERED</span>
          <div className="flex items-center justify-center gap-1 font-black text-gray-800 text-sm">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>{completedCount}</span>
          </div>
        </div>
        <div onClick={() => setActiveTab("collected")} className={`p-2 px-3 rounded-xl border text-center cursor-pointer transition flex flex-col justify-between ${activeTab === "collected" ? "bg-indigo-50 border-indigo-300 ring-4 ring-indigo-400/10" : "bg-gray-50/50 border-gray-200"}`}>
          <span className="text-[8px] font-black text-indigo-600 uppercase block mb-0.5 tracking-wider">COLLECTED</span>
          <div className="flex items-center justify-center gap-0.5 font-black text-indigo-700 text-xs">
            <IndianRupee className="w-3 h-3" />
            <span>{totalRecovery}</span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-white border-b border-gray-200 flex flex-col gap-2 flex-shrink-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search shop..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-xl text-xs font-bold bg-gray-50/40 outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="relative">
            <Calendar className="absolute top-2.5 left-3 w-3.5 h-3.5 text-indigo-500" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="pl-9 pr-2 py-1.5 border border-gray-300 rounded-xl text-xs font-mono font-black text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
          </div>
        </div>
        <button onClick={handleDownloadPdfReport} className="w-full flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 font-black py-2 rounded-xl uppercase text-[9px] shadow-sm tracking-wider hover:bg-indigo-100 transition duration-150">
          <Download className="w-3.5 h-3.5" />
          <span>Print / Download {activeTab.toUpperCase()} Matrix Report</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-12 scrollbar-none">
        {loading ? (
          <div className="text-center py-12 text-gray-400 font-bold flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Synchronizing database files...</span>
          </div>
        ) : (
          <>
            {activeTab === "pending" &&
              (orders.filter((o) => o.status === "Pending" && o.shopName?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 font-bold">No allocations found for this date.</div>
              ) : (
                orders
                  .filter((o) => o.status === "Pending" && o.shopName?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((order) => (
                    <div key={order.id || order._id} className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <div>
                          <h4 className="text-xs font-black text-gray-800 max-w-[240px] truncate">{order.shopName}</h4>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            Node: {order.id || "N/A"} | Mob: {order.mobile}
                          </p>
                        </div>
                        <span className="text-xs font-black text-indigo-600 font-mono flex items-center">₹{order.totalAmount}</span>
                      </div>
                      <div className="bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl text-gray-600 font-bold text-[11px] leading-relaxed">{order.items || "Standard Milk Packs Loading..."}</div>
                      <button onClick={() => handleMarkAsDelivered(order.id, order.shopName, order.totalAmount)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 rounded-xl text-[10px] uppercase shadow-sm flex items-center justify-center gap-1 transition tracking-wider">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark As Delivered</span>
                      </button>
                    </div>
                  ))
              ))}

            {activeTab === "completed" &&
              (orders.filter((o) => o.status === "Completed" && o.shopName?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 font-bold">No historical data matches.</div>
              ) : (
                orders
                  .filter((o) => o.status === "Completed" && o.shopName?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((order) => (
                    <div key={order.id || order._id} className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm flex flex-col gap-2.5">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <div>
                          <h4 className="text-xs font-black text-gray-800 truncate max-w-[200px]">{order.shopName}</h4>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            Drop Code: {order.id || "N/A"} | Time: {order.time || "Done"}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[8px] uppercase rounded-xl tracking-wider">✓ SUCCESS DELIVERED</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-xl text-gray-500 font-bold text-[11px] truncate">{order.items || "Packs Logged"}</div>
                    </div>
                  ))
              ))}

            {activeTab === "collected" &&
              (payments.filter((p) => p.shopName?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 font-bold">Zero collection matrix logs available.</div>
              ) : (
                payments
                  .filter((p) => p.shopName?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((pay) => (
                    <div key={pay.id || pay._id} className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black text-gray-800">{pay.shopName}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Receipt ID: {pay.id || "N/A"} | Stamp: {pay.time || "Logged"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 font-mono block">+ ₹{pay.amount}</span>
                        <span className="text-[8px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 font-black uppercase rounded-lg mt-0.5 inline-block tracking-wider">{pay.mode || "Cash Grid"}</span>
                      </div>
                    </div>
                  ))
              ))}
          </>
        )}
      </div>
    </div>
  );
}
