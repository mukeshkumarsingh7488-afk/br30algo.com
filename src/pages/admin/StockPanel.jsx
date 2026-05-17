import React, { useState, useEffect } from "react";
import { useProducts } from "../../context/ProductContext";
import { Layers, AlertTriangle, CheckCircle2, Search, PlusCircle, MinusCircle, X } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function StockPanel() {
  const { products, updateProductInwardStock } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const totalItemsInStock = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);
  const lowStockAlertsCount = products.filter((p) => (p.currentStock || 0) === 0).length;

  // 🎯 🆕 100% फिक्स: जोड़ना (+) और घटाना (-) दोनों एक ही पॉपअप के अंदर स्विच से लॉक
  const handleAddInventoryClick = (product) => {
    let currentMode = "add"; // डिफ़ॉल्ट मोड जोड़ना है

    window.Swal.fire({
      title: `<span class="text-base font-black text-gray-800">Adjust Warehouse Stock</span>`,
      html: `
        <div class="text-left text-xs font-sans space-y-3 pt-1 select-none">
          <div class="bg-blue-50 border border-blue-100 p-2.5 rounded-xl font-semibold text-gray-700">
            📦 <b>Product:</b> <span class="text-blue-600 font-bold">${product.name}</span>
          </div>

          <!-- ⚡ जादुई स्विच ट्रिगर: Add और Minus बटन सेलेक्टर -->
          <div style="display: flex; background-color: #f1f5f9; padding: 4px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <button type="button" id="swal-btn-add" style="width: 50%; padding: 6px; border-radius: 8px; font-weight: 900; font-size: 11px; text-transform: uppercase; border: none; cursor: pointer; background-color: #16a34a; color: white; transition: all 0.15s;">
              ➕ Add Stock
            </button>
            <button type="button" id="swal-btn-minus" style="width: 50%; padding: 6px; border-radius: 8px; font-weight: 900; font-size: 11px; text-transform: uppercase; border: none; cursor: pointer; background-color: transparent; color: #64748b; transition: all 0.15s;">
              ➖ Minus Stock
            </button>
          </div>

          <div>
            <label id="input-label-text" style="display:block; font-weight:bold; color:#475569; margin-bottom:4px;">Enter Quantity to Add (Crates/Boxes)</label>
            <input id="inv-qty" type="number" min="1" placeholder="e.g. 10" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:10px; font-size:12px; font-weight:bold; outline:none;" />
            <p id="input-help-text" style="color:#94a3b8; font-size:10px; margin-top:3px; font-weight:500;">This will increase the available stock inside the retailer mobile storefront.</p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Confirm Adjustment",
      cancelButtonText: "Cancel",
      customClass: { popup: "rounded-3xl p-5" },
      didOpen: () => {
        const btnAdd = document.getElementById("swal-btn-add");
        const btnMinus = document.getElementById("swal-btn-minus");
        const labelText = document.getElementById("input-label-text");
        const helpText = document.getElementById("input-help-text");
        const confirmBtn = window.Swal.getConfirmButton();

        // 🟢 ADD MODE CLICK
        btnAdd.addEventListener("click", () => {
          currentMode = "add";
          btnAdd.style.backgroundColor = "#16a34a";
          btnAdd.style.color = "white";
          btnMinus.style.backgroundColor = "transparent";
          btnMinus.style.color = "#64748b";
          confirmBtn.style.backgroundColor = "#16a34a";
          labelText.innerText = "Enter Quantity to Add (Crates/Boxes)";
          helpText.innerText = "This will increase the available stock inside the retailer mobile storefront.";
        });

        // 🔴 MINUS MODE CLICK
        btnMinus.addEventListener("click", () => {
          currentMode = "minus";
          btnMinus.style.backgroundColor = "#dc2626";
          btnMinus.style.color = "white";
          btnAdd.style.backgroundColor = "transparent";
          btnAdd.style.color = "#64748b";
          confirmBtn.style.backgroundColor = "#dc2626";
          labelText.innerText = "Enter Quantity to Deduct / Minus (Crates/Boxes)";
          helpText.innerText = "This will safely decrease and subtract stock from the cloud warehouse server.";
        });
      },
      preConfirm: () => {
        const qty = document.getElementById("inv-qty").value;
        if (!qty || parseInt(qty) <= 0) {
          window.Swal.showValidationMessage("Please enter a valid stock quantity!");
          return false;
        }
        // अगर मोड minus है, तो संख्या को ऋणात्मक (- नेगेटिव) में बदल कर भेजेंगे
        return currentMode === "minus" ? -Math.abs(parseInt(qty)) : Math.abs(parseInt(qty));
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value !== undefined) {
        window.Swal.fire({
          title: "Synchronizing Cloud Warehouse...",
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          },
        });

        // 📡 नेगेटिव या पॉजिटिव संख्या सीधे बैकएंड को सेंड होगी (स्टॉक घटाने/बढ़ाने के लिए)
        const res = await updateProductInwardStock(product._id, result.value);
        window.Swal.close();

        if (res && res.success) {
          const actionMsg = result.value > 0 ? `added ${result.value} Crates to` : `deducted ${Math.abs(result.value)} Crates from`;
          window.Swal.fire({
            title: "Inventory Synchronized!",
            text: `✓ Successfully ${actionMsg} live available stock!`,
            icon: "success",
            confirmButtonColor: "#2563eb",
            timer: 1500,
          });
        } else {
          window.Swal.fire({
            title: "Sync Error",
            text: res.message || "Failed to communicate with database server.",
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
      {/* 🚀 अपग्रेड फ्लोटिंग ज़ूम: ३.८ गुना और बड़ा तथा साफ दिखने वाला CSS सुरक्षा कवच */}
      <style>{`
        .stock-zoom-container { overflow: visible !important; }
        .stock-floating-img { transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease !important; position: relative; z-index: 1; }
        .stock-floating-img:hover { 
          transform: scale(1.8) !important; /* ⚡ साइज और बढ़ा दिया गया है */
          z-index: 9999 !important; 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.35), 0 10px 10px -5px rgba(0, 0, 0, 0.35) !important; 
          border-radius: 8px !important; 
          background-color: #ffffff !important; 
          border: 1.5px solid #cbd5e1 !important; 
        }
      `}</style>

      {/* Upper Stats Widget Blocks Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4 flex-shrink-0">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Total Available Stock</span>
            <span className="text-base font-black text-gray-800 block mt-0.5">{totalItemsInStock} Crates</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Out of Stock Alerts</span>
            <span className="text-base font-black text-gray-800 block mt-0.5">{lowStockAlertsCount} Products</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Inventory Status</span>
            <span className="text-base font-black text-green-600 block mt-0.5">100% HEALTHY</span>
          </div>
        </div>
      </div>

      {/* Tools Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 mb-3 gap-3 flex-shrink-0">
        <div>
          <h2 className="text-sm font-black text-gray-800">Live Stock Ledger & Inventory Matrix</h2>
          <p className="text-gray-400 text-[10px] mt-0.5">Centralized available warehouse stock balancer and retailer visibility tracking ledger</p>
        </div>

        <div className="relative max-w-xs w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input type="text" placeholder="Search stocks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-8 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs outline-none transition font-medium shadow-sm" />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
              <X className="w-4 h-4 bg-gray-100 p-0.5 rounded-full" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Tabs Selector */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none border-b border-gray-50 flex-shrink-0">
        {categoriesMenu.map((cat) => (
          <button key={cat} onClick={() => setSearchTerm("") || setActiveCategory(cat)} className={`px-3 py-1 rounded-xl font-black text-[10px] tracking-tight uppercase border transition-all flex-shrink-0 ${activeCategory === cat ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Main Inventory Ledger Sheets Grid Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 flex-1 overflow-y-auto scrollbar-none bg-white">
        <table className="w-full text-left border-collapse text-xs table-fixed">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm border-b">
            <tr className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-3 w-1/3">Product Description</th>
              <th className="p-3 w-1/5">Total Inward (A)</th>
              <th className="p-3 w-1/5">Booked Orders (B)</th>
              <th className="p-3 w-1/5">Available Stock (A-B)</th>
              <th className="p-3 w-1/5">Warehouse Alert</th>
              <th className="p-3 w-1/5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {filteredProducts.map((product) => {
              const inward = product.depotInward || 0;
              const outward = product.retailOutward || 0;
              const balance = product.currentStock || 0;

              const isOutOfStock = balance === 0;
              const hasLiveImage = product.image && product.image.startsWith("http");
              const unitLabel = product.category === "Milk" ? "Crates" : "Boxes";

              return (
                <tr key={product._id || product.id} className="hover:bg-gray-50/80 transition">
                  {/* ⚡ इमेज बॉक्स का साइज w-11 h-11 किया गया ताकि डिफॉल्ट रूप से भी थोड़ा बड़ा और साफ दिखे */}
                  <td className="p-3 font-bold text-gray-800 flex items-center space-x-2.5 truncate stock-zoom-container">
                    <div className="p-1 w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0 stock-zoom-container">{hasLiveImage ? <img src={product.image} alt="" className="w-full h-full object-contain rounded-lg stock-floating-img cursor-pointer" /> : <span className="text-xl stock-floating-img">{product.image || "🥛"}</span>}</div>
                    <div className="flex flex-col truncate">
                      <span className="text-gray-800 text-xs font-bold truncate">{product.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium font-mono tracking-tight truncate mt-0.5">{product.packText}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-600">
                    {inward} {unitLabel}
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-600">
                    {outward} {unitLabel}
                  </td>
                  <td className="p-3 font-mono font-black text-blue-600 text-xs">
                    {balance} {unitLabel}
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${isOutOfStock ? "bg-red-100 text-red-700 border border-red-200" : "bg-green-100 text-green-700 border border-green-200"}`}>{isOutOfStock ? "OUT OF STOCK ❌" : "IN STOCK ✓"}</span>
                  </td>

                  <td className="p-3 text-center">
                    <button onClick={() => handleAddInventoryClick(product)} className="p-1.5 bg-green-50 border border-green-200 text-green-600 rounded-lg hover:bg-green-100 transition shadow-sm flex items-center justify-center mx-auto" title="Adjust Depot Stock">
                      {/* प्लस-माइनस का यूनिवर्सल टूल आइकॉन */}
                      <PlusCircle className="w-4 h-4" />
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
          <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <span>No stock records found matching the metrics criteria!</span>
        </div>
      )}
    </div>
  );
}
