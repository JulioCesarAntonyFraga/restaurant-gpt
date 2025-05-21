import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import FinalizarPedido from "./pages/FinalizarPedido";


function App() {
  return (
    <>
      <Navbar />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/finalizar-pedido" element={<FinalizarPedido />} />

        </Routes>
      </main>
    </>
  );
}

export default App;
