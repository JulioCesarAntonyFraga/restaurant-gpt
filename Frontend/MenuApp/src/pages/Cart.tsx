import { useCart } from "../utils/CartContext";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer"; // Certifique-se de que o caminho está correto

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow max-w-6xl mx-auto px-4 py-6 pt-20">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Seu Carrinho</h1>

        {cartItems.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>Seu carrinho está vazio.</p>
            <Link
              to="/"
              className="mt-4 inline-block px-4 py-2 bg-blue-300 hover:bg-blue-400 text-white rounded transition"
            >
              Ver cardápio
            </Link>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {cartItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white shadow p-4 rounded-lg"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                  <p className="text-sm text-gray-600">
                    {item.quantity} x R$ {item.price.toFixed(2)}
                  </p>
                  {item.observation && (
                    <p className="text-sm text-blue-600 italic mt-1">
                      Observação: {item.observation}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeFromCart(item)}
                  className="cursor-pointer text-red-500 hover:text-red-700 font-medium"
                >
                  Remover
                </button>
              </div>
            ))}

            <div className="text-right text-gray-800 font-semibold text-lg">
              Total: R$ {total.toFixed(2)}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={clearCart}
                className="cursor-pointer px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
              >
                Limpar Carrinho
              </button>
              <button
                className="cursor-pointer px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition"
                onClick={() => navigate("/finalizar-pedido")}
              >
                Prosseguir
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
