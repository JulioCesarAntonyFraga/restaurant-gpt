import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-blue-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-white font-bold text-2xl">
            Restaurante
          </Link>

          <nav className="flex space-x-6 text-xl">
            <Link to="/" className="text-white hover:underline">
              Cardápio
            </Link>
            <Link to="/carrinho" className="text-white hover:underline">
              Meu Pedido
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
