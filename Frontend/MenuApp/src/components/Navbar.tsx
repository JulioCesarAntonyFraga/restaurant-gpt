import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-gradient-to-br from-[#88e5fc] to-blue-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-white font-bold text-lg">
            Restaurante
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-white hover:underline">
              Cardápio
            </Link>
            <Link to="/meu-pedido" className="text-white hover:underline">
              Meu Pedido
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white md:hidden"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <nav className="md:hidden px-4 pb-4 space-y-2">
          <Link to="/" className="block text-white hover:underline">
            Cardápio
          </Link>
          <Link to="/meu-pedido" className="block text-white hover:underline">
            Meu Pedido
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
