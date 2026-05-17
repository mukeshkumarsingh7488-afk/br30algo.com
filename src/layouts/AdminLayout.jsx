import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }) {
  const [currentPanel, setCurrentPanel] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // मोबाइल साइडबार स्टेट

  return (
    <div className="flex bg-gray-100 min-h-screen overflow-hidden text-xs">
      {/* 📱 मोबाइल हेडर और मेनू बटन (कंप्यूटर पर छुप जाएगा) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-slate-900 text-white flex items-center justify-between px-4 z-30 shadow-md">
        <h1 className="font-black text-sm text-blue-400">सुधा डेयरी / Sudha</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 bg-slate-800 rounded-lg border border-slate-700 focus:outline-none">
          {isSidebarOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* ⚙️ साइडबार कंपोनेंट (मोबाइल पर ओपन/क्लोज़ होगा, कंप्यूटर पर फिक्स रहेगा) */}
      <Sidebar currentPanel={currentPanel} setCurrentPanel={setCurrentPanel} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* 📊 मुख्य कंटेंट एरिया - मोबाइल पर पूरा स्पेस (`ml-0`), कंप्यूटर पर `md:ml-64` */}
      <div className="flex-1 md:ml-64 px-4 md:px-8 pt-16 md:pt-4 pb-4 h-screen overflow-y-auto w-full transition-all duration-300">{children(currentPanel)}</div>
    </div>
  );
}
