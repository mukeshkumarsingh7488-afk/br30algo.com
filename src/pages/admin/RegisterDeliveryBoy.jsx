import React, { useState } from "react";
import axios from "axios";
import { User, Phone, Mail, Key, ShieldCheck, MapPin, Eye, EyeOff, Lock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function RegisterDeliveryBoy() {
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [serverOtp, setServerOtp] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

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

  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(pass);
  };

  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      return window.Swal.fire({ title: "Warning", text: "Please enter a valid email address first.", icon: "warning" });
    }
    try {
      setOtpLoading(true);
      const token = localStorage.getItem("sudha_token");

      const res = await axios.post(`${API_URL}/users/send-otp`, {
        email: formData.email,
      });

      if (res.data && res.data.success) {
        setIsOtpSent(true);
        window.Swal.fire({ title: "OTP Sent! 📩", text: "6-Digit registration code successfully sent to email!", icon: "success" });
      }
    } catch (err) {
      window.Swal.fire({ title: "Gateway Error", text: err.response?.data?.message || "Failed to send registration verification code.", icon: "error" });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (userOtp === serverOtp && serverOtp !== "") {
      setIsEmailVerified(true);
      window.Swal.fire({ title: "Verified! ✓", text: "Email node security check cleared successfully.", icon: "success" });
    } else {
      window.Swal.fire({ title: "Invalid OTP", text: "The verification parameters do not match.", icon: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      return window.Swal.fire({ title: "Security Block", text: "Please verify the agent email via OTP first.", icon: "warning" });
    }

    if (!validatePassword(formData.password)) {
      return window.Swal.fire({
        title: "Weak Password",
        text: "Password must be at least 6 characters long and include 1 Uppercase, 1 Lowercase, 1 Number, and 1 Special Character (@$!%*?&).",
        icon: "error",
      });
    }

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
        setIsOtpSent(false);
        setIsEmailVerified(false);
        setUserOtp("");
        setServerOtp("");
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
          <input type="text" name="proprietor" required disabled={isEmailVerified} value={formData.proprietor} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 shadow-sm bg-gray-50/30" placeholder="e.g. Ramesh Kumar" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>Mobile Number</span>
          </label>
          <input type="tel" name="mobile" required disabled={isEmailVerified} value={formData.mobile} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 shadow-sm bg-gray-50/30" placeholder="10 Digit Contact Number" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span>Email Address</span>
          </label>
          <div className="flex gap-2">
            <input type="email" name="email" required disabled={isEmailVerified} value={formData.email} onChange={handleChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 shadow-sm bg-gray-50/30" placeholder="agentname@sudha.com" />
            {!isEmailVerified && (
              <button type="button" onClick={handleSendOtp} disabled={otpLoading} className="px-3 bg-indigo-50 text-indigo-600 border border-indigo-200 font-black text-[10px] rounded-xl hover:bg-indigo-100 transition uppercase shadow-sm">
                {otpLoading ? "Sending..." : isOtpSent ? "Resend" : "Send OTP"}
              </button>
            )}
          </div>
        </div>

        {isOtpSent && !isEmailVerified && (
          <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 flex flex-col gap-2 animate-fade-in">
            <label className="block text-[9px] font-black text-indigo-600 uppercase tracking-wider">Enter 6-Digit Email Verification Code</label>
            <div className="flex gap-2">
              <input type="text" maxLength="6" value={userOtp} onChange={(e) => setUserOtp(e.target.value)} className="flex-1 px-3 py-1.5 border border-indigo-200 rounded-xl outline-none font-black text-center text-sm font-mono focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="000000" />
              <button type="button" onClick={handleVerifyOtp} className="px-4 bg-indigo-600 text-white font-black text-[10px] rounded-xl hover:bg-indigo-700 transition uppercase shadow-md">
                Verify
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span>Security Password</span>
          </label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 text-xs focus:ring-2 focus:ring-indigo-500 shadow-sm bg-gray-50/30" placeholder="Min 6 chars (e.g. Sudha@123)" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
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

        <button type="submit" disabled={!isEmailVerified} className={`w-full font-black py-2.5 rounded-xl transition text-[11px] uppercase tracking-wider shadow-md mt-6 ${isEmailVerified ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100" : "bg-gray-200 text-gray-400 cursor-not-allowed border"}`}>
          Authorize & Boot Agent Account
        </button>
      </form>
    </div>
  );
}
