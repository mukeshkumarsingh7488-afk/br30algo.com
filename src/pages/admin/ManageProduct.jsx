import React, { useState, useEffect } from "react";
import { useProducts } from "../../context/ProductContext";
import { Search, Edit2, Trash2, Eye, EyeOff, X, ShieldAlert, Camera } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ManageProduct() {
  const { products, removeProductFromCatalog, refreshInventory } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const formatLiveDate = (mongoTimestamp) => {
    if (!mongoTimestamp) return "N/A";
    const dateObj = new Date(mongoTimestamp);
    if (isNaN(dateObj.getTime())) return "N/A";

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDeleteClick = (productId, productName) => {
    window.Swal.fire({
      title: "Remove Product Permanently?",
      text: `Are you sure you want to delete '${productName}' from MongoDB Cloud database?`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Delete It!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        window.Swal.fire({
          title: "Processing...",
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          },
        });
        const res = await removeProductFromCatalog(productId);
        window.Swal.close();
        if (res && res.success) {
          window.Swal.fire({
            title: "Erased!",
            text: res.message,
            icon: "success",
            confirmButtonColor: "#2563eb",
            timer: 1500,
          });
        }
      }
    });
  };

  // 👁️ 1. व्यू डिटेल्स पॉपअप लॉजिक
  const handleViewDetails = (product) => {
    const isLiveImg = product.image && product.image.startsWith("http");
    window.Swal.fire({
      title: `<span class="text-base font-black text-gray-800">Product Specification Catalogs</span>`,
      html: `
        <div class="text-left text-xs font-sans select-none space-y-3 pt-1">
          <div class="text-center bg-gray-50 border rounded-2xl p-2 flex items-center justify-center min-h-[140px] max-w-[200px] mx-auto shadow-inner">
            ${isLiveImg ? `<img src="${product.image}" style="max-width: 100%; max-height: 120px; object-fit: contain; border-radius: 8px;" />` : `<span style="font-size: 32px;">${product.image || "🥛"}</span>`}
          </div>
          <div class="bg-blue-50/60 border border-blue-100 p-3 rounded-2xl font-medium text-gray-700 space-y-1.5">
            <p style="margin:0;">📦 <b>Product Name:</b> <span class="text-blue-600 font-bold">${product.name}</span></p>
            <p style="margin:0;">🗂️ <b>Category:</b> <span class="text-gray-800 font-semibold">${product.category}</span></p>
            <p style="margin:0;">💰 <b>Price Rate:</b> <span class="text-slate-900 font-black">₹${product.price} / Crate</span></p>
            <p style="margin:0;">🛡️ <b>Pack Structure:</b> <span class="font-mono text-gray-600">${product.packText || "N/A"}</span></p>
            <p style="margin:0;">📅 <b>Added On:</b> <span class="font-mono text-gray-600">${formatLiveDate(product.createdAt)}</span></p>
          </div>
          ${
            product.description
              ? `
            <div class="bg-gray-50 border p-2.5 rounded-xl">
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Product Description / Notes</span>
              <p class="text-gray-600 font-medium leading-relaxed m-0 text-[11px]">${product.description}</p>
            </div>
          `
              : ""
          }
        </div>
      `,
      confirmButtonColor: "#2563eb",
      confirmButtonText: "Close",
      customClass: { popup: "rounded-3xl p-5" },
    });
  };

  // 📝 2. फुल मास्टर प्रोडक्ट एडिटर पॉपअप इंजन (Name, Price, Image, Description)
  const handleEditClick = (product) => {
    let editedImageBase64 = product.image;

    window.Swal.fire({
      title: `<span class="text-base font-black text-gray-800">Master Product Editor</span>`,
      html: `
        <div class="text-left text-xs font-sans space-y-3 pt-2">
          <div>
            <label style="display:block; font-weight:bold; color:#475569; margin-bottom:4px;">Product Name</label>
            <input id="edit-name" type="text" value="${product.name}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:10px; font-size:12px; outline:none; font-weight:600;" />
          </div>
          <div>
            <label style="display:block; font-weight:bold; color:#475569; margin-bottom:4px;">Price Rate (₹ per Crate)</label>
            <input id="edit-price" type="number" value="${product.price}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:10px; font-size:12px; outline:none; font-weight:bold;" />
          </div>
          <div>
            <label style="display:block; font-weight:bold; color:#475569; margin-bottom:4px;">Product Description</label>
            <textarea id="edit-desc" rows="2" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:10px; font-size:12px; outline:none; font-medium; resize:none;">${product.description || ""}</textarea>
          </div>
          <div>
            <label style="display:block; font-weight:bold; color:#475569; margin-bottom:4px;">Update Image Sheet</label>
            <input id="edit-file-input" type="file" accept="image/*" style="font-size:11px; color:#64748b;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      confirmButtonText: "Save All Changes",
      cancelButtonText: "Cancel",
      customClass: { popup: "rounded-3xl p-5" },
      didOpen: () => {
        const fileInput = document.getElementById("edit-file-input");
        if (fileInput) {
          fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                editedImageBase64 = reader.result;
              };
              reader.readAsDataURL(file);
            }
          });
        }
      },
      preConfirm: () => {
        return {
          name: document.getElementById("edit-name").value,
          price: document.getElementById("edit-price").value,
          description: document.getElementById("edit-desc").value,
          image: editedImageBase64,
        };
      },
    }).then(async (swalResult) => {
      if (swalResult.isConfirmed && swalResult.value) {
        window.Swal.fire({
          title: "Synchronizing Master Edits...",
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          },
        });
        try {
          // पुट (PUT) एपीआई रिक्वेस्ट द्वारा पूरा बदला हुआ पेलोड सीधे बैकएंड क्लाउड को भेजना
          await axios.put(`${API_URL}/products/update-stock/${product._id}`, {
            additionalInward: 0,
            masterEdits: swalResult.value, // मास्टर डेटा बंडल पैकेट
          });
          window.Swal.close();
          await refreshInventory();
          window.Swal.fire({
            title: "Updated Successfully!",
            text: "Catalog parameters re-synchronized clean.",
            icon: "success",
            timer: 1500,
          });
        } catch (err) {
          window.Swal.close();
          window.Swal.fire({
            title: "Sync Error",
            text: "Failed to broadcast cloud catalog updates.",
            icon: "error",
          });
        }
      }
    });
  };

  // 👁️‍🗨️ 3. 🆕 नया हाइड / लाइव स्टेटस टॉगल फंक्शन (True Hide Engine Connection)
  const handleHideToggleClick = async (product) => {
    // अगर स्थिति undefined है, तो बाय डिफ़ॉल्ट 'LIVE' मानेंगे
    const currentStatus = product.status || "LIVE";
    const nextStatus = currentStatus === "LIVE" ? "HIDDEN" : "LIVE";

    window.Swal.fire({
      title: nextStatus === "HIDDEN" ? "Hide Product Catalog?" : "Make Product Live?",
      text: nextStatus === "HIDDEN" ? `Are you sure you want to hide '${product.name}' from retailer mobile stores?` : `Make '${product.name}' active for shopping checkouts?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: nextStatus === "HIDDEN" ? "#6b7280" : "#16a34a",
      confirmButtonText: nextStatus === "HIDDEN" ? "Yes, Hide It!" : "Yes, Make Live!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        window.Swal.fire({
          title: "Modifying Status Line...",
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          },
        });
        try {
          await axios.put(`${API_URL}/products/update-stock/${product._id}`, {
            additionalInward: 0,
            statusToggle: nextStatus, // लाइव स्टेटस अपडेट फ्लैग पैकेट
          });
          window.Swal.close();
          await refreshInventory();
          window.Swal.fire({
            title: "Status Modified!",
            text: `Product configuration locked to ${nextStatus}.`,
            icon: "success",
            timer: 1200,
          });
        } catch (err) {
          window.Swal.close();
          window.Swal.fire({
            title: "Error",
            text: "Status synchronization failed.",
            icon: "error",
          });
        }
      }
    });
  };

  const filteredProducts = products.filter((p) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search);
    const matchesCategory = activeCategory === "All" ? true : p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesMenu = ["All", "Milk", "Dahi", "Paneer", "Ghee", "Drink & Beverages", "Icecream", "Sweet", "Other product"];
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm select-none max-w-5xl mx-auto text-xs max-h-[calc(100vh-32px)] overflow-y-auto scrollbar-none flex flex-col h-full">
      <style>{`
        .product-zoom-container { overflow: visible !important; }
        .product-floating-img { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important; position: relative; z-index: 1; }
        .product-floating-img:hover { transform: scale(2.8) !important; z-index: 9999 !important; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3) !important; border-radius: 6px !important; background-color: #ffffff !important; }
      `}</style>

      {/* Tools Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 mb-3 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Manage Products</h2>
          <p className="text-gray-400 text-[11px] mt-0.5">Live Product Tracking, Catalog Synchronizations and Modification Logs</p>
        </div>

        <div className="relative max-w-xs w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input type="text" placeholder="Search catalog products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-8 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs outline-none transition font-medium shadow-sm" />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
              <X className="w-4 h-4 bg-gray-100 p-0.5 rounded-full" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none border-b border-gray-50 flex-shrink-0">
        {categoriesMenu.map((cat) => (
          <button key={cat} onClick={() => setSearchTerm("") || setActiveCategory(cat)} className={`px-3 py-1 rounded-xl font-black text-[10px] tracking-tight uppercase border transition-all flex-shrink-0 ${activeCategory === cat ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Main Catalog Data Grid Frame */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 flex-1 overflow-y-auto scrollbar-none bg-white">
        <table className="w-full text-left border-collapse text-xs table-fixed">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm border-b">
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-3 w-1/3">Product Descriptions</th>
              <th className="p-3 w-1/6">Price (₹)</th>
              <th className="p-3 w-1/6">Added Date</th>
              <th className="p-3 w-1/6">Last Edit</th>
              <th className="p-3 w-1/6">Status</th>
              <th className="p-3 w-1/4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {filteredProducts.map((product) => {
              const hasLiveImage = product.image && product.image.startsWith("http");
              const isHidden = product.status === "HIDDEN";

              return (
                <tr key={product._id || product.id} className={`hover:bg-gray-50/80 transition ${isHidden ? "bg-gray-100/60 opacity-75" : ""}`}>
                  <td className="p-3 font-bold text-gray-800 flex items-center space-x-2.5 truncate product-zoom-container">
                    <div className="p-1 w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0 product-zoom-container">{hasLiveImage ? <img src={product.image} alt="" className="w-full h-full object-contain rounded-lg product-floating-img cursor-pointer" /> : <span className="text-lg product-floating-img">{product.image || "🥛"}</span>}</div>
                    <div className="flex flex-col truncate">
                      <span className="text-gray-800 text-xs truncate font-bold">{product.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium tracking-tight truncate mt-0.5">{product.packText}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-900 font-black font-mono text-xs">₹{product.price}</td>
                  <td className="p-3 text-gray-500 font-mono font-bold text-[11px]">{formatLiveDate(product.createdAt)}</td>
                  <td className="p-3 text-gray-500 font-mono font-bold text-[11px]">{formatLiveDate(product.updatedAt)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${isHidden ? "bg-gray-100 text-gray-600 border-gray-300" : "bg-green-100 text-green-700 border border-green-200"}`}>{isHidden ? "HIDDEN" : "LIVE"}</span>
                  </td>

                  {/* ⚡ [MASTER ACTIONS MATRIX]: टोटल 4 बटन अब यहाँ 100% सही अलाइनमेंट में लॉक हैं */}
                  <td className="p-3 flex items-center justify-center space-x-1 h-full mt-1.5">
                    {/* बटन 1: व्यू डिटेल्स (आँख आइकॉन) */}
                    <button onClick={() => handleViewDetails(product)} className="p-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm" title="View Specifications">
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* बटन 2: नया हाइड / लाइव टॉगल स्विच (आँख कट आइकॉन) */}
                    <button onClick={() => handleHideToggleClick(product)} className={`p-1.5 rounded-lg border transition shadow-sm ${isHidden ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100" : "bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200"}`} title={isHidden ? "Make Catalog Live" : "Hide From Storefront"}>
                      {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* बटन 3: फुल मास्टर एडिटर (पेन आइकॉन) */}
                    <button onClick={() => handleEditClick(product)} className="p-1.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-100 transition shadow-sm" title="Master Edit Details">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* बटन 4: हमेशा के लिए डिलीट (कचरा डिब्बा आइकॉन) */}
                    <button onClick={() => handleDeleteClick(product._id || product.id, product.name)} className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition shadow-sm" title="Delete From System">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-10 text-gray-400 font-semibold bg-gray-50 rounded-xl mt-3 border border-dashed border-gray-200 flex-1 flex flex-col items-center justify-center">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <span>No product records found matching the specifications!</span>
        </div>
      )}
    </div>
  );
}
