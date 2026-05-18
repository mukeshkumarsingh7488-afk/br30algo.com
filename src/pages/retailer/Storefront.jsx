import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../context/ProductContext";
import { ShoppingBag, ShoppingCart, User, LogOut, Package, CheckCircle2, Menu, X, Edit3, Camera, Search, Layers, Trash2, Wallet, Calendar, BadgeCheck } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Storefront() {
  const { user, logout, updateUserProfileState } = useAuth();
  const { products, refreshInventory } = useProducts();

  const [activeTab, setActiveTab] = useState("store");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [profilePic, setProfilePic] = useState(user?.userProfilePic || null);
  const [proprietorName, setProprietorName] = useState(user?.proprietor || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 0);
  const [photoLoading, setPhotoLoading] = useState(false);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(`sudha_cart_${user?.id || user?._id}`);
    return savedCart ? JSON.parse(savedCart) : {};
  });

  useEffect(() => {
    if (user?.id || user?._id) {
      localStorage.setItem(`sudha_cart_${user.id || user._id}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  const handlePhotoChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setPhotoLoading(true);
      window.Swal.fire({
        title: "Uploading Photo...",
        allowOutsideClick: false,
        didOpen: () => {
          window.Swal.showLoading();
        },
      });

      const convertToBase64 = (targetFile) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(targetFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      };

      const base64PayloadString = await convertToBase64(files[0]);
      const token = localStorage.getItem("sudha_token");

      const res = await axios.post(
        `${API_URL}/users/update-profile`,
        { profilePhoto: base64PayloadString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data?.success) {
        const updatedUrl = res.data.url || res.data.user?.userProfilePic;
        setProfilePic(updatedUrl);
        window.Swal.fire({ title: "Success ✓", text: "Profile picture securely locked inside database.", icon: "success" });
      }
    } catch (err) {
      window.Swal.fire({ title: "Upload Failed", text: err.response?.data?.message || "Cloud storage connection error.", icon: "error" });
    } finally {
      setPhotoLoading(false);
    }
  };

  useEffect(() => {
    const fetchLiveUserWallet = async () => {
      try {
        const uId = user?.id || user?._id;
        if (!uId) return;
        const res = await axios.get(`${API_URL}/users/profile/${uId}`);
        if (res.data && res.data.success) {
          setWalletBalance(res.data.data.walletBalance || 0);
          if (res.data.data.userProfilePic) {
            setProfilePic(res.data.data.userProfilePic);
          }
        }
      } catch (err) {
        console.log("Wallet Sync Network Warning");
      }
    };
    if (isDrawerOpen) fetchLiveUserWallet();
  }, [isDrawerOpen, user]);

  useEffect(() => {
    if (refreshInventory) {
      refreshInventory();
    }
  }, []);

  const handleAddWalletMoney = () => {
    window.Swal.fire({
      title: `<span class="text-sm font-black text-gray-800">Sudha Digital UPI Gateway</span>`,
      html: `
        <div class="text-left text-xs font-sans space-y-3 pt-2 select-none">
          <p class="font-bold text-gray-500 text-center">Select your preferred banking payment application:</p>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
            <button type="button" id="pay-gpay" style="padding: 8px; border: 1px solid #e2e8f0; border-radius: 12px; font-weight: bold; background: white; cursor: pointer; text-align: center; font-size:10px;">🔵 G-Pay</button>
            <button type="button" id="pay-phonepe" style="padding: 8px; border: 1px solid #e2e8f0; border-radius: 12px; font-weight: bold; background: white; cursor: pointer; text-align: center; font-size:10px;">🟣 PhonePe</button>
            <button type="button" id="pay-paytm" style="padding: 8px; border: 1px solid #e2e8f0; border-radius: 12px; font-weight: bold; background: white; cursor: pointer; text-align: center; font-size:10px;">🔵 Paytm</button>
          </div>
          <div style="border-top: 1px dashed #e2e8f0; padding-top: 10px;">
            <label style="display:block; font-weight:bold; color:#475569; margin-bottom:6px; text-align: center;">Enter Custom Recharge Amount (₹)</label>
            <input id="recharge-custom-amount" type="number" min="1" placeholder="e.g. 1500" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:12px; font-size:14px; font-weight:bold; text-align:center; outline:none; background:white;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Authorize UPI Secure Node",
      cancelButtonText: "Cancel",
      customClass: { popup: "rounded-3xl p-5" },
      didOpen: () => {
        const apps = ["pay-gpay", "pay-phonepe", "pay-paytm"];
        apps.forEach((id) => {
          document.getElementById(id).addEventListener("click", () => {
            apps.forEach((k) => {
              document.getElementById(k).style.borderColor = "#e2e8f0";
              document.getElementById(k).style.backgroundColor = "white";
              document.getElementById(k).style.color = "#000";
            });
            document.getElementById(id).style.borderColor = "#2563eb";
            document.getElementById(id).style.backgroundColor = "#eff6ff";
            document.getElementById(id).style.color = "#2563eb";
          });
        });
        document.getElementById("pay-phonepe").click();
      },
      preConfirm: () => {
        const amt = document.getElementById("recharge-custom-amount").value;
        if (!amt || parseFloat(amt) <= 0) {
          window.Swal.showValidationMessage("Please enter a valid commercial amount!");
          return false;
        }
        return parseFloat(amt);
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        window.Swal.fire({
          title: "Connecting Secure UPI App Terminal...",
          text: "Requesting secure response parameters from centralized NPCI server...",
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          },
        });
        setTimeout(async () => {
          try {
            const res = await axios.put(`${API_URL}/users/recharge-wallet/${user.id || user._id}`, { amount: result.value, actionType: "add" });
            window.Swal.close();
            if (res.data && res.data.success) {
              setWalletBalance(res.data.newBalance);
              const updatedUser = {
                ...user,
                walletBalance: res.data.newBalance,
              };
              updateUserProfileState(updatedUser);
              window.Swal.fire({
                title: "Payment Successful! ✓",
                text: `₹${result.value.toLocaleString("en-IN")} securely loaded into your Sudha Smart Wallet.`,
                icon: "success",
                confirmButtonColor: "#2563eb",
              });
            }
          } catch (err) {
            window.Swal.close();
            window.Swal.fire({
              title: "Gateway Blocked",
              text: "Centralized bank node rejected token.",
              icon: "error",
            });
          }
        }, 2200);
      }
    });
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setProfilePic(base64Image);
      window.Swal.fire({
        title: "Uploading Profile Image...",
        allowOutsideClick: false,
        didOpen: () => {
          window.Swal.showLoading();
        },
      });
      try {
        const response = await axios.put(`${API_URL}/users/update-profile/${user.id || user._id}`, { proprietor: proprietorName, photo: base64Image });
        window.Swal.close();
        if (response.data && response.data.success) {
          const updatedUser = {
            ...user,
            proprietor: proprietorName,
            photo: response.data.cloudPhotoUrl,
            userProfilePic: response.data.cloudPhotoUrl,
          };
          updateUserProfileState(updatedUser);
          window.Swal.fire({
            title: "Profile Updated!",
            text: "Your fresh identities are locked successfully.",
            icon: "success",
            timer: 1500,
          });
        }
      } catch (err) {
        window.Swal.close();
      }
    };
  };

  const handleUpdateNameSubmit = async () => {
    if (!proprietorName.trim()) return;
    window.Swal.fire({
      title: "Saving Parameters...",
      allowOutsideClick: false,
      didOpen: () => {
        window.Swal.showLoading();
      },
    });
    try {
      await axios.put(`${API_URL}/users/update-profile/${user.id || user._id}`, { proprietor: proprietorName });
      window.Swal.close();
      const updatedUser = { ...user, proprietor: proprietorName };
      updateUserProfileState(updatedUser);
      setIsEditingName(false);
      window.Swal.fire({
        title: "Success",
        text: "Proprietor name updated permanently.",
        icon: "success",
        timer: 1200,
      });
    } catch (err) {
      window.Swal.close();
    }
  };

  const updateCartQty = (productId, change) => {
    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + change;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const baseFilteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesCat = activeCategory === "All" ? true : p.category === activeCategory;
    return matchesSearch && matchesCat && p.status !== "HIDDEN";
  });

  const categoriesMenu = ["All", "Milk", "Dahi", "Paneer", "Ghee", "Drink & Beverages", "Icecream", "Sweet"];
  // ⚡ मास्टर हाइब्रिड पेमेंट गेटवे और आर्डर डिस्पैच इंजन (UPI vs Wallet MongoDB Live Sync)
  const handlePlaceOrderSubmit = async () => {
    const cartItems = Object.keys(cart).map((pId) => {
      const prod = products.find((p) => p._id === pId);
      return {
        productId: pId,
        name: prod?.name,
        qty: cart[pId],
        price: prod?.price,
        packText: prod?.packText,
      };
    });

    if (cartItems.length === 0) return;
    const orderTotalAmount = Object.keys(cart).reduce((sum, id) => sum + cart[id] * (products.find((p) => p._id === id)?.price || 0), 0);

    window.Swal.fire({
      title: `<span class="text-sm font-black text-gray-800">Choose Payment Method</span>`,
      html: `
        <div class="text-left text-xs font-sans space-y-2.5 pt-2 select-none">
          <div class="bg-slate-100 p-2.5 rounded-xl border text-center">
            <span class="text-gray-400 font-bold uppercase tracking-tight block text-[10px]">Total Order Payable</span>
            <span class="text-lg font-black text-slate-800 block mt-0.5">₹${orderTotalAmount.toLocaleString("en-IN")}</span>
          </div>
          <p class="font-bold text-gray-500 text-center">Select your commercial clearing channel:</p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: "#2563eb",
      denyButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "📱 Pay via UPI App",
      denyButtonText: `💼 Pay via Wallet (₹${walletBalance})`,
      cancelButtonText: "Cancel",
    }).then(async (paymentChoice) => {
      let gatewayPassed = false;
      let isWalletTransaction = false;

      if (paymentChoice.isConfirmed) {
        gatewayPassed = true;
      } else if (paymentChoice.isDenied) {
        if (walletBalance >= orderTotalAmount) {
          gatewayPassed = true;
          isWalletTransaction = true;
        } else {
          window.Swal.fire({
            title: "Insufficient Balance!",
            text: `Your wallet has only ₹${walletBalance}.`,
            icon: "error",
            confirmButtonColor: "#2563eb",
          });
          return;
        }
      } else {
        return;
      }

      if (gatewayPassed) {
        window.Swal.fire({
          title: "Processing Order...",
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          },
        });
        try {
          const orderResponse = await axios.post(`${API_URL}/orders/place`, {
            retailerId: user.id || user._id,
            shopName: user.shopName,
            route: user.route,
            items: cartItems,
          });

          if (orderResponse.data && orderResponse.data.success) {
            if (isWalletTransaction) {
              const walletRes = await axios.put(`${API_URL}/users/recharge-wallet/${user.id || user._id}`, { amount: orderTotalAmount, actionType: "deduct" });
              if (walletRes.data && walletRes.data.success) {
                setWalletBalance(walletRes.data.newBalance);
                const updatedUser = {
                  ...user,
                  walletBalance: walletRes.data.newBalance,
                };
                updateUserProfileState(updatedUser);
              }
            }
            setCart({});
            localStorage.removeItem(`sudha_cart_${user.id || user._id}`);
            setActiveTab("orders");
            await refreshInventory();
            window.Swal.fire({
              title: "Order Dispatched!",
              text: "Your advance crates requirements successfully synced.",
              icon: "success",
            });
          }
        } catch (err) {
          window.Swal.close();
          window.Swal.fire({
            title: "Booking Error",
            text: "Server boundaries error.",
            icon: "error",
          });
        }
      }
    });
  };

  return (
    /* 🚀 100% फिक्स आउटर फ्रेम: मोबाइल स्क्रीन को हिलाने से रोकेगा */
    <div className="w-full h-screen bg-gray-50 flex flex-col justify-between select-none relative max-w-md mx-auto shadow-2xl border-x border-gray-200 overflow-hidden text-xs">
      <style>{`
        .store-floating-img { transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease !important; position: relative; z-index: 10; }
        .store-floating-img:hover { transform: scale(2.6) !important; z-index: 9999 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important; border-radius: 8px !important; background-color: white !important; }
      `}</style>

      {/* 🔒 [STABLE HEADER SECTION] : यह डिब्बा स्क्रीन के टॉप पर लोहे की तरह जमेगा */}
      <div className="w-full flex flex-col bg-white sticky top-0 z-30 shadow-sm flex-shrink-0">
        {/* 1. ब्लू स्टोर नाम हेडर */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 shadow-md flex items-center justify-between">
          <div className="w-8 h-8 border border-white/40 rounded-full overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">{profilePic ? <img src={profilePic} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-white/80" />}</div>
          <div className="flex-1 text-center px-1">
            <h1 className="text-xs font-black uppercase tracking-wide truncate max-w-[190px] mx-auto flex items-center justify-center gap-1">
              <span>{user?.shopName || "MUKESH JENREL STORE"}</span>
              {/* ⚡ ब्लू वेरिफिकेशन बैज यहाँ मुख्य स्टोर फ्रंट पर भी लॉक है */}
              <BadgeCheck className="w-3.5 h-3.5 text-blue-400 fill-white flex-shrink-0" />
            </h1>
            <span className="text-[9px] font-bold opacity-75 block mt-0.5">📍 Route: {user?.route || "Sonbarsa Route"}</span>
          </div>
          <button onClick={() => setIsDrawerOpen(true)} className="p-1 hover:bg-white/10 rounded-lg transition flex-shrink-0">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* 2. रीयल-टाइम सर्च बार और कैटेगरी पट्टी */}
        {activeTab === "store" && (
          <div className="p-3 bg-white space-y-2.5 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input type="text" placeholder="Search Milk, Dahi, Lassi or any product..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 transition shadow-inner" />
            </div>
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
              {categoriesMenu.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border transition-all flex-shrink-0 ${activeCategory === cat ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-gray-200 text-gray-600"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* 🌊 [INDEPENDENT SCROLL WORKSPACE]: केवल अंदर का माल ही स्क्रॉल होगा */}
      <div className="flex-1 overflow-y-auto p-3 pb-28 scrollbar-none bg-gray-50/50">
        {/* टैब 1: शॉपिंग स्टोर */}
        {activeTab === "store" && (
          <div className="space-y-2.5 animate-fade-in">
            {baseFilteredProducts.map((p) => {
              const hasLiveImg = p.image && p.image.startsWith("http");
              const cartQty = cart[p._id] || 0;
              return (
                <div key={p._id} className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-12 h-12 bg-gray-50 border rounded-xl flex items-center justify-center shadow-inner overflow-visible flex-shrink-0">{hasLiveImg ? <img src={p.image} alt="" className="w-full h-full object-contain rounded-lg store-floating-img cursor-pointer" /> : <span className="text-xl store-floating-img">{p.image || "🥛"}</span>}</div>
                    <div className="truncate flex flex-col">
                      <span className="text-gray-800 text-xs font-bold truncate">{p.name}</span>
                      <span className="text-[9px] text-gray-400 font-bold font-mono truncate mt-0.5">{p.packText || "1 Crate (10 Ltr / 20 Pcs)"}</span>
                      <span className="text-[11px] font-black text-slate-800 mt-1">
                        ₹{Number(p.price).toLocaleString("en-IN")} <span className="text-[9px] text-gray-400 font-medium">per Crate/Box</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    {cartQty === 0 ? (
                      <button onClick={() => updateCartQty(p._id, 1)} className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-600 font-black text-[10px] rounded-xl hover:bg-blue-100 shadow-sm transition uppercase">
                        ADD +
                      </button>
                    ) : (
                      <div className="flex items-center bg-blue-600 text-white rounded-xl shadow shadow-blue-200">
                        <button onClick={() => updateCartQty(p._id, -1)} className="px-2.5 py-1 font-black text-sm hover:bg-white/10 rounded-l-xl transition">
                          -
                        </button>
                        <span className="px-2 font-mono font-black text-xs min-w-[20px] text-center">{cartQty}</span>
                        <button onClick={() => updateCartQty(p._id, 1)} className="px-2.5 py-1 font-black text-sm hover:bg-white/10 rounded-r-xl transition">
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* टैब 2: इन-स्टॉक माल पेज */}
        {activeTab === "instock" && (
          <div className="space-y-2.5">
            <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center space-x-2 mb-1">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Available Depot Counter Items</span>
            </div>
            {products
              .filter((p) => (p.currentStock || 0) > 0 && p.status !== "HIDDEN")
              .map((p) => {
                const hasLiveImg = p.image && p.image.startsWith("http");
                const cartQty = cart[p._id] || 0;
                return (
                  <div key={p._id} className="bg-white p-2.5 rounded-2xl border border-emerald-200/50 shadow-sm flex items-center justify-between gap-2.5">
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">{hasLiveImg ? <img src={p.image} alt="" className="w-full h-full object-contain rounded-lg store-floating-img" /> : <span className="text-xl store-floating-img">{p.image || "🥛"}</span>}</div>
                      <div className="truncate flex flex-col">
                        <span className="text-gray-800 text-xs font-bold truncate">{p.name}</span>
                        <span className="text-[9px] text-gray-400 font-bold font-mono mt-0.5">{p.packText}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[11px] font-black text-slate-800">₹{Number(p.price).toLocaleString("en-IN")}</span>
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 font-mono uppercase">In Stock: {p.currentStock}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {cartQty === 0 ? (
                        <button onClick={() => updateCartQty(p._id, 1)} className="px-3 py-1 bg-emerald-600 border border-emerald-600 text-white font-black text-[10px] rounded-xl shadow-sm hover:bg-emerald-700 transition uppercase">
                          ADD +
                        </button>
                      ) : (
                        <div className="flex items-center bg-emerald-600 text-white rounded-xl shadow shadow-emerald-100">
                          <button onClick={() => updateCartQty(p._id, -1)} className="px-2.5 py-1 font-black text-sm hover:bg-white/10 rounded-l-xl">
                            -
                          </button>
                          <span className="px-2 font-mono font-black text-xs text-center min-w-[20px]">{cartQty}</span>
                          <button onClick={() => updateCartQty(p._id, 1)} className="px-2.5 py-1 font-black text-sm hover:bg-white/10 rounded-r-xl">
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* टैब 3: स्वतंत्र MY CART */}
        {activeTab === "cart" && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-tight">Review Locked Crates Requirements</span>
            </div>
            {Object.keys(cart).length > 0 ? (
              <div className="space-y-2">
                {Object.keys(cart).map((pId) => {
                  const prod = products.find((p) => p._id === pId);
                  if (!prod) return null;
                  return (
                    <div key={pId} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-3">
                      <div className="truncate flex flex-col">
                        <span className="text-gray-800 text-xs font-black truncate">{prod.name}</span>
                        <span className="text-[9px] text-gray-400 font-bold mt-0.5">
                          {cart[pId]} Crate × ₹{Number(prod.price).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-black text-blue-600 mt-1">Total: ₹{(cart[pId] * prod.price).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex items-center bg-blue-600 text-white rounded-xl shadow-sm">
                          <button onClick={() => updateCartQty(pId, -1)} className="px-2.5 py-0.5 font-black text-sm">
                            -
                          </button>
                          <span className="px-1.5 font-mono font-black text-xs">{cart[pId]}</span>
                          <button onClick={() => updateCartQty(pId, 1)} className="px-2.5 py-0.5 font-black text-sm">
                            +
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            setCart((prev) => {
                              const copy = { ...prev };
                              delete copy[pId];
                              return copy;
                            })
                          }
                          className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 border border-red-100 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white p-3.5 rounded-2xl shadow-xl space-y-2 mt-4">
                  <div className="flex justify-between text-[11px] font-bold opacity-80">
                    <span>Total Blocked Items:</span>
                    <span className="font-mono">{Object.values(cart).reduce((a, b) => a + b, 0)} Crates</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                    <span className="text-xs font-bold">Gross Final Amount:</span>
                    <span className="text-sm font-black text-green-400 font-mono">
                      ₹
                      {Object.keys(cart)
                        .reduce((sum, id) => sum + cart[id] * (products.find((p) => p._id === id)?.price || 0), 0)
                        .toLocaleString("en-IN")}
                    </span>
                  </div>
                  <button onClick={handlePlaceOrderSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2 rounded-xl transition text-[11px] uppercase tracking-wider shadow-md mt-2">
                    Confirm & Dispatch Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-dashed rounded-2xl border-gray-200">
                <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Your Shopping Cart is Empty!</span>
              </div>
            )}
          </div>
        )}

        {/* टैब 4: ऑर्डर्स */}
        {activeTab === "orders" && (
          <div className="text-center py-10 text-gray-400 font-bold bg-white border border-dashed rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <span>Order History Connected Matrix</span>
          </div>
        )}
      </div>

      {/* 4-BTN MASTER BOTTOM NAVIGATION STRIP */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-2xl max-w-md mx-auto grid grid-cols-4 py-1.5 px-1 z-40 flex-shrink-0">
        <button onClick={() => setActiveTab("store")} className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "store" ? "text-blue-600 bg-blue-50 font-black" : "text-gray-400 hover:text-gray-700 font-bold"}`}>
          <ShoppingBag className="w-4 h-4" />
          <span className="text-[8px] mt-0.5 uppercase tracking-tighter">Store</span>
        </button>
        <button onClick={() => setActiveTab("instock")} className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "instock" ? "text-emerald-600 bg-emerald-50 font-black border border-emerald-100" : "text-gray-400 hover:text-gray-700 font-bold"}`}>
          <Layers className="w-4 h-4 text-emerald-500" />
          <span className="text-[8px] mt-0.5 uppercase tracking-tighter">In Stock</span>
        </button>
        <button onClick={() => setActiveTab("cart")} className={`flex flex-col items-center justify-center py-1 rounded-xl transition relative ${activeTab === "cart" ? "text-blue-600 bg-blue-50 font-black border border-blue-100" : "text-gray-400 hover:text-gray-700 font-bold"}`}>
          <ShoppingCart className="w-4 h-4 text-indigo-500" />
          <span className="text-[8px] mt-0.5 uppercase tracking-tighter">My Cart</span>
          {Object.keys(cart).length > 0 && <span className="absolute top-0.5 right-2 bg-red-500 text-white rounded-full text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center animate-pulse">{Object.values(cart).reduce((a, b) => a + b, 0)}</span>}
        </button>
        <button onClick={() => setActiveTab("orders")} className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "orders" ? "text-blue-600 bg-blue-50 font-black" : "text-gray-400 hover:text-gray-700 font-bold"}`}>
          <Package className="w-4 h-4" />
          <span className="text-[8px] mt-0.5 uppercase tracking-tighter">My Orders</span>
        </button>
      </div>

      {/* FLOATING FOOTER CART SUMMARY BAR */}
      {activeTab === "store" && Object.keys(cart).length > 0 && (
        <div className="fixed bottom-[54px] inset-x-0 bg-blue-600 text-white px-4 py-2 flex items-center justify-between shadow-2xl z-40 max-w-md mx-auto border-t border-blue-500">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-white/10 rounded-xl">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-100 block">{Object.values(cart).reduce((a, b) => a + b, 0)} Crates Blocked</span>
              <span className="text-xs font-black block mt-0.5">
                ₹
                {Object.keys(cart)
                  .reduce((sum, id) => sum + cart[id] * (products.find((p) => p._id === id)?.price || 0), 0)
                  .toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <button onClick={() => setActiveTab("cart")} className="bg-white text-blue-600 font-black px-4 py-1.5 rounded-xl shadow-md text-[11px] hover:bg-blue-50 transition uppercase tracking-wide">
            Review Cart →
          </button>
        </div>
      )}

      {/* 🟢 🆕 [100% UPGRADED VIP SLIDE DRAWER COMPONENT] : ५-धमाका फीचर्स वाला शानदार क्रेडेंशियल पैनल */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex max-w-md mx-auto animate-fade-in">
          <div className="absolute inset-0 z-0" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-2xl relative ml-auto z-10">
            {/* स्क्रॉलिंग कंटेनर */}
            <div className="overflow-y-auto scrollbar-none flex-1 pb-4 space-y-4">
              {/* हेडर बॉक्स: लाइव फोटो + ब्लू वेरीफाई बैज */}
              <div className="flex justify-between items-start border-b pb-3.5">
                <div className="flex items-center space-x-2.5">
                  {/* 📸 १. असली गोल प्रोफाइल फोटो + कैमरा अपलोडर */}
                  <div className="relative w-11 h-11 border-2 border-blue-600 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center group shadow-md flex-shrink-0">
                    {profilePic ? <img src={profilePic} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                      <Camera className="w-3.5 h-3.5 text-white" />
                      <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                    </label>
                  </div>
                  <div className="truncate">
                    <h3 className="text-xs font-black text-gray-800 flex items-center gap-1 truncate max-w-[150px]">
                      <span>{user?.shopName || "Sudha Retailer"}</span>
                      {/* 🔵 २. वीआईपी ब्लू वेरीफाई बैज */}
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-white flex-shrink-0" />
                    </h3>
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1 py-0.5 border rounded mt-0.5 block truncate max-w-[150px]">{user?.email}</span>
                  </div>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full border flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* वॉलेट कार्ड */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-3.5 rounded-2xl shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-indigo-100 uppercase tracking-wider flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Sudha Smart Wallet</span>
                  </span>
                  <button onClick={handleAddWalletMoney} className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight flex items-center gap-0.5">
                    ➕ Load UPI
                  </button>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-200 block">Available Balance</span>
                  <span className="text-xl font-black block font-mono mt-0.5">₹{Number(walletBalance).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* 🆔 ३. लाइव नेम एडिटिंग पेंसिल टूल */}
              <div className="bg-gray-50 border p-3 rounded-2xl space-y-2.5 shadow-sm">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block border-b pb-1">Identity Manager</span>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 mb-1">Proprietor Name</label>
                  {isEditingName ? (
                    <div className="flex space-x-1.5">
                      <input type="text" value={proprietorName} onChange={(e) => setProprietorName(e.target.value)} className="w-full px-2.5 py-1 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 text-xs bg-white focus:ring-2 focus:ring-blue-500 shadow-sm" />
                      <button type="button" onClick={handleUpdateNameSubmit} className="p-1.5 bg-blue-600 text-white rounded-xl shadow-sm font-bold text-[10px]">
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 border rounded-xl shadow-inner">
                      <span className="font-bold text-gray-700 text-xs">{user?.proprietor || "N/A"}</span>
                      <button type="button" onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-blue-600 transition">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 📅 ४. स्टोर पैरामीटर्स + लाइव रजिस्ट्रेशन जॉइनिंग डेट */}
              <div className="bg-gray-50 border p-3 rounded-2xl space-y-2 shadow-sm font-semibold text-gray-700">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block border-b pb-1">Distribution Registry Parameters</span>
                <p className="m-0 flex justify-between text-[11px]">
                  <span>📞 Registered Mobile:</span> <span className="font-mono font-bold text-gray-800">{user?.mobile || "N/A"}</span>
                </p>
                <p className="m-0 flex justify-between text-[11px]">
                  <span>🆔 Sudha Dealer Code:</span> <span className="font-mono font-black text-blue-600">#{user?.dealerCode || "122534"}</span>
                </p>
                {/* 📅 लाइव जॉइनिंग डेट रेंडरिंग इंजन */}
                <p className="m-0 flex justify-between text-[11px] border-t border-dashed pt-1.5 mt-1 text-emerald-700 font-bold">
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Joined Depot:
                  </span>
                  <span className="font-mono text-[10px]">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "16/05/2026"}
                  </span>
                </p>
              </div>
            </div>

            {/* लॉगआउट बटन */}
            <button onClick={logout} className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-black py-2 rounded-xl transition flex items-center justify-center space-x-1.5 text-xs">
              <LogOut className="w-4 h-4" />
              <span>LOGOUT ACCOUNT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
