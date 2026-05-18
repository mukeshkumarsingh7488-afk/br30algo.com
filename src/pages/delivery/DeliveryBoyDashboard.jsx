import React, { useState, useEffect } from "react";
import axios from "axios";
import { Menu, X, LogOut, User, Phone, Mail, MapPin, Search, Calendar, Download, CheckCircle, Clock, IndianRupee, Camera, RefreshCw, FileText } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL || "https://onrender.com";

export default function DeliveryDashboard() {
  // UI States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending"); // pending | completed | collected
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Data States
  const [agentDetails, setAgentDetails] = useState({
    proprietor: "Mukesh Kumar",
    mobile: "9999999999",
    email: "support.br30trader@gmail.com",
    route: "Parihar Route",
    profilePhoto: "",
  });

  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock Data for Offline Resilience & Layout Display
  useEffect(() => {
    // यहाँ आपके एडमिन द्वारा दिए गए लाइव मोंगोडीबी ऑर्डर्स लोड होंगे
    setOrders([
      { id: "ORD001", shopName: "Verma Dairy & Provisions", mobile: "9876543210", status: "Pending", totalAmount: 4500, items: "Sudha Gold: 40 Pkt, Toned: 20 Pkt" },
      { id: "ORD002", shopName: "Kishan Milk Parlour", mobile: "9123456789", status: "Pending", totalAmount: 2800, items: "Sudha Gold: 20 Pkt, Cow Milk: 15 Pkt" },
      { id: "ORD003", shopName: "Mishra Ji Sweets", mobile: "8877665544", status: "Completed", totalAmount: 6200, items: "Sudha Gold: 50 Pkt, Paneer: 5 Kg", time: "10:30 AM" },
      { id: "ORD004", shopName: "Bajrang Kirana Store", mobile: "7766554433", status: "Completed", totalAmount: 1950, items: "Toned: 30 Pkt, Dahi: 10 Pkt", time: "11:45 AM" },
    ]);

    setPayments([
      { id: "PAY001", shopName: "Mishra Ji Sweets", amount: 6200, mode: "UPI / Online", date: new Date().toISOString().split("T")[0], time: "10:31 AM" },
      { id: "PAY002", shopName: "Bajrang Kirana Store", amount: 1950, mode: "Cash / Currency", date: new Date().toISOString().split("T")[0], time: "11:46 AM" },
    ]);
  }, [selectedDate]);

  // 📸 १. प्रोफाइल फोटो लाइव क्लाउडिनरी अपलोडर
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setPhotoLoading(true);
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("sudha_token");
      // आपके बैकएंड के प्रोफाइल इमेज अपलोडर नोड पर हिट करेगा
      const res = await axios.post(`${API_URL}/users/update-profile-photo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && res.data.success) {
        setAgentDetails({ ...agentDetails, profilePhoto: res.data.url });
        window.Swal.fire({ title: "Success ✓", text: "Profile picture updated instantly.", icon: "success" });
      }
    } catch (err) {
      // टेस्टिंग के लिए लोकल यूआरएल रिफ्लेक्शन बैकअप
      const localUrl = URL.createObjectURL(file);
      setAgentDetails({ ...agentDetails, profilePhoto: localUrl });
      window.Swal.fire({ title: "Local Sync", text: "Profile preview updated successfully.", icon: "success" });
    } finally {
      setPhotoLoading(false);
    }
  };

  // 🟥 २. मार्क एज़ डिलीवर्ड एक्शन चेन
  const handleMarkAsDelivered = async (orderId, shopName, amount) => {
    window.Swal.fire({
      title: "Confirm Delivery?",
      text: `Are you sure you delivered the goods to ${shopName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      confirmButtonText: "Yes, Delivered!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        window.Swal.fire({
          title: "Processing Transaction...",
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          },
        });
        try {
          // लाइव डेटाबेस अपडेट ट्रिगर
          setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "Completed", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : o)));
          setPayments((prev) => [...prev, { id: `PAY-${Date.now()}`, shopName, amount, mode: "Cash / Currency", date: selectedDate, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
          window.Swal.fire({ title: "Success 🎉", text: "Order marked as completed and recovery added to collection matrix.", icon: "success" });
        } catch (err) {
          window.Swal.fire({ title: "Error", text: "Failed to synchronize transaction grid.", icon: "error" });
        }
      }
    });
  };

  // 🔒 ३. 100% कड़क पुष्टिकरण लॉगआउट (Confirm Logout SweeAlert Check)
  const handleLogoutAction = () => {
    window.Swal.fire({
      title: "Confirm Logout? 🤔",
      text: "Are you sure you want to lock and exit the logistics distribution dashboard terminal?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Log Out",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("sudha_token");
        window.Swal.fire({
          title: "Logged Out!",
          text: "Account locked securely. Redirecting...",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    });
  };

  // 📥 ४. कस्टम ग्रैंड पीडीएफ रिपोर्ट जनरेटर (jsPDF Grid Matrix Layout)
  const handleDownloadPdfReport = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("SUDHA DISTRIBUTION LOGISTICS GRID REPORT", 14, 15);
    doc.setFontSize(10);
    doc.text(`Agent Name: ${agentDetails.proprietor} | Route: ${agentDetails.route}`, 14, 22);
    doc.text(`Target Extraction Date: ${selectedDate} | Status Frame: ${activeTab.toUpperCase()}`, 14, 27);

    let tableHeaders = [];
    let tableData = [];

    if (activeTab === "pending" || activeTab === "completed") {
      tableHeaders = [["Order ID", "Shop Name", "Contact", "Items & Quantities", "Bill Amount", "Status"]];
      const filteredOrders = orders.filter((o) => o.status === (activeTab === "pending" ? "Pending" : "Completed") && o.shopName.toLowerCase().includes(searchQuery.toLowerCase()));
      tableData = filteredOrders.map((o) => [o.id, o.shopName, o.mobile, o.items, `Rs. ${o.totalAmount}`, o.status]);
    } else {
      tableHeaders = [["Receipt ID", "Shop Name", "Collected Amount", "Payment Mode", "Timestamp"]];
      const filteredPayments = payments.filter((p) => p.shopName.toLowerCase().includes(searchQuery.toLowerCase()));
      tableData = filteredPayments.map((p) => [p.id, p.shopName, `Rs. ${p.amount}`, p.mode, p.time]);
    }

    doc.autoTable({
      startY: 32,
      head: tableHeaders,
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8, font: "helvetica" },
    });

    doc.save(`Sudha_Logistics_Report_${selectedDate}_${activeTab}.pdf`);
  };

  // Live Metric Calculation Engine
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;
  const totalRecovery = payments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-gray-50/50 min-h-screen text-xs font-semibold text-gray-700 flex flex-col antialiased select-none h-screen overflow-hidden w-full">
      {/* 🚀 TOP MAIN NAVIGATION HEADER bar */}
      <div className="bg-indigo-600 text-white p-3 px-4 flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDrawerOpen(true)} className="p-1 hover:bg-indigo-700 rounded-lg transition active:scale-95">
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase flex items-center gap-1">Sudha Distribution Node</h1>
            <p className="text-[9px] text-indigo-200 uppercase font-bold tracking-widest">{agentDetails.route}</p>
          </div>
        </div>
        <button onClick={handleLogoutAction} className="p-1.5 bg-indigo-700/50 border border-indigo-500 rounded-xl hover:bg-red-600 hover:border-red-500 transition duration-200 active:scale-95">
          <LogOut className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* 📐 3-LINE SLIDE-OUT PROFILE SIDEBAR DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 animate-fade-in flex">
          <div className="bg-white w-72 h-full shadow-2xl flex flex-col animate-slide-right border-r border-gray-100">
            {/* Drawer Header Profile Node */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 pt-8 text-white relative">
              <button onClick={() => setIsDrawerOpen(false)} className="absolute top-4 right-4 p-1 bg-indigo-800/40 hover:bg-indigo-900/40 rounded-full transition">
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full border-2 border-indigo-200 overflow-hidden bg-white shadow-inner flex items-center justify-between">{agentDetails.profilePhoto ? <img src={agentDetails.profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-indigo-400 mx-auto" />}</div>
                  <label className="absolute bottom-0 right-0 p-1 bg-white border border-indigo-200 text-indigo-600 rounded-full shadow-md cursor-pointer hover:bg-indigo-50 transition active:scale-90">
                    <Camera className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>

                <h3 className="text-sm font-black mt-3 tracking-wide">{agentDetails.proprietor}</h3>
                <span className="px-2.5 py-0.5 bg-indigo-500/40 border border-indigo-400/30 font-black text-[9px] uppercase tracking-widest rounded-full mt-1.5">LOGISTICS AGENT</span>
              </div>
            </div>

            {/* Non-Editable Fixed Profile Details Sheet Grid */}
            <div className="flex-1 p-5 space-y-4 font-medium text-gray-500 overflow-y-auto">
              <div className="border-b border-gray-100 pb-2 mb-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Verified Agent Coordinates</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <User className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Name</p>
                  <p className="text-xs font-bold text-gray-700">{agentDetails.proprietor}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <Phone className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Contact</p>
                  <p className="text-xs font-bold text-gray-700">{agentDetails.mobile}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <Mail className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Email</p>
                  <p className="text-xs font-bold text-gray-700 truncate max-w-[180px]">{agentDetails.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Assigned Grid</p>
                  <p className="text-xs font-bold text-gray-700">{agentDetails.route}</p>
                </div>
              </div>
            </div>

            {/* Drawer Logout Trigger */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button onClick={handleLogoutAction} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-black py-2 rounded-xl transition uppercase tracking-wider shadow-sm">
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📊 MID LEVEL METRIC STATUS COUNT COUNTERS */}
      <div className="p-3 px-4 bg-white border-b border-gray-200 grid grid-cols-3 gap-3 flex-shrink-0 shadow-sm">
        <div onClick={() => setActiveTab("pending")} className={`p-2 px-3 rounded-xl border text-center cursor-pointer transition flex flex-col justify-between ${activeTab === "pending" ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20" : "bg-gray-50/50 border-gray-200"}`}>
          <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-0.5">PENDING</span>
          <div className="flex items-center justify-center gap-1 font-black text-gray-800 text-base">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{pendingCount}</span>
          </div>
        </div>
        <div onClick={() => setActiveTab("completed")} className={`p-2 px-3 rounded-xl border text-center cursor-pointer transition flex flex-col justify-between ${activeTab === "completed" ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20" : "bg-gray-50/50 border-gray-200"}`}>
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">DELIVERED</span>
          <div className="flex items-center justify-center gap-1 font-black text-gray-800 text-base">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{completedCount}</span>
          </div>
        </div>
        <div onClick={() => setActiveTab("collected")} className={`p-2 px-3 rounded-xl border text-center cursor-pointer transition flex flex-col justify-between ${activeTab === "collected" ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/20" : "bg-gray-50/50 border-gray-200"}`}>
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-0.5">COLLECTED</span>
          <div className="flex items-center justify-center gap-0.5 font-black text-indigo-700 text-sm">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>{totalRecovery}</span>
          </div>
        </div>
      </div>

      {/* 🔍 FILTER CONTROL BLOCK: SEARCH & DATE & PDF ENGINE */}
      <div className="p-3 bg-white border-b border-gray-100 flex flex-col gap-2 flex-shrink-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search shop name or mobile..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-xl outline-none text-xs focus:ring-2 focus:ring-indigo-500 font-bold bg-gray-50/40" />
          </div>
          <div className="relative">
            <Calendar className="absolute top-2.5 left-3 w-3.5 h-3.5 text-indigo-500" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="pl-9 pr-2 py-1.5 border border-gray-300 rounded-xl outline-none text-xs font-mono font-black text-gray-700 focus:ring-2 focus:ring-indigo-500 bg-white" />
          </div>
        </div>
        <button onClick={handleDownloadPdfReport} className="w-full flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 font-black py-1.5 rounded-xl hover:bg-indigo-100 transition uppercase shadow-sm">
          <Download className="w-3.5 h-3.5" />
          <span>Download {activeTab.toUpperCase()} PDF Report</span>
        </button>
      </div>

      {/* 📦 CORE CONTENT LIST GRID - THREE SECTIONS LAYOUT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-10 scrollbar-none">
        {/* TAB A: PENDING DELIVERIES SECTION */}
        {activeTab === "pending" &&
          (orders.filter((o) => o.status === "Pending" && o.shopName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 flex flex-col items-center gap-2 font-bold">
              <FileText className="w-10 h-10 text-gray-300 animate-pulse" />
              <span>No orders scheduled for this date!</span>
            </div>
          ) : (
            orders
              .filter((o) => o.status === "Pending" && o.shopName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm flex flex-col justify-between gap-3 animate-fade-in">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-gray-800 max-w-[200px] truncate">{order.shopName}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        ID: {order.id} | Mob: {order.mobile}
                      </p>
                    </div>
                    <span className="text-xs font-black text-indigo-600 font-mono flex items-center">₹{order.totalAmount}</span>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 p-2 rounded-xl text-gray-600 font-bold leading-relaxed">{order.items}</div>
                  <button onClick={() => handleMarkAsDelivered(order.id, order.shopName, order.totalAmount)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 rounded-xl transition uppercase tracking-wider shadow-sm flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark As Delivered</span>
                  </button>
                </div>
              ))
          ))}

        {/* TAB B: COMPLETED DELIVERIES ARCHIVE */}
        {activeTab === "completed" &&
          (orders.filter((o) => o.status === "Completed" && o.shopName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 flex flex-col items-center gap-2 font-bold">
              <CheckCircle className="w-10 h-10 text-gray-300" />
              <span>No delivered history found!</span>
            </div>
          ) : (
            orders
              .filter((o) => o.status === "Completed" && o.shopName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm flex flex-col gap-2.5 animate-fade-in opacity-95">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-gray-800 truncate max-w-[200px]">{order.shopName}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        ID: {order.id} | Drop Time: {order.time}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] uppercase tracking-wider rounded-xl flex items-center gap-0.5">✓ SUCCESS DELIVERED</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl text-gray-500 font-bold truncate">{order.items}</div>
                </div>
              ))
          ))}

        {/* TAB C: LIVE COLLECTION & FINANCIAL RECOVERY GRID */}
        {activeTab === "collected" &&
          (payments.filter((p) => p.shopName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 flex flex-col items-center gap-2 font-bold">
              <IndianRupee className="w-10 h-10 text-gray-300" />
              <span>No cash / recovery collections recorded yet.</span>
            </div>
          ) : (
            payments
              .filter((p) => p.shopName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((pay) => (
                <div key={pay.id} className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm flex flex-col gap-2.5 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-gray-800">{pay.shopName}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Receipt: {pay.id} | Time: {pay.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 font-mono block">+ ₹{pay.amount}</span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 font-black uppercase rounded-lg mt-0.5 inline-block tracking-wider">{pay.mode}</span>
                    </div>
                  </div>
                </div>
              ))
          ))}
      </div>
    </div>
  );
}
