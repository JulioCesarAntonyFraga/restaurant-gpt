import { useState } from "react";
import { useCart } from "../utils/CartContext";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';

function FinishOrder() {
  const navigate = useNavigate();

  const { clearCart, cartItems } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    is_delivery: true,
    payment_method: "", // online, on_pickup, cash_on_delivery
    change_to: "",
  });


  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const searchByCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`
        );
        const data = await response.json();

        if (!data.erro) {
          setForm((form) => ({
            ...form,
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
          }));
        } else {
          alert("CEP não encontrado");
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao buscar CEP");
      }
    }
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      alert("O carrinho está vazio!");
      return;
    }

    const newErrors: { [key: string]: boolean } = {};

    if (!form.name.trim()) newErrors.name = true;
    if (!form.phone_number.trim()) newErrors.phone_number = true;
    if (!form.payment_method.trim()) newErrors.payment_method = true;
    if (form.payment_method === "cash_on_delivery") {
      const change = Number(form.change_to);
      if (!form.change_to || isNaN(change) || change <= total) {
        alert("O valor do troco deve ser maior que o total do pedido.");
        newErrors.change_to = true;
      }
    }

    if (form.is_delivery) {
      if (!form.cep.trim()) newErrors.cep = true;
      if (!form.rua.trim()) newErrors.rua = true;
      if (!form.numero.trim()) newErrors.numero = true;
      if (!form.bairro.trim()) newErrors.bairro = true;
      if (!form.cidade.trim()) newErrors.cidade = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    const payload = {
      name: form.name,
      phone_number: form.phone_number,
      items: cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        observation: item.observation || "",
        toppings: item.toppings || [],
        additionals: item.additionals || [],
      })),
      is_delivery: form.is_delivery,
      cep: form.cep,
      rua: form.rua,
      numero: form.numero,
      bairro: form.bairro,
      cidade: form.cidade,
      payment_method: form.payment_method,
      change_to: form.payment_method === "cash_on_delivery" ? form.change_to : null,
  };

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    try {
      const response = await fetch(`${apiUrl}/add-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("Erro na resposta do servidor:", data);
        alert(data.message || "Erro ao finalizar o pedido. Tente novamente.");
        return;
      }
     

      if (data.payment_url && form.payment_method !== "cash") {
        window.location.href = data.payment_url;
      } else {
        clearCart();
        navigate("/");
      }
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      alert("Erro ao finalizar o pedido. Tente novamente.");
    }    
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow px-4 pt-30 pb-32">
        <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg font-sans bg-white">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Finalizar Pedido
          </h2>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Dados Pessoais</h4>
            <input
              type="text"
              placeholder="Nome completo"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full p-2 mb-3 rounded border ${errors.name ? "border-red-800" : "border-gray-300"
                }`}
            />

            <PhoneInput
              country={'br'}
              value={form.phone_number}
              onChange={(phone) => setForm({ ...form, phone_number: phone })}
              inputProps={{
                name: 'phone',
                required: true,
                className: `w-full p-2 mb-3 rounded border ${errors.phone_number ? "border-red-800" : "border-gray-300"
                  }`
              }}
            />

          </div>

          {/* Tipo de entrega */}
          <div className="mb-6">
            <label className="block font-bold mb-2">Método de entrega:</label>

            <label className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                value="delivery"
                required
                checked={form.is_delivery === true}
                onChange={() => setForm({ ...form, is_delivery: true })}
                className="form-radio"
              />
              Delivery
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="pickup"
                checked={form.is_delivery === false}
                onChange={() => setForm({ ...form, is_delivery: false })}
                className="form-radio"
              />
              Retirada no local
            </label>
          </div>

          {/* Endereço */}
          {form.is_delivery === true && (
            <>
              <h4 className="text-lg font-semibold mb-4">Endereço</h4>

              <input
                type="text"
                placeholder="CEP"
                value={form.cep}
                onChange={(e) => setForm({ ...form, cep: e.target.value })}
                onBlur={() => searchByCEP(form.cep)}
                className={`w-full p-2 mb-3 rounded border ${errors.cep ? "border-red-800" : "border-gray-300"
                  }`}
              />

              <input
                value={form.rua}
                onChange={(e) => setForm({ ...form, rua: e.target.value })}
                placeholder="Rua"
                className={`w-full p-2 mb-3 rounded border ${errors.rua ? "border-red-800" : "border-gray-300"
                  }`}
              />
              <input
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                placeholder="Número"
                className={`w-full p-2 mb-3 rounded border ${errors.numero ? "border-red-800" : "border-gray-300"
                  }`}
              />

              <input
                value={form.bairro}
                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                placeholder="Bairro"
                className={`w-full p-2 mb-3 rounded border ${errors.bairro ? "border-red-800" : "border-gray-300"
                  }`}
              />

              <input
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                placeholder="Cidade"
                className={`w-full p-2 mb-3 rounded border ${errors.cidade ? "border-red-800" : "border-gray-300"
                  }`}
              />
            </>
          )}

          {/* Forma de pagamento */}
          <div className="mb-6">
            <label className="block font-bold mb-2">Forma de pagamento:</label>

            <label className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                value="online"
                checked={form.payment_method === "online"}
                onChange={() => setForm({ ...form, payment_method: "online" })}
                className="form-radio"
              />
              Pagamento Online (Pix / Cartão)
            </label>

            <label className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                value="on_pickup"
                checked={form.payment_method === "on_pickup"}
                onChange={() => setForm({ ...form, payment_method: "on_pickup" })}
                className="form-radio"
              />
              Pagamento na retirada
            </label>

            <label className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                value="cash_on_delivery"
                checked={form.payment_method === "cash_on_delivery"}
                onChange={() => setForm({ ...form, payment_method: "cash_on_delivery" })}
                className="form-radio"
              />
              Dinheiro na entrega
            </label>
            {form.payment_method === "cash_on_delivery" && (
              <input
                type="number"
                min={total + 0.01}
                step="0.01"
                value={form.change_to}
                onChange={(e) => setForm({ ...form, change_to: e.target.value })}
                placeholder="Troco para quanto?"
                className={`w-full p-2 mb-3 rounded border ${errors.change_to ? "border-red-800" : "border-gray-300"}`}
              />
            )}
          </div>

          {/* Exibe o total do pedido */}
          <div className="text-right font-bold text-lg">
            <p>Total: R$ {total.toFixed(2)}</p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
          >
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinishOrder;
