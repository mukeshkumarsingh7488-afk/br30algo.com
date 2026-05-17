import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin, ShieldAlert, UserCheck, UserX, Trash2, Eye, Mail, Phone, Store, Layers, X, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ManageUser() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRouteFilter, setActiveRouteFilter] = useState("All Routes");

  const fetchLiveRetailersList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("sudha_token");
      const response = await axios.get(`${API_URL}/users/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.success) {
        setRetailers(response.data.data);
      }
    } catch (error) {
      console.error("❌ Fetch Retailers API Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRetailersList();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Blocked" : "Active";
    window.Swal.fire({
      title: `${nextStatus === "Blocked" ? "Block" : "Unblock"} Retailer Access?`,
      text: `Are you sure you want to change this storefront operational matrix?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: nextStatus === "Blocked" ? "#dc2626" : "#16a34a",
      confirmButtonText: `Yes, ${nextStatus}!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("sudha_token");
          const res = await axios.patch(
            `${API_URL}/users/toggle-status/${id}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.data && res.data.success) {
            await fetchLiveRetailersList();
            window.Swal.fire({
              title: "Status Updated!",
              text: `Retailer is now ${nextStatus}.`,
              icon: "success",
              timer: 1500,
            });
          }
        } catch (err) {
          window.Swal.fire({
            title: "Error",
            text: "Failed to toggle activation status.",
            icon: "error",
          });
        }
      }
    });
  };

  const handleDeleteRetailer = (id, shopName) => {
    window.Swal.fire({
      title: "Erase Retailer Account?",
      text: `Shop "${shopName}" data records will be wiped out from MongoDB Atlas!`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Permanently Erase",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("sudha_token");
          const res = await axios.delete(`${API_URL}/users/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data && res.data.success) {
            await fetchLiveRetailersList();
            window.Swal.fire({
              title: "Erased!",
              text: "Account permanently removed from grid.",
              icon: "success",
              timer: 1500,
            });
          }
        } catch (err) {
          window.Swal.fire({
            title: "Error",
            text: "Failed to erase retailer node.",
            icon: "error",
          });
        }
      }
    });
  };

  // 🎯 ⚡ [100% BRAND NEW HEADER LOCK]: स्टोर नाम के ठीक नीचे गाड़ी रूट और साफ़ #डेलर कोड बैज
  const openRetailerDocumentModal = (retailer) => {
    const previews = retailer.previews || {};
    const defaultPlaceholder = "🥛";

    const userLiveProfilePhoto = retailer.userProfilePic || retailer.photo || null;
    const userRegistrationPhoto = previews.photo || null;

    const rawAadhar = retailer.aadharNumber || "";
    const formattedAadhar = rawAadhar.length === 12 ? `${rawAadhar.slice(0, 4)}-${rawAadhar.slice(4, 8)}-${rawAadhar.slice(8, 12)}` : rawAadhar || "N/A";

    window.Swal.fire({
      title: null,
      html: `
        <div style="text-align: left; font-size: 12px; font-family: sans-serif; max-height: 75vh; overflow-y: auto; padding: 2px;" class="select-none scrollbar-none">
          
          <div style="display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; border: 2px solid #2563eb; background: #f8fafc; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              ${userLiveProfilePhoto ? `<img src="${userLiveProfilePhoto}" style="width:100%; height:100%; object-fit:cover;" />` : `<span style="font-size:18px; color:#94a3b8;">👤</span>`}
            </div>
            <div style="flex: 1; min-w: 0;">
              <h3 style="margin: 0; font-size: 14px; font-weight: 900; color: #0f172a; truncate">${retailer.shopName}</h3>
            <span style="font-size: 10px; font-weight: bold; color: #64748b; display: block; margin-top: 2px;">📍 Route: <span style="color:#0f172a; font-weight:800;">${retailer.route}</span> • Code: <span style="color:#2563eb; font-weight:900; font-size:11px;">#${retailer.dealerCode || "122534"}</span></span>
            </div>
          </div>

          <div style="background-color: #f0f7ff; border: 1px solid #bfdbfe; padding: 10px; border-radius: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-weight: 500; color: #334155; margin-bottom: 10px;">
            <p style="margin:0;">🏪 <b>Shop Name:</b> ${retailer.shopName}</p>
            <p style="margin:0;">👤 <b>Proprietor:</b> ${retailer.proprietor}</p>
            <p style="margin:0;">📞 <b>Mobile:</b> ${retailer.mobile}</p>
            <p style="margin:0;">📧 <b>Email:</b> <span style="font-size:11px; color:#2563eb; font-weight:600;">${retailer.email}</span></p>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; color: #475569; margin-bottom: 12px;">
            <span style="font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; grid-column: span 2; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; margin-bottom: 4px; letter-spacing: 0.05em;">Financial Parameters Registry</span>
            <p style="margin:0;">💳 <b>Aadhar Number:</b> <span style="font-family:monospace; font-weight:black; color:#0f172a; font-size:12px;">${formattedAadhar}</span></p>
            <p style="margin:0;">📇 <b>PAN Number:</b> <span style="font-family:monospace; font-weight:bold; text-transform:uppercase;">${retailer.panNumber || "N/A"}</span></p>
            <p style="margin:0;">🏦 <b>Bank Name:</b> ${retailer.bankName || "N/A"}</p>
            <p style="margin:0;">🔢 <b>Account No:</b> <span style="font-family:monospace; font-weight:bold;">${retailer.accountNumber || "N/A"}</span></p>
            <p style="margin:0; grid-column: span 2; border-top: 1px solid #f1f5f9; padding-top: 4px; margin-top: 2px;">🔠 <b>IFSC Code:</b> <span style="font-family:monospace; font-weight:900; color:#0f172a;">${retailer.ifscCode || "N/A"}</span></p>
          </div>

          <div style="max-height: 240px; overflow-y: auto; padding-right: 2px; border: 1px solid #f1f5f9; border-radius: 16px; padding: 8px; background: #fff;" class="scrollbar-none">
            <span style="font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 8px; letter-spacing: 0.05em;">📸 Verified KYC Document Scans</span>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
              
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; border-radius: 12px; text-align: center;">
                <span style="font-size:9px; font-weight:bold; color:#64748b; display:block; margin-bottom:4px;">Aadhar Front</span>
                <div style="width:100%; height:80px; background:white; border-radius:8px; display:flex; align-items:center; justify-content:center; border:1px solid #f1f5f9; overflow:hidden;">
                  ${previews.aadharFront ? `<img src="${previews.aadharFront}" onclick="window.open('${previews.aadharFront}', '_blank')" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:4px; cursor:zoom-in;" />` : `<span style="font-size:16px;">${defaultPlaceholder}</span>`}
                </div>
              </div>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; border-radius: 12px; text-align: center;">
                <span style="font-size:9px; font-weight:bold; color:#64748b; display:block; margin-bottom:4px;">Aadhar Back</span>
                <div style="width:100%; height:80px; background:white; border-radius:8px; display:flex; align-items:center; justify-content:center; border:1px solid #f1f5f9; overflow:hidden;">
                  ${previews.aadharBack ? `<img src="${previews.aadharBack}" onclick="window.open('${previews.aadharBack}', '_blank')" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:4px; cursor:zoom-in;" />` : `<span style="font-size:16px;">${defaultPlaceholder}</span>`}
                </div>
              </div>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; border-radius: 12px; text-align: center;">
                <span style="font-size:9px; font-weight:bold; color:#64748b; display:block; margin-bottom:4px;">PAN Card</span>
                <div style="width:100%; height:80px; background:white; border-radius:8px; display:flex; align-items:center; justify-content:center; border:1px solid #f1f5f9; overflow:hidden;">
                  ${previews.panCard ? `<img src="${previews.panCard}" onclick="window.open('${previews.panCard}', '_blank')" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:4px; cursor:zoom-in;" />` : `<span style="font-size:16px;">${defaultPlaceholder}</span>`}
                </div>
              </div>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; border-radius: 12px; text-align: center;">
                <span style="font-size:9px; font-weight:bold; color:#64748b; display:block; margin-bottom:4px;">Bank Cheque</span>
                <div style="width:100%; height:80px; background:white; border-radius:8px; display:flex; align-items:center; justify-content:center; border:1px solid #f1f5f9; overflow:hidden;">
                  ${previews.bankCheque ? `<img src="${previews.bankCheque}" onclick="window.open('${previews.bankCheque}', '_blank')" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:4px; cursor:zoom-in;" />` : `<span style="font-size:16px;">${defaultPlaceholder}</span>`}
                </div>
              </div>

              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px; border-radius: 12px; text-align: center; grid-column: span 2;">
                <span style="font-size:9px; font-weight:black; color:#16a34a; display:block; margin-bottom:4px;">👤 Registration Captured Photo (Previews System)</span>
                <div style="width:100%; height:110px; background:white; border-radius:8px; display:flex; align-items:center; justify-content:center; border:1px solid #dcfce7; overflow:hidden;">
                  ${userRegistrationPhoto ? `<img src="${userRegistrationPhoto}" onclick="window.open('${userRegistrationPhoto}', '_blank')" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:4px; cursor:zoom-in;" title="Click to open full registration scan" />` : `<span style="font-size:16px;">👤 No Registration Photo</span>`}
                </div>
              </div>

            </div>
          </div>

        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      htmlContainerClass: "p-0",
      customClass: { popup: "rounded-3xl p-5 max-w-md" },
    });
  };

  const filteredRetailers = retailers.filter((ret) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = ret.shopName.toLowerCase().includes(search) || ret.proprietor.toLowerCase().includes(search) || (ret.dealerCode && ret.dealerCode.includes(search));
    const matchesRoute = activeRouteFilter === "All Routes" ? true : ret.route === activeRouteFilter;
    return matchesSearch && matchesRoute && ret.role !== "admin";
  });

  const routesMenu = ["All Routes", "Parihar Route", "Sonbarsa Route"];
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm select-none max-w-5xl mx-auto text-xs max-h-[calc(100vh-32px)] overflow-y-auto scrollbar-none flex flex-col h-full">
      {/* Tools Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 mb-3 gap-3 flex-shrink-0">
        <div>
          <h2 className="text-sm font-black text-gray-800">Manage Retailer Users</h2>
          <p className="text-gray-400 text-[10px] mt-0.5">Live MongoDB Cloud Connected Verification & Route Control Panel</p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto max-w-md">
          <select value={activeRouteFilter} onChange={(e) => setActiveRouteFilter(e.target.value)} className="px-2.5 py-1.5 border border-gray-300 rounded-xl outline-none bg-white font-bold text-gray-700 text-xs shadow-sm focus:ring-2 focus:ring-blue-500 flex-shrink-0">
            {routesMenu.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input type="text" placeholder="Search by shop, owner or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-8 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs outline-none transition font-medium shadow-sm" />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                <X className="w-4 h-4 bg-gray-100 p-0.5 rounded-full" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main RegistSry Sheets Grid Table Layout */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 flex-1 overflow-y-auto scrollbar-none bg-white">
        <table className="w-full text-left border-collapse text-xs table-fixed">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm border-b">
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-3 w-1/3">Shop Details</th>
              <th className="p-3 w-1/4">Proprietor</th>
              <th className="p-3 w-1/5">Sudha Code</th>
              <th className="p-3 w-1/4">Route</th>
              <th className="p-3 w-1/5">Status</th>
              <th className="p-3 w-1/4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {filteredRetailers.map((retailer) => {
              const isActive = retailer.status === "Active";

              return (
                <tr key={retailer._id || retailer.id} className="hover:bg-gray-50/80 transition">
                  <td className="p-3 font-bold text-gray-800 truncate">
                    <div className="flex items-start space-x-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-0.5 flex-shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-gray-800 text-xs font-black truncate">{retailer.shopName}</span>
                        <span className="text-[10px] text-gray-400 font-bold font-mono mt-0.5 flex items-center gap-0.5">
                          <Phone className="w-3 h-3 text-gray-300" /> {retailer.mobile}
                        </span>
                        <span className="text-[9px] text-blue-500 font-bold lowercase truncate mt-0.5 flex items-center gap-0.5" title={retailer.email}>
                          <Mail className="w-3 h-3 text-blue-300 flex-shrink-0" /> {retailer.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 font-bold text-slate-700 truncate">{retailer.proprietor}</td>
                  <td className="p-3 font-mono font-black text-indigo-600">#{retailer.dealerCode || "N/A"}</td>
                  <td className="p-3 font-semibold text-slate-500 flex items-center space-x-1 h-full mt-2.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{retailer.route}</span>
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>{retailer.status}</span>
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5 h-full mt-0.5">
                      <button type="button" onClick={() => openRetailerDocumentModal(retailer)} className="p-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm" title="View Full Profile KYC">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => handleToggleStatus(retailer._id || retailer.id, retailer.status)} className={`p-1.5 border rounded-lg transition shadow-sm ${isActive ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"}`} title={isActive ? "Block Account Access" : "Activate Account Access"}>
                        {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                      <button type="button" onClick={() => handleDeleteRetailer(retailer._id || retailer.id, retailer.shopName)} className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition shadow-sm" title="Delete Retailer Node">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredRetailers.length === 0 && (
        <div className="text-center py-10 text-gray-400 font-semibold bg-gray-50 rounded-xl mt-3 border border-dashed border-gray-200 flex-1 flex flex-col items-center justify-center">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <span>No retailer users accounts registered matching current criteria filters!</span>
        </div>
      )}
    </div>
  );
}
