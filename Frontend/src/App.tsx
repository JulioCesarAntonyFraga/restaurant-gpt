import { useState } from "react";
import {
  Menu,
  ShoppingBag,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Routes, Route, Link } from "react-router-dom";

import Orders from "./pages/Orders";
import MenuList from "./pages/MenuList";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex overflow-hidden h-screen text-gray-800 bg-white">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-gradient-to-br from-[#88e5fc] to-blue-100 shadow-lg text-white`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-white/20">
            <span className="font-bold text-lg flex items-center gap-2">
              <Menu onClick={() => setIsSidebarOpen(true)} />
              {isSidebarOpen && "Menu"}
            </span>
            {isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-white/70"
              >
                <ChevronLeft />
              </button>
            )}
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/orders"
              className="flex items-center gap-2 p-2 rounded hover:bg-white/20 transition"
            >
              <ShoppingBag size={20} />
              {isSidebarOpen && "Pedidos"}
            </Link>
            <Link
              to="/menu"
              className="flex items-center gap-2 p-2 rounded hover:bg-white/20 transition"
            >
              <ClipboardList size={20} />
              {isSidebarOpen && "Cardápio"}
            </Link>
          </nav>
        </div>
        {!isSidebarOpen && (
          <div className="p-2 text-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-white/70"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <header className="h-16 flex items-center px-6 shadow bg-gradient-to-r from-[#88e5fc] to-blue-100 text-white border-b border-white/20">
          <h1 className="text-2xl font-semibold">Restaurant GPT</h1>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/orders" element={<Orders />} />
            <Route path="/menu" element={<MenuList />} />
            <Route path="*" element={<Orders />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
