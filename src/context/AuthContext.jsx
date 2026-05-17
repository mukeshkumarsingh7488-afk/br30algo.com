import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_URL = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("sudha_user");
    const storedToken = localStorage.getItem("sudha_token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data && response.data.success) {
        const { token, user: userData } = response.data;

        localStorage.setItem("sudha_token", token);
        localStorage.setItem("sudha_user", JSON.stringify(userData));

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(userData);
        return { success: true, role: userData.role };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid Credentials or Server Offline!",
      };
    }
  };

  // 📸 🆕 जादुई स्टेट लॉक इंजन: प्रोफाइल फोटो बदलते ही पूरे ऐप की मेमोरी को रीयल-टाइम अपडेट करना
  const updateUserProfileState = (updatedUserData) => {
    localStorage.setItem("sudha_user", JSON.stringify(updatedUserData));
    setUser(updatedUserData);
  };

  const triggerForgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send OTP code!",
      };
    }
  };
  const confirmPasswordReset = async (email, otp, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Password reset failed!",
      };
    }
  };

  const sendRegistrationOtp = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/users/send-otp`, { email });
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to dispatch registration OTP!",
      };
    }
  };

  const registerRetailer = async (newShopData) => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, newShopData);
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      console.error("❌ Registration API Error:", error.response?.data?.message || error.message);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem("sudha_token");
    localStorage.removeItem("sudha_user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        registerRetailer,
        sendRegistrationOtp,
        triggerForgotPassword,
        confirmPasswordReset,
        updateUserProfileState,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
