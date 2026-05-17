import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, LogIn, ShieldCheck, Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log("API URL:", API_URL);
export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    window.Swal.fire({
      title: "Verifying Credentials...",
      text: "Connecting to MongoDB Atlas Cloud Security Hub.",
      allowOutsideClick: false,
      didOpen: () => {
        window.Swal.showLoading();
      },
    });

    const result = await login(email, password);
    window.Swal.close();

    if (!result.success) {
      window.Swal.fire({
        title: "Login Failed!",
        text: result.message,
        icon: "error",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  // 📧 Real Connected API Alert Chains for Password Recoveries
  const handleForgotPasswordClick = () => {
    window.Swal.fire({
      title: "Reset Password",
      text: "Enter your registered email address:",
      input: "email",
      inputPlaceholder: "shop1@gmail.com",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      confirmButtonText: "Send Verification Code",
    }).then(async (emailResult) => {
      if (emailResult.value) {
        const resetEmail = emailResult.value;

        window.Swal.fire({
          title: "Sending OTP...",
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          },
        });

        try {
          const resOtp = await axios.post(`${API_URL}/auth/forgot-password`, {
            email: resetEmail,
          });
          window.Swal.close();

          if (resOtp.data.success) {
            window.Swal.fire({
              title: "Verification Code Sent",
              text: `Enter the 6-digit security code sent to ${resetEmail}:`,
              input: "number",
              inputPlaceholder: "Enter 6-Digit OTP",
              showCancelButton: true,
              confirmButtonColor: "#2563eb",
              confirmButtonText: "Verify OTP",
            }).then((otpResult) => {
              if (otpResult.value && otpResult.value.length === 6) {
                const verifiedOtp = otpResult.value;

                window.Swal.fire({
                  title: "Create New Password",
                  text: "Enter your secure new password:",
                  input: "text",
                  inputPlaceholder: "Create Password (e.g. Shop@2026)",
                  showCancelButton: true,
                  confirmButtonColor: "#16a34a",
                  confirmButtonText: "Update Password",
                }).then(async (passResult) => {
                  if (passResult.value) {
                    try {
                      const resFinal = await axios.post(`${API_URL}/auth/reset-password`, {
                        email: resetEmail,
                        otp: verifiedOtp,
                        newPassword: passResult.value,
                      });

                      if (resFinal.data.success) {
                        window.Swal.fire({
                          title: "Success!",
                          text: "Your password has been reset successfully. You can now log in.",
                          icon: "success",
                          confirmButtonColor: "#2563eb",
                        });
                      }
                    } catch (err) {
                      window.Swal.fire({
                        title: "Error",
                        text: err.response?.data?.message || "Failed to update password.",
                        icon: "error",
                      });
                    }
                  }
                });
              }
            });
          }
        } catch (err) {
          window.Swal.close();
          window.Swal.fire({
            title: "Failed!",
            text: err.response?.data?.message || "Email not found or mail server down.",
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 select-none font-sans text-xs">
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl max-w-sm w-full space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-black text-blue-600 tracking-wide">SUDHA DAIRY DISTRIBUTION</h1>
          <p className="text-gray-400 mt-1 font-semibold">Agency Admin & Retailer Login Portal</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-gray-600 mb-1">Registered Email ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-600 mb-1">Login Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 outline-none">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            {/* ⚡ बटन यहाँ पूरी तरह से क्लिकेबल और एक्टिवेटेड है */}
            <button type="button" onClick={handleForgotPasswordClick} className="text-blue-600 hover:text-blue-700 font-bold text-[11px] transition outline-none">
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-md flex items-center justify-center space-x-2 text-xs">
            <LogIn className="w-4 h-4" />
            <span>Secure Login</span>
          </button>
        </form>

        <div className="p-2 bg-blue-50/50 border border-blue-100 rounded-xl text-[10px] font-medium text-blue-700 flex items-center space-x-1.5 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>SSL Secured Connection</span>
        </div>
      </div>
    </div>
  );
}
