import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-[#4338db] to-blue-100 shadow-md">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <Link to="/" className="text-white font-bold text-2xl">
        Restaurante
      </Link>

      <nav className="hidden md:flex space-x-6 text-xl">
        <Link to="/" className="text-white hover:underline">
          Cardápio
        </Link>
        <Link to="/carrinho" className="text-white hover:underline">
          Meu Pedido
        </Link>
      </nav>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  </div>

  {isOpen && (
    <nav className="md:hidden px-4 pb-4 space-y-2 text-xl">
      <Link to="/" className="block text-white hover:underline">
        Cardápio
      </Link>
      <Link to="/carrinho" className="block text-white hover:underline">
        Meu Pedido
      </Link>
    </nav>
  )}
</header>

  );
};

export default Navbar;
