import { Link } from "react-router-dom";
import { UtensilsCrossed, ShoppingCart } from "lucide-react";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-blue-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-white font-bold text-xl sm:text-2xl">
            Restaurante
          </Link>

          {/* Navegação com botões menores */}
          <nav className="flex space-x-2 sm:space-x-3">
            <Link
              to="/"
              className="flex items-center gap-1 bg-white text-blue-600 text-sm font-medium px-3 py-1.5 rounded-full shadow hover:bg-blue-100 transition"
            >
              <UtensilsCrossed size={16} />
              <span className="hidden sm:inline">Cardápio</span>
            </Link>
            <Link
              to="/carrinho"
              className="flex items-center gap-1 bg-white text-blue-600 text-sm font-medium px-3 py-1.5 rounded-full shadow hover:bg-blue-100 transition"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Meu Pedido</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
