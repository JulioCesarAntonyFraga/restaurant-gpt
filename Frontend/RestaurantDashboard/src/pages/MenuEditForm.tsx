import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiHelper";

type MenuItem = {
  name: string;
  price: number;
  available: boolean;
  category: string;
  description?: string;
};

const MenuEditForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<MenuItem>({
    name: "",
    price: 0,
    available: true,
    category: "",
    description: "",
  });

  useEffect(() => {
  if (!id) return;

  const fetchItem = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${apiUrl}/get-menu-item/${id}`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
      })
      if (!res.ok) {
          throw new Error("Failed to fetch menu item");
      }

      const data : MenuItem = await res.json()

      if (data) {
        setFormData({
          name: data.name || "",
          price: data.price || 0,
          available: data.available ?? true,
          category: data.category || "",
          description: data.description || "",
        });
      } else {
        alert("Nenhum dado encontrado para o item.");
      }
    } catch (err) {
      console.error("Erro ao carregar o item:", err);
      alert(err instanceof Error ? err.message : "Erro ao carregar o item.");
    }
  };

  fetchItem();
}, [id]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : name === "price"
        ? parseFloat(value)
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await apiFetch(`/update-menu-item/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      navigate("/menu"); // Redireciona após sucesso
    } catch (err) {
      console.error("Erro ao atualizar item:", err);
      alert(err instanceof Error ? err.message : "Erro ao atualizar o item.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Editar Item do Menu</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nome"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Preço"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Categoria"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Descrição (opcional)"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
          />
          <span>Disponível</span>
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded"
        >
          Salvar
        </button>
      </form>
    </div>
  );
};

export default MenuEditForm;
