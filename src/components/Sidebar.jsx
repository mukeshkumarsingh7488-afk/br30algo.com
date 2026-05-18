import React from "react";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, PlusCircle, Settings, UserPlus, Users, FileText, History, BarChart3, LogOut, Zap } from "lucide-react";

export default function Sidebar({ currentPanel, setCurrentPanel, isOpen, setIsOpen }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "overview", text: "Overview", icon: LayoutDashboard },
    { id: "list-product", text: "List New Product", icon: PlusCircle },
    { id: "manage-product", text: "Manage Product", icon: Settings },
    { id: "stock-panel", text: "Live Stock Inventory", icon: Zap },
    { id: "register-user", text: "Register Retailer/Staff", icon: UserPlus },
    { id: "register-delivery", text: "Register Delivery Boy", icon: UserPlus },
    { id: "manage-delivery", text: "Manage Delivery Boy", icon: Users },
    { id: "manage-user", text: "Manage Retailer", icon: Users },
    { id: "invoice-entry", text: "Dairy Invoice Entry", icon: FileText },
    { id: "order-history", text: "Order History", icon: History },
    { id: "sales-history", text: "Sales History", icon: BarChart3 },
  ];

  const handleNavClick = (id) => {
    setCurrentPanel(id);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && <div onClick={() => setIsOpen(false)} className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" />}

      <div className={`w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-40 shadow-2xl transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-slate-800 text-center">
          <h1 className="text-xl font-black text-blue-400 tracking-wide">सुधा डेयरी</h1>
          <div className="mt-1.5 px-3 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-[10px] font-bold text-blue-300 inline-block">{user?.root || "Root-1"}</div>
          <p className="text-slate-500 text-[10px] mt-1 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPanel === item.id;
            return (
              <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                <IconComponent className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.text}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center justify-center space-x-2 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl font-bold transition duration-150">
            <LogOut className="w-4 h-4" />
            <span>लॉगआउट करें</span>
          </button>
        </div>
      </div>
    </>
  );
}
