import { useState } from "react";
import {
  Menu,
  ShoppingBag,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  List,
  ChevronDown,
  LogOut,
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

export default function App() {
  const navigate = useNavigate();
  const logout = () => {
    signOut(auth);
    navigate("/login");
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex overflow-hidden h-screen text-gray-800 bg-white">
      <AuthProvider>
        {/* Sidebar */}
        <PrivateRoute>
          <aside
            className={`transition-all duration-300 ${
              isSidebarOpen ? "w-64" : "w-16"
            } bg-gradient-to-br from-[#88e5fc] to-blue-100 shadow-lg text-white`}
          >
            <div className="h-full flex flex-col justify-between">
              <div>
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

                <nav className="p-4 space-y-2">
                  <Link
                    to="/pedidos"
                    className="flex items-center gap-2 p-2 rounded hover:bg-white/20 transition"
                  >
                    <ShoppingBag size={20} />
                    {isSidebarOpen && "Pedidos"}
                  </Link>

                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-white/20 transition"
                  >
                    <ClipboardList size={20} />
                    {isSidebarOpen && (
                      <>
                        <span>Cardápio</span>
                        <span className="ml-auto">
                          {isMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                      </>
                    )}
                  </button>

                  {isSidebarOpen && isMenuOpen && (
                    <div className="ml-6 space-y-1">
                      <Link
                        to="/menu/novo"
                        className="flex items-center gap-2 p-2 text-sm rounded hover:bg-white/20 transition"
                      >
                        <PlusCircle size={16} />
                        Criar Item
                      </Link>
                      <Link
                        to="/menu/"
                        className="flex items-center gap-2 p-2 text-sm rounded hover:bg-white/20 transition"
                      >
                        <List size={16} />
                        Listar Itens
                      </Link>
                    </div>
                  )}
                </nav>
              </div>

              {/* Botão de logout fixado no rodapé */}
              <div className="p-4 border-t border-white/20">
                <button className="flex items-center gap-2 w-full p-2 rounded hover:bg-white/20 transition text-white cursor-pointer" onClick={() => logout()}>
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

        {/* Main content */}
        <main className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <header className="h-16 flex items-center px-6 shadow bg-gradient-to-r from-[#88e5fc] to-blue-100 text-white border-b border-white/20">
            <h1 className="text-2xl font-semibold">Restaurant GPT</h1>
          </header>

          {/* Page content */}
          <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex">
                {/* Sidebar etc... */}

                {/* Conteúdo da página */}
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
                  <Route
                    path="/pedidos"
                    element={
                      <PrivateRoute>
                        <Orders />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/menu"
                    element={
                      <PrivateRoute>
                        <MenuList />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/menu/novo"
                    element={
                      <PrivateRoute>
                        <MenuForm />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <PrivateRoute>
                        <Orders />
                      </PrivateRoute>
                    }
                  />

<Route
                  path="/menu/editar/:id"
                  element={
                    <PrivateRoute>
                      <MenuEditForm />
                    </PrivateRoute>
                  }
                />

                </Routes>

                


              </div>
            </div>
          </div>
        </main>
      </AuthProvider>
    </div>
  );
}
