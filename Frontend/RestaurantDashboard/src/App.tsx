import { useState } from "react";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sandwich,
  Layers,
  BookOpenText,
  ReceiptText,
} from "lucide-react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

import Orders from "./pages/Orders";
import MenuList from "./pages/MenuList";
import MenuForm from "./pages/MenuForm";
import Login from "./pages/Login";
import { AuthProvider } from "./utils/authContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { signOut } from "firebase/auth";
import { auth } from "./utils/firebase";
import MenuEditForm from "./pages/MenuEditForm";
import AdicionaisPage from "./pages/AddAdditional";
import ComplementosPage from "./pages/AddTopping";

export default function App() {
  const navigate = useNavigate();
  const logout = () => {
    signOut(auth);
    navigate("/login");
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex overflow-hidden h-screen text-gray-800 bg-white">
      <AuthProvider>
        <PrivateRoute>
          <aside
            className={`transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"
              } bg-gradient-to-br bg-blue-500 text-white`}
          >
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="cursor-pointer p-4 flex items-center justify-between border-b border-white/20">
                  <span className="font-bold text-lg flex items-center gap-2">
                    <Menu onClick={() => setIsSidebarOpen(true)} />
                    {isSidebarOpen && "Menu"}
                  </span>
                  {isSidebarOpen && (
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="cursor-pointer text-white/70"
                    >
                      <ChevronLeft />
                    </button>
                  )}
                </div>

                <nav className="p-4 space-y-2">
                  <Link
                    to="/pedidos"
                    className="flex items-center gap-2 p-2 rounded hover:bg-white/20 transition"
                  >
                    <ReceiptText />
                    {isSidebarOpen && "Pedidos"}
                  </Link>

                  {/* Todos os links do Cardápio sem submenu */}
                  
                  <Link
                    to="/menu"
                    className="flex items-center gap-2 p-2 rounded hover:bg-white/20 transition"
                  >
                    <BookOpenText />
                    {isSidebarOpen && "Cardápio"}
                  </Link>

                  <Link
                    to="/adicionais"
                    className="flex items-center gap-2 p-2 rounded hover:bg-white/20 transition"
                  >
                    <Sandwich />
                    {isSidebarOpen && "Adicionais"}
                  </Link>

                  <Link
                    to="/complementos"
                    className="flex items-center gap-2 p-2 rounded hover:bg-white/20 transition"
                  >
                    <Layers />
                    {isSidebarOpen && "Complementos"}
                  </Link>
                </nav>
              </div>

              <div className="p-4 border-t border-white/20">
                <button
                  className="flex items-center gap-2 w-full p-2 rounded hover:bg-white/20 transition text-white cursor-pointer"
                  onClick={() => logout()}
                >
                  <LogOut size={20} />
                  {isSidebarOpen && "Sair"}
                </button>
              </div>
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
        </PrivateRoute>

        {/* Conteúdo Principal */}
        <main className="flex-1 flex flex-col bg-white">
          <header className="h-16 flex items-center justify-center px-6 shadow bg-blue-500 text-white border-b border-white/20">
            <h1 className="text-2xl font-semibold">Restaurant GPT</h1>
          </header>

          <div className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={
                <button
                  onClick={() => logout()}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Sair
                </button>} />
              <Route path="/pedidos" element={<PrivateRoute><Orders /></PrivateRoute>} />
              <Route path="/menu" element={<PrivateRoute><MenuList /></PrivateRoute>} />
              <Route path="/menu/novo" element={<PrivateRoute><MenuForm /></PrivateRoute>} />
              <Route path="/menu/editar/:id" element={<PrivateRoute><MenuEditForm /></PrivateRoute>} />
              <Route path="/adicionais" element={<PrivateRoute><AdicionaisPage /></PrivateRoute>} />
              <Route path="/complementos" element={<PrivateRoute><ComplementosPage /></PrivateRoute>} />
              <Route path="*" element={<PrivateRoute><Orders /></PrivateRoute>} />
            </Routes>
          </div>
        </main>
      </AuthProvider>
    </div>
  );
}
