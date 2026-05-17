import React, { useState, useEffect } from "react";
import axios from "axios";
import { useProducts } from "../../context/ProductContext";
import { FileText, PlusCircle, Calendar, Hash, IndianRupee, Camera, Eye, Trash2, Search, X, ShieldAlert, Truck, CheckCircle2, FileSpreadsheet, Plus, Trash, Layers, MapPin, Download } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function InvoiceEntry() {
  const { products, refreshInventory } = useProducts();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [route, setRoute] = useState("Parihar Route");
  const [totalAmount, setTotalAmount] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [uploadedPages, setUploadedPages] = useState([]);

  const [invoiceItems, setInvoiceItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQty, setItemQty] = useState("");

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [modalSearchText, setModalSearchText] = useState("");

  const fetchLiveInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("sudha_token");
      if (!token) return;
      const response = await axios.get(`${API_URL}/invoices/history`);
      if (response.data && response.data.success) {
        setInvoices(response.data.data);
      }
    } catch (error) {
      console.error("❌ Fetch Invoices API Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveInvoices();
  }, []);

  const addProductToInvoiceList = () => {
    if (!selectedProduct || !itemQty || parseInt(itemQty) <= 0) {
      window.Swal.fire({
        title: "Invalid Quantity",
        text: "Please choose a valid product variant and input count!",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    if (invoiceItems.some((item) => item.productId === selectedProduct._id)) {
      window.Swal.fire({
        title: "Duplicate Item",
        text: "This variant data is already added to current bill portfolio!",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    setInvoiceItems([
      ...invoiceItems,
      {
        productId: selectedProduct._id,
        name: selectedProduct.name,
        qty: parseInt(itemQty),
        packText: selectedProduct.packText || "1 Crate",
      },
    ]);
    setSelectedProduct(null);
    setItemQty("");
  };

  const removeProductFromInvoiceList = (index) => {
    setInvoiceItems(invoiceItems.filter((_, idx) => idx !== index));
  };

  const handlePageUpload = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPages([...uploadedPages, reader.result]);
        window.Swal.fire({
          title: "Page Captured",
          text: `Invoice Page ${uploadedPages.length + 1} added to queue.`,
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const removeUploadedPage = (index) => {
    setUploadedPages(uploadedPages.filter((_, idx) => idx !== index));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (invoiceItems.length === 0) {
      window.Swal.fire({
        title: "No Products Added!",
        text: "Please add at least one product item from the invoice sheet before saving.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    if (uploadedPages.length === 0) {
      window.Swal.fire({
        title: "No Scan Copied!",
        text: "Please capture at least 1 photo of the dairy invoice bill.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    window.Swal.fire({
      title: "Uploading Bill & Syncing Stock...",
      text: "Processing parameters into MongoDB Atlas Cloud, please wait.",
      allowOutsideClick: false,
      didOpen: () => {
        window.Swal.showLoading();
      },
    });

    let formattedDate = invoiceDate;
    if (invoiceDate.includes("-")) {
      const [year, month, day] = invoiceDate.split("-");
      formattedDate = `${day}/${month}/${year}`;
    }

    const newInvoicePayload = {
      invoiceNo: invoiceNo.toUpperCase().trim(),
      invoiceDate: formattedDate,
      vehicleNo: vehicleNo.toUpperCase().trim(),
      route,
      totalAmount: parseFloat(totalAmount),
      taxAmount: parseFloat(taxAmount || 0),
      items: invoiceItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        qty: parseInt(item.qty),
        packText: item.packText,
      })),
      pages: uploadedPages,
    };

    try {
      const response = await axios.post(`${API_URL}/invoices/entry`, newInvoicePayload);
      window.Swal.close();
      if (response.data && response.data.success) {
        window.Swal.fire({
          title: "Saved Successfully!",
          text: response.data.message,
          icon: "success",
          confirmButtonColor: "#2563eb",
        });
        setInvoiceNo("");
        setInvoiceDate("");
        setVehicleNo("");
        setRoute("Parihar Route");
        setTotalAmount("");
        setTaxAmount("");
        setUploadedPages([]);
        setInvoiceItems([]);
        setSelectedProduct(null);
        await fetchLiveInvoices();
        await refreshInventory();
      }
    } catch (error) {
      window.Swal.close();
      window.Swal.fire({
        title: "Upload Failed!",
        text: error.response?.data?.message || "Network server error!",
        icon: "error",
      });
    }
  };

  const deleteInvoice = (id, number) => {
    window.Swal.fire({
      title: "Erase Invoice Record?",
      text: `Invoice No ${number} will be deleted permanently!`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${API_URL}/invoices/delete/${id}`);
          if (response.data && response.data.success) {
            await fetchLiveInvoices();
            window.Swal.fire({
              title: "Deleted!",
              text: response.data.message,
              icon: "success",
              timer: 1500,
            });
          }
        } catch (error) {
          window.Swal.fire({
            title: "Error!",
            text: "Failed to erase invoice.",
            icon: "error",
          });
        }
      }
    });
  };
  // 📊 Excel Sheet Data Audit Generation Engine
  const exportInvoicesToExcel = () => {
    if (filteredInvoices.length === 0) return;
    let csvContent = "\uFEFF";
    csvContent += "Invoice No,Vehicle No,Route,Bill Date,Gross Amount,GST\n";
    filteredInvoices.forEach((inv) => {
      csvContent += `${inv.invoiceNo},${inv.vehicleNo},${inv.route || "N/A"},${inv.invoiceDate},₹${inv.totalAmount},₹${inv.taxAmount}\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Sudha_Dairy_Invoices_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🎯 [UPGRADED INVOICE VIEW POPUP WITH PDF PRINT/DOWNLOAD BUTTON]
  const openInvoiceViewPopup = (invoice) => {
    let currentPageIdx = 0;

    const itemsListHtml = (invoice.items || [])
      .map(
        (it) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 6px; font-weight: bold; color: #1e293b; text-align: left;">• ${it.name}</td>
        <td style="padding: 6px; font-family: monospace; font-weight: bold; text-align: center; color: #2563eb;">${it.qty} Crates</td>
      </tr>
    `,
      )
      .join("");

    const renderPopupContent = (idx) => `
      <div id="print-invoice-area" style="text-align: left; font-size: 12px; font-family: sans-serif; max-height: 75vh; overflow-y: auto; padding-right: 4px;">
        <div style="background-color: #f0f7ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 12px; margin-bottom: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-weight: 500; color: #334155;">
          <p style="margin:0;">📄 <b>Invoice No:</b> <span style="color: #2563eb; font-weight: 800;">${invoice.invoiceNo}</span></p>
          <p style="margin:0;">📅 <b>Bill Date:</b> <span style="color: #0f172a; font-weight: 600;">${invoice.invoiceDate}</span></p>
          <p style="margin:0;">🚚 <b>Vehicle No:</b> <span style="font-family: monospace; font-weight: bold; color: #0f172a;">${invoice.vehicleNo}</span></p>
          <p style="margin:0;">🗺️ <b>Route Name:</b> <span style="color: #4f46e5; font-weight: 700;">${invoice.route || "Parihar Route"}</span></p>
          <p style="margin:0; grid-column: span 2;">💰 <b>Gross Total:</b> <span style="color: #16a34a; font-weight: 900;">₹${invoice.totalAmount.toLocaleString("en-IN")}</span></p>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; margin-bottom: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
          <span style="font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 6px; letter-spacing: 0.05em;">📦 Materials Received From Depot</span>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 11px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #64748b;">
                <th style="padding: 6px; text-align: left;">Product Name</th>
                <th style="padding: 6px; text-align: center;">Inward Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml || '<tr><td colspan="2" style="padding:6px; text-align:center; color:#94a3b8;">No items tracked in this invoice.</td></tr>'}
            </tbody>
          </table>
        </div>

        <span class="hide-on-print" style="font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 6px; letter-spacing: 0.05em;">📸 Digital Bill Scans</span>
        <div class="hide-on-print" style="text-align: center; background-color: #0f172a; border-radius: 16px; padding: 8px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; min-h: 240px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 12px;">
          <span style="position: absolute; top: 8px; left: 8px; background-color: rgba(0,0,0,0.6); color: white; font-weight: bold; padding: 2px 6px; border-radius: 6px; font-size: 9px; z-index: 10;">PAGE ${idx + 1} / ${invoice.pages.length}</span>
          <img src="${invoice.pages[idx]}" style="max-width: 100%; max-height: 220px; object-fit: contain; border-radius: 8px;" />
          <div style="display: flex; gap: 8px; margin-top: 8px; width: 100%; justify-content: center;">
            <button id="prevPageBtn" type="button" style="background-color: rgba(255,255,255,0.15); border: none; color: white; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer;">◀ Prev</button>
            <button id="nextPageBtn" type="button" style="background-color: rgba(255,255,255,0.15); border: none; color: white; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer;">Next ▶</button>
          </div>
        </div>

        <button id="downloadPdfBtn" type="button" style="width: 100%; background-color: #16a34a; border: none; color: white; padding: 8px; border-radius: 10px; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 4px 6px rgba(22,163,74,0.2);">
          🖨️ Print & Download Invoice Receipt
        </button>
      </div>
    `;

    const showSwal = (pageIndex) => {
      window.Swal.fire({
        title: `<span style="font-size: 15px; font-weight: 900; color: #1e293b;">Dairy Audit Bill Portfolio</span>`,
        html: renderPopupContent(pageIndex),
        showCloseButton: true,
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Close",
        customClass: { popup: "rounded-3xl p-5" },
        didOpen: () => {
          const prevBtn = document.getElementById("prevPageBtn");
          const nextBtn = document.getElementById("nextPageBtn");
          const dlBtn = document.getElementById("downloadPdfBtn");

          if (prevBtn) {
            prevBtn.addEventListener("click", () => {
              if (currentPageIdx > 0) {
                currentPageIdx--;
                window.Swal.close();
                showSwal(currentPageIdx);
              }
            });
          }
          if (nextBtn) {
            nextBtn.addEventListener("click", () => {
              if (currentPageIdx < invoice.pages.length - 1) {
                currentPageIdx++;
                window.Swal.close();
                showSwal(currentPageIdx);
              }
            });
          }
          if (dlBtn) {
            dlBtn.addEventListener("click", () => {
              const printContent = document.getElementById("print-invoice-area").innerHTML;
              const style = `<style>@media print { .hide-on-print, #downloadPdfBtn, #prevPageBtn, #nextPageBtn { display: none !important; } body { padding: 20px; font-family: sans-serif; } table { width: 100%; border-collapse: collapse; margin-top: 15px; } th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; } }</style>`;
              const printWindow = window.open("", "_blank");
              printWindow.document.write("<html><head><title>Invoice Receipt</title>" + style + "</head><body>" + printContent + "</body></html>");
              printWindow.document.close();
              printWindow.print();
              printWindow.close();
            });
          }
        },
      });
    };
    showSwal(currentPageIdx);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = inv.invoiceNo.toLowerCase().includes(search) || inv.vehicleNo.toLowerCase().includes(search);
    let matchesDate = true;
    if (filterDate) {
      const [year, month, day] = filterDate.split("-");
      matchesDate = inv.invoiceDate === `${day}/${month}/${year}`;
    }
    return matchesSearch && matchesDate;
  });

  return (
    /* ⚡ [MASTER SCREEN REPAIR LOCK]: max-w-full overflow-x-hidden जोड़ा गया ताकि यह पेज कभी भी लेआउट को बाहर न धकेले */
    <div className="max-w-full overflow-x-hidden grid grid-cols-1 lg:grid-cols-3 gap-5 select-none text-xs font-sans min-h-[calc(100vh-32px)] items-start pb-2">
      {/* Left Side: Form Container */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3 h-auto max-h-[calc(100vh-32px)] overflow-y-auto scrollbar-none">
        <div className="flex items-center space-x-2 border-b pb-2 mb-1">
          <PlusCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-gray-800">New Invoice Entry</h2>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-600 mb-1">Invoice / Bill No</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Hash className="w-4 h-4" />
                </span>
                <input type="text" required value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="SUDHA/PAT/XXXX" className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-xl outline-none font-bold uppercase focus:ring-2 focus:ring-blue-500 shadow-sm" />
              </div>
            </div>
            <div>
              <label className="block font-bold text-gray-600 mb-1">Select Delivery Route</label>
              <select value={route} onChange={(e) => setRoute(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-xl outline-none font-bold bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500">
                <option value="Parihar Route">Parihar Route</option>
                <option value="Sonbarsa Route">Sonbarsa Route</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-600 mb-1">Bill Date</label>
              <input type="date" required value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-xl outline-none bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block font-bold text-gray-600 mb-1">Vehicle No</label>
              <input type="text" required value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="BR-30-XXXX" className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-bold uppercase focus:ring-2 focus:ring-blue-500 shadow-sm" />
            </div>
          </div>

          <div className="bg-gray-50 border p-2.5 rounded-xl space-y-2">
            <span className="text-[9px] font-black text-blue-600 uppercase block tracking-wider">📦 Add Bill Content Materials</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setModalSearchText("");
                  setIsSearchModalOpen(true);
                }}
                className="col-span-2 px-2.5 py-2 border border-gray-300 rounded-xl outline-none font-bold text-left bg-white text-gray-700 shadow-sm hover:bg-gray-100 transition truncate"
              >
                {selectedProduct ? `✓ ${selectedProduct.name}` : "[ Select Product / Variant ]"}
              </button>
              <div className="flex items-center justify-center">
                <input type="number" min="1" placeholder="Qty" value={itemQty} onChange={(e) => setItemQty(e.target.value)} className="w-full py-2 border border-gray-300 rounded-xl outline-none font-mono font-black text-center text-sm shadow-sm" />
              </div>
            </div>
            <button type="button" onClick={addProductToInvoiceList} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-xl transition shadow-md flex items-center justify-center space-x-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item to Bill</span>
            </button>

            {invoiceItems.length > 0 && (
              <div className="border-t border-gray-200/60 pt-2 space-y-1 max-h-24 overflow-y-auto scrollbar-none">
                {invoiceItems.map((it, index) => (
                  <div key={index} className="flex justify-between items-center bg-white border border-gray-100 p-1.5 rounded-lg shadow-sm text-[11px] font-semibold text-gray-700">
                    <span className="truncate pr-2">• {it.name}</span>
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <span className="font-mono text-blue-600 font-black bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{it.qty} Crates</span>
                      <button type="button" onClick={() => removeProductFromInvoiceList(index)} className="text-red-500 hover:text-red-700 p-0.5">
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-600 mb-1">Gross Amount Total</label>
              <input type="number" required min="1" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-bold text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block font-bold text-gray-600 mb-1">Tax / GST Amount (₹)</label>
              <input type="number" min="0" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-1.5 border border-gray-300 rounded-xl outline-none font-semibold text-gray-600 shadow-sm" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-600 mb-1.5">Scan Invoice Pages (Camera / File)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-2 bg-gray-50 flex items-center justify-center h-16 shadow-sm hover:bg-gray-100 transition">
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <Camera className="w-4 h-4 text-blue-600 mb-0.5" />
                <span className="text-[10px] font-black text-blue-600">Scan Next Page / Capture</span>
                <input type="file" accept="image/*" capture="environment" onChange={handlePageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {uploadedPages.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex flex-wrap gap-2">
                {uploadedPages.map((page, idx) => (
                  <div key={idx} className="relative w-10 h-10 bg-white border rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
                    <img src={page} alt="" className="max-w-full max-h-full object-contain" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[7px] font-black text-center py-0.5">P-{idx + 1}</span>
                    <button type="button" onClick={() => removeUploadedPage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] font-bold">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition duration-150 shadow-md flex items-center justify-center space-x-1.5 text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Depot Invoice Stock</span>
          </button>
        </form>
      </div>

      {/* Right Side: History Sheet Table Container Frame */}
      {/* ⚡ w-full max-w-full overflow-x-auto से इस ग्रिड को फिक्स किया गया ताकि स्क्रीन को बाहर न धकेले */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm lg:col-span-2 flex flex-col h-full overflow-hidden w-full max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-3 mb-2">
          <div>
            <h2 className="text-base font-black text-gray-800 flex items-center gap-1">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Dairy Invoice Audit History</span>
            </h2>
            <p className="text-gray-400 text-[10px] mt-0.5">Live MongoDB Cloud Synchronized Settlement & Audit Registry</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative w-32">
              <input type="text" placeholder="Search No..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-3 pr-7 py-1.5 border border-gray-300 rounded-xl outline-none font-medium text-xs shadow-sm focus:ring-2 focus:ring-blue-500" />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                  <X className="w-3 h-3 bg-gray-100 p-0.5 rounded-full" />
                </button>
              )}
            </div>
            <div className="relative w-28">
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-xl outline-none font-semibold text-gray-700 bg-white text-xs shadow-sm focus:ring-2 focus:ring-blue-500" />
              {filterDate && (
                <button onClick={() => setFilterDate("")} className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                  <X className="w-3 h-3 bg-gray-100 p-0.5 rounded-full" />
                </button>
              )}
            </div>
            <button type="button" onClick={exportInvoicesToExcel} className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition" title="Export Invoices to Excel">
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 font-bold text-gray-400 animate-pulse flex-1 flex items-center justify-center">Loading live depot logs...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 flex-1 overflow-y-auto scrollbar-none bg-white w-full max-w-full">
            <table className="w-full text-left border-collapse text-xs table-fixed">
              <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm border-b">
                <tr className="bg-gray-50 text-gray-600 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3 w-1/4">Invoice No</th>
                  <th className="p-3 w-1/5">Vehicle</th>
                  <th className="p-3 w-1/5">Date</th>
                  <th className="p-3 w-1/4">Gross Amount</th>
                  <th className="p-3 w-1/5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id || inv.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3 font-mono font-black text-blue-600 tracking-tight truncate">{inv.invoiceNo}</td>
                    <td className="p-3 font-mono font-bold text-gray-800">{inv.vehicleNo}</td>
                    <td className="p-3 text-gray-500 font-semibold">{inv.invoiceDate}</td>
                    <td className="p-3 font-black text-gray-800 text-xs">
                      <div>₹{inv.totalAmount.toLocaleString("en-IN")}</div>
                      <div className="text-[9px] text-gray-400 font-normal mt-0.5">({inv.items?.length || 0} Items Recorded)</div>
                    </td>
                    <td className="p-3 flex items-center justify-center space-x-1.5 h-full mt-1">
                      <button type="button" onClick={() => openInvoiceViewPopup(inv)} title="View Bill Scans & Items" className="p-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => deleteInvoice(inv._id || inv.id, inv.invoiceNo)} className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition shadow-sm">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredInvoices.length === 0 && (
          <div className="text-center py-10 text-gray-400 font-semibold bg-gray-50 rounded-xl mt-2 border border-dashed border-gray-200 flex-1 flex flex-col items-center justify-center">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <span>No invoice logs recorded found!</span>
          </div>
        )}
      </div>

      {/* ============================================================================== */}
      {/* 🚀 [ADVANCED FLOATING SEARCH MODAL POPUP WINDOW] */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 p-4 flex flex-col max-h-[75vh] select-none">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <div>
                <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Select Product Variant</span>
                </h3>
                <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Real-time indexed search for 200+ Sudha catalog items</p>
              </div>
              <button type="button" onClick={() => setIsSearchModalOpen(false)} className="p-1 bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition outline-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mb-3.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input type="text" autoFocus placeholder="Type name or category (e.g. Milk, Dahi, shakti)..." value={modalSearchText} onChange={(e) => setModalSearchText(e.target.value)} className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold tracking-tight shadow-inner" />
              {modalSearchText && (
                <button type="button" onClick={() => setModalSearchText("")} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5 bg-gray-100 p-0.5 rounded-full" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5 pr-1 max-h-[40vh]">
              {products
                .filter((p) => p.name.toLowerCase().includes(modalSearchText.toLowerCase().trim()) || p.category.toLowerCase().includes(modalSearchText.toLowerCase().trim()))
                .map((p) => (
                  <div
                    key={p._id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setIsSearchModalOpen(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border border-gray-100 cursor-pointer transition shadow-sm hover:shadow ${selectedProduct?._id === p._id ? "bg-blue-600 border-blue-600 text-white font-black" : "bg-gray-50/60 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-bold"}`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-base flex-shrink-0">{p.image && p.image.startsWith("http") ? "🥛" : p.image || "🥛"}</span>
                      <span className="truncate text-xs tracking-tight">{p.name}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border flex-shrink-0 ${selectedProduct?._id === p._id ? "bg-blue-700 border-blue-800 text-white" : "bg-white text-gray-400 border-gray-200"}`}>{p.category}</span>
                  </div>
                ))}
              {products.filter((p) => p.name.toLowerCase().includes(modalSearchText.toLowerCase().trim()) || p.category.toLowerCase().includes(modalSearchText.toLowerCase().trim())).length === 0 && (
                <div className="text-center py-8 text-gray-400 font-semibold bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <ShieldAlert className="w-7 h-7 mx-auto mb-1 text-gray-300" />
                  <span>No variant matching search criteria!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ============================================================================== */}
    </div>
  );
}
