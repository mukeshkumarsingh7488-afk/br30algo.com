import React, { useState } from "react";
import { BarChart3, TrendingUp, DollarSign, Calendar, X, FileSpreadsheet, FileText, ArrowUpRight, Award, Zap, ShieldAlert, Printer } from "lucide-react";

export default function SalesHistory() {
  const [startDate, setStartDate] = useState("2026-05-11");
  const [endDate, setEndDate] = useState("2026-05-15");
  const [selectedRoute, setSelectedRoute] = useState("All");

  const [dailySalesDatabase, setDailySalesDatabase] = useState([
    {
      date: "2026-05-15",
      pariharSales: 1120,
      sonbarsaSales: 3150,
      milkVolume: 140,
    },
    {
      date: "2026-05-14",
      pariharSales: 12400,
      sonbarsaSales: 9800,
      milkVolume: 740,
    },
    {
      date: "2026-05-13",
      pariharSales: 15600,
      sonbarsaSales: 11200,
      milkVolume: 890,
    },
    {
      date: "2026-05-12",
      pariharSales: 14200,
      sonbarsaSales: 13500,
      milkVolume: 920,
    },
    {
      date: "2026-05-11",
      pariharSales: 16800,
      sonbarsaSales: 12100,
      milkVolume: 960,
    },
  ]);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "---";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const filteredData = dailySalesDatabase.filter((row) => {
    const matchesStartDate = startDate ? row.date >= startDate : true;
    const matchesEndDate = endDate ? row.date <= endDate : true;
    return matchesStartDate && matchesEndDate;
  });

  let totalSales = 0;
  let totalVolumeLtr = 0;
  let pariharTotal = 0;
  let sonbarsaTotal = 0;

  filteredData.forEach((row) => {
    pariharTotal += row.pariharSales;
    sonbarsaTotal += row.sonbarsaSales;

    if (selectedRoute === "All") {
      totalSales += row.pariharSales + row.sonbarsaSales;
      totalVolumeLtr += row.milkVolume;
    } else if (selectedRoute === "Parihar Route") {
      totalSales += row.pariharSales;
      totalVolumeLtr += Math.round(row.milkVolume * 0.55);
    } else if (selectedRoute === "Sonbarsa Route") {
      totalSales += row.sonbarsaSales;
      totalVolumeLtr += Math.round(row.milkVolume * 0.45);
    }
  });

  const netProfit = Math.round(totalSales * 0.1);

  let bestRoute = "N/A";
  if (pariharTotal > 0 || sonbarsaTotal > 0) {
    if (pariharTotal === sonbarsaTotal) {
      bestRoute = "दोनो बराबर / Tie";
    } else {
      bestRoute = pariharTotal > sonbarsaTotal ? "Khushi Enterprises (Parihar)" : "Kartik Enterprises (Sonbarsa)";
    }
  }

  // 🎯 डायनेमिक हेडर नेम डिसाइडर इंजन (रूट के हिसाब से नाम तय करेगा)
  const getHeaderName = () => {
    if (selectedRoute === "Parihar Route") {
      return {
        hindi: "खुशी एंटरप्राइजेज (सुधा डेयरी वितरण एजेंसी)",
        eng: "KHUSHI ENTERPRISES (SUDHA DAIRY DISTRIBUTION)",
      };
    } else if (selectedRoute === "Sonbarsa Route") {
      return {
        hindi: "कार्तिक एंटरप्राइजेज (सुधा डेयरी वितरण एजेंसी)",
        eng: "KARTIK ENTERPRISES (SUDHA DAIRY DISTRIBUTION)",
      };
    } else {
      return {
        hindi: "खुशी एंटरप्राइजेज और कार्तिक एंटरप्राइजेज (सुधा डेयरी)",
        eng: "KHUSHI & KARTIK ENTERPRISES (SUDHA DAIRY)",
      };
    }
  };

  const currentHeader = getHeaderName();

  // 📊 Excel/CSV Audit Generation Engine (100% Clean English Code)
  const exportToExcel = () => {
    if (filteredData.length === 0) return;
    let csvContent = "\uFEFF";

    // हेडर में एजेंसी का नाम इंग्लिश वेरिएबल से लोड होगा
    csvContent += `Agency: ${currentHeader.english || "Khushi Enterprises Parihar Sales"}\n\n`;

    if (selectedRoute === "All") {
      // ⚡ ऑल रूट्स के लिए शुद्ध इंग्लिश कॉलम हेडिंग्स
      csvContent += "Date,Khushi Enterprises Sales (Parihar),Kartik Enterprises Sales (Sonbarsa),Total Sales,Net Profit\n";
      filteredData.forEach((row) => {
        const dayTotal = row.pariharSales + row.sonbarsaSales;
        csvContent += `${formatDateDisplay(row.date)},₹${row.pariharSales},₹${row.sonbarsaSales},₹${dayTotal},₹${Math.round(dayTotal * 0.1)}\n`;
      });
    } else {
      const activeName = selectedRoute === "Parihar Route" ? "Khushi Enterprises (Parihar)" : "Kartik Enterprises (Sonbarsa)";

      // ⚡ सिंगल रूट के लिए शुद्ध इंग्लिश कॉलम हेडिंग्स
      csvContent += "Date,${activeName} Sales,Net Profit\n";
      filteredData.forEach((row) => {
        const val = selectedRoute === "Parihar Route" ? row.pariharSales : row.sonbarsaSales;
        csvContent += `${formatDateDisplay(row.date)},₹${val},₹${Math.round(val * 0.1)}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Sales_Report_${selectedRoute.replace(" ", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 select-none max-w-5xl mx-auto text-xs font-sans">
      {/* 🛠️ सख्त प्रिंट मीडिया नियम */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; background-color: white !important; }
          .max-w-5xl, .max-w-5xl * { visibility: visible !important; }
          .max-w-5xl { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          .border { border: 1px solid #e2e8f0 !important; }
          table { width: 100% !important; border: 1px solid #cbd5e1 !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #cbd5e1 !important; padding: 12px 8px !important; text-align: left !important; }
          tr { page-break-inside: avoid !important; }
        }
      `}</style>

      {/* 🏢 सिर्फ प्रिंट पीडीएफ में सबसे ऊपर दिखने वाला डायनेमिक ऑफिशियल बिल हेडर */}
      <div className="hidden print:block text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-xl font-black text-gray-900 tracking-wide uppercase">{currentHeader.hindi}</h1>
        <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-wider font-mono">{currentHeader.eng}</p>
        <p className="text-[11px] font-bold text-gray-500 mt-2">ऑफ़िशियल सेल्स एवं प्रॉफ़िट इनवॉइस रिपोर्ट / Official Business Analytics</p>
        <div className="flex justify-between items-center text-[10px] font-bold text-gray-600 mt-4 px-1">
          <span>
            📅 अवधि / Duration: {formatDateDisplay(startDate)} से {formatDateDisplay(endDate)}
          </span>
          <span>🚚 रूट / Selected Route: {selectedRoute === "All" ? "सभी रूट्स (All Routes)" : selectedRoute}</span>
        </div>
      </div>

      {/* कंट्रोल्स फ़िल्टर पैनल (प्रिंट दबाते ही गायब हो जाएगा) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Sales & Profit Analytics Dashboard</span>
          </h2>
          <p className="text-gray-400 text-[11px] mt-0.5">Set Date Range, Select Route, and Directly Export Live Excel or Print Bills</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-xl outline-none font-bold text-gray-700 bg-gray-50 text-[11px] cursor-pointer shadow-sm"
          >
            <option value="All">All Routes</option>
            <option value="Parihar Route">Parihar Route</option>
            <option value="Sonbarsa Route">Sonbarsa Route</option>
          </select>
          <div className="relative w-32">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-3 pr-7 py-1.5 border border-gray-300 rounded-xl outline-none font-semibold text-gray-700 bg-white shadow-sm"
            />
            {startDate && (
              <button onClick={() => setStartDate("")} className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                <X className="w-3 h-3 bg-gray-100 p-0.5 rounded-full" />
              </button>
            )}
          </div>
          <div className="relative w-32">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-3 pr-7 py-1.5 border border-gray-300 rounded-xl outline-none font-semibold text-gray-700 bg-white shadow-sm"
            />
            {endDate && (
              <button onClick={() => setEndDate("")} className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                <X className="w-3 h-3 bg-gray-100 p-0.5 rounded-full" />
              </button>
            )}
          </div>
          <button onClick={exportToExcel} className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-xl transition shadow-sm text-[11px]">
            <FileSpreadsheet className="w-3.5 h-3.5" /> <span>Excel</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center space-x-1 bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1.5 rounded-xl transition shadow-sm text-[11px]">
            <Printer className="w-3.5 h-3.5" /> <span>PDF / Print</span>
          </button>
        </div>
      </div>

      {/* 📊 4 बॉक्स ग्रिड */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-3.5 print:border-gray-300">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl print:hidden">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Total Sales</span>
            <span className="text-xl font-black text-gray-800 block mt-0.5">₹{totalSales.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-3.5 print:border-gray-300">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl print:hidden">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Net Profit</span>
            <span className="text-xl font-black text-emerald-600 block mt-0.5">₹{netProfit.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-3.5 print:border-gray-300">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl print:hidden">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Total Milk Volume</span>
            <span className="text-xl font-black text-indigo-600 block mt-0.5">{totalVolumeLtr.toLocaleString("en-IN")} Ltr</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-3.5 print:border-gray-300">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl print:hidden">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Top Selling Route (Live)</span>
            <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-lg mt-1 inline-block truncate max-w-[140px] print:border-none print:p-0 print:text-xs">
              {bestRoute}
            </span>
          </div>
        </div>
      </div>

      {/* दैनिक रिकॉर्ड तालिका सूची */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm print:border-none print:p-0">
        <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2.5 mb-3 print:hidden">Daily Sales and Profit Statements Registry</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-100 print:border-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px] print:bg-gray-100">
                <th className="p-3">Date</th>
                {(selectedRoute === "All" || selectedRoute === "Parihar Route") && <th className="p-3">Khushi Enterprises Sales Matrix</th>}
                {(selectedRoute === "All" || selectedRoute === "Sonbarsa Route") && <th className="p-3">Kartik Enterprises Sales Matrix</th>}
                <th className="p-3 font-bold text-blue-600">Selected Period Total Sales Matrix</th>
                <th className="p-3 text-emerald-600 font-bold">Net Profit Margin Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredData.map((row, idx) => {
                let currentDayTotal = 0;
                if (selectedRoute === "All") currentDayTotal = row.pariharSales + row.sonbarsaSales;
                else if (selectedRoute === "Parihar Route") currentDayTotal = row.pariharSales;
                else if (selectedRoute === "Sonbarsa Route") currentDayTotal = row.sonbarsaSales;
                return (
                  <tr key={idx} className="hover:bg-gray-50/80 transition">
                    <td className="p-3 font-semibold text-gray-500">{formatDateDisplay(row.date)}</td>
                    {(selectedRoute === "All" || selectedRoute === "Parihar Route") && <td className="p-3 font-mono">₹{row.pariharSales.toLocaleString("en-IN")}</td>}
                    {(selectedRoute === "All" || selectedRoute === "Sonbarsa Route") && <td className="p-3 font-mono">₹{row.sonbarsaSales.toLocaleString("en-IN")}</td>}
                    <td className="p-3 font-mono font-black text-blue-600 text-xs">₹{currentDayTotal.toLocaleString("en-IN")}</td>
                    <td className="p-3 font-mono font-black text-emerald-600">₹{Math.round(currentDayTotal * 0.1).toLocaleString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="text-center py-10 text-gray-400 font-semibold bg-gray-50 rounded-xl mt-3 border border-dashed border-gray-200">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <span>इस कस्टम तारीख की रेंज में कोई डेटा रिकॉर्ड उपलब्ध नहीं है!</span>
          </div>
        )}
      </div>

      {/* सिर्फ प्रिंट में नीचे दिखने वाली मुहर और हस्ताक्षर */}
      <div className="hidden print:flex justify-between items-center mt-12 px-2">
        <div className="text-center">
          <div className="w-28 border-b border-gray-400 mb-1 mx-auto"></div>
          <p className="text-[9px] font-bold text-gray-400">तैयार करने वाले के हस्ताक्षर</p>
        </div>
        <div className="text-center">
          <div className="w-28 border-b border-gray-400 mb-1 mx-auto"></div>
          <p className="text-[9px] font-bold text-gray-400">आधिकारिक मुहर एवं हस्ताक्षर</p>
        </div>
      </div>
    </div>
  );
}
