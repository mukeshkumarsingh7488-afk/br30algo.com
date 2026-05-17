import React, { useState } from "react";
import { Search, Calendar, X, CheckCircle2, FileSpreadsheet, ShieldAlert, MapPin, Eye, ShoppingCart, TrendingUp, Hash, User } from "lucide-react";

export default function OrderHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-05-15"); 
  const [selectedRoute, setSelectedRoute] = useState("All");

  const [orders, setOrders] = useState([
    {
      orderId: "ORD9382",
      shopName: "Rohan General Store",
      proprietor: "Rohan Kumar",
      dealerCode: "305831",
      route: "Parihar Route",
      address: "Kumma Chowk, Parihar",
      date: "15/05/2026",
      totalAmount: 560,
      items: [
        { name: "Sudha Standard Milk 500ml", qty: 10, unit: "Ltr", price: 26 },
        { name: "Sudha Lassi 200ml", qty: 50, unit: "Pcs", price: 6 },
      ],
    },
    {
      orderId: "ORD9385",
      shopName: "Krishna Milk Agency",
      proprietor: "Krishna Singh",
      dealerCode: "305835",
      route: "Parihar Route",
      address: "Parihar Market",
      date: "15/05/2026",
      totalAmount: 560,
      items: [
        { name: "Sudha Standard Milk 500ml", qty: 10, unit: "Ltr", price: 26 },
        { name: "Sudha Lassi 200ml", qty: 50, unit: "Pcs", price: 6 },
      ],
    },
    {
      orderId: "ORD9383",
      shopName: "Manoj Kirana Agency",
      proprietor: "Manoj Singh",
      dealerCode: "305840",
      route: "Sonbarsa Route",
      address: "Main Market, Sonbarsa",
      date: "15/05/2026",
      totalAmount: 3150,
      items: [
        {
          name: "Sudha Full Cream Milk 1000ml",
          qty: 12,
          unit: "Ltr",
          price: 60,
        },
        { name: "Sudha Pure Ghee 1L", qty: 5, unit: "Pcs", price: 486 },
      ],
    },
  ]);

  const convertDateToFormat = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // सर्च बार और रूट ड्रॉपडाउन का मुख्य फ़िल्टर लॉजिक
  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    const formattedFilterDate = convertDateToFormat(selectedDate);

    const codeString = order.dealerCode ? String(order.dealerCode).toLowerCase() : "";
    const shopString = order.shopName ? order.shopName.toLowerCase() : "";
    const propString = order.proprietor ? order.proprietor.toLowerCase() : "";
    const idString = order.orderId ? order.orderId.toLowerCase() : "";

    const matchesSearch = shopString.includes(search) || idString.includes(search) || codeString.includes(search) || propString.includes(search);
    const matchesDate = formattedFilterDate ? order.date === formattedFilterDate : true;
    const matchesRoute = selectedRoute === "All" ? true : order.route === selectedRoute;

    return matchesSearch && matchesDate && matchesRoute;
  });

  const currentRouteTotalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // डिपो एक्सेल डाउनलोड इंजन
  const downloadMergedExcel = () => {
    const mergedItems = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (mergedItems[item.name]) {
          mergedItems[item.name].qty += item.qty;
          mergedItems[item.name].totalPrice += item.qty * item.price;
        } else {
          mergedItems[item.name] = {
            name: item.name,
            qty: item.qty,
            unit: item.unit,
            totalPrice: item.qty * item.price,
          };
        }
      });
    });

    const itemKeys = Object.keys(mergedItems);
    if (itemKeys.length === 0) {
      window.Swal.fire({
        title: "कोई ऑर्डर डेटा नहीं मिला!",
        text: "इस रूट और तारीख में कोई ऑर्डर लिस्टेड नहीं है।",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    let csvContent = "\uFEFF";
    csvContent += "Product Name, Total Qty, Unit, Total Value\n";

    itemKeys.forEach((key) => {
      const row = mergedItems[key];
      csvContent += `"${row.name}",${row.qty},${row.unit},₹${row.totalPrice}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const formattedDate = convertDateToFormat(selectedDate).replace(/\//g, "-");
    link.setAttribute("download", `Sudha_Order_${selectedRoute.replace(" ", "_")}_${formattedDate}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.Swal.fire({
      title: "एक्सेल शीट डाउनलोड सफल!",
      text: `${selectedRoute} की साफ़ रिपोर्ट डाउनलोड हो चुकी है।`,
      icon: "success",
      confirmButtonColor: "#2563eb",
    });
  };

  const openInvoiceModal = (order) => {
    const itemsListHtml = order.items
      .map(
        (item) => `
      <div class="flex justify-between text-xs p-2 bg-gray-50 rounded-xl border border-gray-100">
        <span class="font-bold text-gray-700">${item.name}</span>
        <span class="font-mono font-black text-blue-600">${item.qty} ${item.unit} × ₹${item.price}</span>
      </div>
    `,
      )
      .join("");

    window.Swal.fire({
      title: `<span class="text-sm font-black text-gray-800">ऑर्डर रसीद विवरण / Invoice Summary</span>`,
      html: `
        <div class="text-left text-xs font-sans space-y-3 select-none">
          <div class="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/60">
            <h4 class="font-black text-blue-700 text-sm">🏪 ${order.shopName}</h4>
            <p class="text-[10px] font-bold text-gray-500 mt-1">Owner: ${order.proprietor} • Sudha Code: ${order.dealerCode}</p>
            <p class="text-[10px] font-medium text-gray-400 mt-0.5">🆔 Order ID: ${order.orderId} • 📅 तारीख: ${order.date}</p>
          </div>
          <div class="space-y-1.5">
            ${itemsListHtml}
          </div>
          <div class="border-t border-dashed mt-2 pt-2 flex justify-between items-center font-black text-gray-800">
            <span>कुल राशि / Net Amount</span>
            <span class="text-base text-emerald-600">₹${order.totalAmount}</span>
          </div>
        </div>
      `,
      confirmButtonColor: "#2563eb",
      confirmButtonText: "बंद करें",
    });
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm select-none max-w-5xl mx-auto text-xs h-[calc(100vh-32px)] flex flex-col overflow-hidden w-full">
      {/* 📊 रूट लाइव बॉक्स */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Active Route Orders</span>
            <span className="text-xl font-black text-gray-800 block mt-0.5">{filteredOrders.length} Retail Shops</span>
          </div>
        </div>
        <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Current Route Value</span>
            <span className="text-xl font-black text-emerald-600 block mt-0.5">₹{currentRouteTotalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* हेडर और कंट्रोल फ़िल्टर्स एरिया */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 pb-3 mb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Order Dispatch History</h2>
          <p className="text-gray-400 text-[11px] mt-0.5">Merge Route-Wise Orders and Export Excel Report Directly for Sudha Dairy Depot</p>
        </div>

        {/* फ़िल्टर्स पैनल ग्रिड */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. डायनेमिक रूट सेलेक्टर - 'All Routes' विकल्प के साथ */}
          <div className="relative">
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition cursor-pointer text-xs"
            >
              <option value="All">All Routes</option>
              <option value="Parihar Route">Parihar Route</option>
              <option value="Sonbarsa Route">Sonbarsa Route</option>
            </select>
          </div>

          {/* 2. सर्च बार - इसकी चौड़ाई w-36 से बढ़ाकर w-48 की गई */}
          <div className="relative w-48">
            <input
              type="text"
              placeholder="दुकान, मालिक या कोड..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-7 py-1.5 border border-gray-300 rounded-xl outline-none font-medium"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3 bg-gray-100 p-0.5 rounded-full" />
              </button>
            )}
          </div>

          {/* 3. कैलेंडर फ़िल्टर */}
          <div className="relative w-36">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-3 pr-7 py-1.5 border border-gray-300 rounded-xl outline-none font-semibold text-gray-700 bg-white"
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate("")} className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3 bg-gray-100 p-0.5 rounded-full" />
              </button>
            )}
          </div>

          {/* 4. एक्सेल डाउनलोड बटन */}
          <button onClick={downloadMergedExcel} className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition shadow-sm text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Route Order</span>
          </button>
        </div>
      </div>

      {/* ऑर्डर टेबल ग्रिड */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 flex-1 overflow-y-auto scrollbar-none bg-white w-full max-w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-3">Order ID</th>
              <th className="p-3">Shop Details</th>
              <th className="p-3">Dealer Code</th>
              <th className="p-3">Date</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {filteredOrders.map((order) => (
              <tr key={order.orderId} className="hover:bg-gray-50/80 transition">
                <td className="p-3 font-mono font-bold text-blue-600 tracking-tight">{order.orderId}</td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-xs">{order.shopName}</span>
                    {/* प्रोप्राइटर/मालिक का नाम यहाँ साफ़-साफ़ जोड़ दिया गया है */}
                    <span className="text-[10px] text-gray-500 font-semibold mt-0.5 flex items-center">
                      <User className="w-2.5 h-2.5 mr-0.5 text-gray-400" /> Prop: {order.proprietor}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium inline-flex items-center mt-0.5">
                      <MapPin className="w-2.5 h-2.5 mr-0.5 text-blue-400" /> {order.route}
                    </span>
                  </div>
                </td>

                <td className="p-3">
                  <span className="inline-flex items-center space-x-1 font-mono font-bold px-2.5 py-1 rounded-xl border bg-indigo-50 border-indigo-100 text-indigo-600">
                    <Hash className="w-3 h-3" />
                    <span>{order.dealerCode}</span>
                  </span>
                </td>

                <td className="p-3 text-gray-500 font-semibold">{order.date}</td>
                <td className="p-3 font-black text-gray-700">₹{order.totalAmount}</td>
                <td className="p-3">
                  <span className="inline-flex items-center space-x-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SUCCESS</span>
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => openInvoiceModal(order)}
                    className="bg-blue-50 border border-blue-200 text-blue-600 font-bold px-3 py-1 rounded-xl text-[10px] hover:bg-blue-100 transition shadow-sm"
                  >
                    View Bill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-10 text-gray-400 font-semibold bg-gray-50 rounded-xl mt-3 border border-dashed border-gray-200">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <span>इस रूट, नाम या कोड का कोई ऑर्डर रिकॉर्ड मौजूद नहीं है!</span>
        </div>
      )}
    </div>
  );
}
