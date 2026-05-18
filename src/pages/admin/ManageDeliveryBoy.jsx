import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin, ShieldAlert, UserCheck, UserX, Trash2, Mail, Phone, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ManageDeliveryBoy() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRouteFilter, setActiveRouteFilter] = useState("All Routes");

  const fetchLiveAgentsList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("sudha_token");
      const response = await axios.get(`${API_URL}/users/list?role=delivery_boy`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.success) {
        setAgents(response.data.data || []);
      }
    } catch (error) {
      console.error("❌ Fetch Agents API Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAgentsList();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Blocked" : "Active";
    window.Swal.fire({
      title: `${nextStatus === "Blocked" ? "Block" : "Unblock"} Agent Access?`,
      text: `Are you sure you want to change this logistics operational matrix?`,
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
            await fetchLiveAgentsList();
            window.Swal.fire({ title: "Status Updated!", text: `Agent is now ${nextStatus}.`, icon: "success", timer: 1500 });
          }
        } catch (err) {
          window.Swal.fire({ title: "Error", text: "Failed to toggle status.", icon: "error" });
        }
      }
    });
  };

  const handleDeleteAgent = (id, proprietor) => {
    window.Swal.fire({
      title: "Erase Agent Account?",
      text: `Agent "${proprietor}" data records will be wiped out from MongoDB Atlas!`,
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
            await fetchLiveAgentsList();
            window.Swal.fire({ title: "Erased!", text: "Account permanently removed.", icon: "success", timer: 1500 });
          }
        } catch (err) {
          window.Swal.fire({ title: "Error", text: "Failed to erase agent node.", icon: "error" });
        }
      }
    });
  };

  const filteredAgents = agents.filter((u) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = u.proprietor?.toLowerCase().includes(search) || u.mobile?.includes(search) || u.email?.toLowerCase().includes(search);

    const matchesRoute = activeRouteFilter === "All Routes" ? true : u.route === activeRouteFilter;
    return matchesSearch && matchesRoute;
  });

  const routesMenu = ["All Routes", "Parihar Route", "Sonbarsa Route"];

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm select-none max-w-5xl mx-auto text-xs h-[calc(100vh-32px)] flex flex-col overflow-hidden w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 mb-3 gap-3 flex-shrink-0">
        <div>
          <h2 className="text-sm font-black text-gray-800">Manage Delivery Agents</h2>
          <p className="text-gray-400 text-[10px] mt-0.5">Control Vehicle Boys, Tracking Profiles and Delivery Network Operation Locks</p>
        </div>
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input type="text" placeholder="Search agent name, mobile or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs outline-none font-medium shadow-sm" />
        </div>
      </div>

      <div className="flex items-center space-x-1 overflow-x-auto pb-2 border-b border-gray-100/60 mb-3 scrollbar-none flex-shrink-0">
        {routesMenu.map((route) => (
          <button key={route} onClick={() => setActiveRouteFilter(route)} className={`px-3 py-1 rounded-xl text-[9px] font-black border transition-all flex-shrink-0 ${activeRouteFilter === route ? "bg-indigo-600 border-indigo-600 text-white shadow-md" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
            {route}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 font-bold text-gray-400 animate-pulse flex-1 flex items-center justify-center">Fetching logistics registries...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 flex-1 overflow-y-auto scrollbar-none bg-white max-h-[calc(100vh-250px)] w-full max-w-full">
          <table className="w-full text-left border-collapse text-xs table-fixed">
            <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm border-b">
              <tr className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3 w-2/5">Agent Master Identity</th>
                <th className="p-3 w-1/4">Contact Parameters</th>
                <th className="p-3 w-1/4">Assigned Vehicle Route</th>
                <th className="p-3 w-1/6">Status</th>
                <th className="p-3 w-1/4 text-center">Operation Locks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredAgents.map((u) => {
                const isUserActive = u.status === "Active" || !u.status;
                return (
                  <tr key={u._id || u.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3 font-bold text-gray-800 truncate">
                      <div className="flex items-center space-x-3 truncate">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 border rounded-xl flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">{u.proprietor ? u.proprietor.charAt(0).toUpperCase() : "🚚"}</div>
                        <div className="truncate flex flex-col">
                          <span className="text-gray-800 text-xs font-black truncate">🚚 Official Agent</span>
                          <span className="text-[10px] text-gray-400 font-bold mt-0.5 truncate flex items-center gap-0.5">
                            <User className="w-3 h-3 text-gray-300" />
                            <span>Name: {u.proprietor}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 truncate">
                      <div className="flex flex-col font-mono text-[10px] font-bold text-gray-500 space-y-0.5 truncate">
                        <span className="flex items-center gap-1 text-gray-700">
                          <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          {u.mobile}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-gray-300 flex-shrink-0" />
                          {u.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-gray-600 truncate">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{u.route || "Not Assigned"}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${isUserActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>{isUserActive ? "ACTIVE" : "BLOCKED"}</span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5 h-full mt-0.5">
                        <button type="button" onClick={() => handleToggleStatus(u._id || u.id, u.status || "Active")} className={`p-1.5 border rounded-lg transition shadow-sm ${isUserActive ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"}`}>
                          {isUserActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button type="button" onClick={() => handleDeleteAgent(u._id || u.id, u.proprietor)} className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition shadow-sm">
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
      )}

      {!loading && filteredAgents.length === 0 && (
        <div className="text-center py-14 text-gray-400 font-semibold bg-gray-50 rounded-xl mt-2 border border-dashed border-gray-200 flex-1 flex flex-col items-center justify-center">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <span>No delivery boy registries found!</span>
        </div>
      )}
    </div>
  );
}
