import React, { useState } from "react";
import axios from "axios";
import { User, Phone, Mail, Key, ShieldCheck, MapPin } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function RegisterDeliveryBoy() {
  const [formData, setFormData] = useState({
    proprietor: "",
    mobile: "",
    email: "",
    password: "",
    route: "Parihar Route",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.Swal.fire({
      title: "Registering Agent...",
      allowOutsideClick: false,
      didOpen: () => {
        window.Swal.showLoading();
      },
    });

    try {
      const token = localStorage.getItem("sudha_token");
      const payload = {
        proprietor: formData.proprietor,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password,
        route: formData.route,
        role: "delivery_boy",
      };

      const res = await axios.post(`${API_URL}/users/register-agent`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.success) {
        window.Swal.fire({ title: "Agent Authorized! ✓", text: "Delivery Boy successfully added to MongoDB cluster.", icon: "success" });
        setFormData({ proprietor: "", mobile: "", email: "", password: "", route: "Parihar Route" });
      }
    } catch (err) {
      window.Swal.fire({ title: "Registration Failed", text: err.response?.data?.message || "Network node authentication timeout.", icon: "error" });
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm select-none max-w-md mx-auto text-xs h-[calc(100vh-32px)] flex flex-col overflow-hidden w-full">
      <div className="border-b border-gray-100 pb-3 mb-4 flex-shrink-0">
        <h2 className="text-sm font-black text-gray-800 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Register Delivery Agent</span>
        </h2>
        <p className="text-gray-400 text-[10px] mt-0.5">Provision secure logistics account nodes directly into centralized routing grid</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-none space-y-4 pr-0.5 pb-4 font-medium text-gray-700">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span>Agent Full Name</span>
          </label>
          <input type="text" name="proprietor" required value={formData.proprietor} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 shadow-sm bg-gray-50/30" placeholder="e.g. Ramesh Kumar" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>Mobile Number</span>
          </label>
          <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 shadow-sm bg-gray-50/30" placeholder="10 Digit Contact Number" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span>Email Address</span>
          </label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 shadow-sm bg-gray-50/30" placeholder="agentname@sudha.com" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-gray-400" />
            <span>Security Password</span>
          </label>
          <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 shadow-sm bg-gray-50/30" placeholder="Create secure portal password" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>Assigned Distribution Route</span>
          </label>
          <select name="route" value={formData.route} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm">
            <option value="Parihar Route">Parihar Route</option>
            <option value="Sonbarsa Route">Sonbarsa Route</option>
            <option value="All Routes">All Routes</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl transition text-[11px] uppercase tracking-wider shadow-md mt-6 shadow-indigo-100">
          Authorize & Boot Agent Account
        </button>
      </form>
    </div>
  );
}
