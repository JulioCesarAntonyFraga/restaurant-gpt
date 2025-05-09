// MenuEditForm.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/helper";

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
        const res = await apiFetch(`/menu-item/${id}`);
        const data = await res.json();

        if (res.ok && data) {
          setFormData({
            name: data.name || "",
            price: data.price || 0,
            available: data.available ?? true,
            category: data.category || "",
            description: data.description || "",
          });
        } else {
          console.error("Erro ao carregar o item.");
        }
      } catch (err) {
        console.error("Erro de conexão.", err);
      }
    };

    fetchItem();
  }, [id]);

 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value, type } = e.target;
  
  // Verificando se é um input do tipo checkbox antes de acessar a propriedade 'checked'
  const newValue =
    type === "checkbox"
      ? (e.target as HTMLInputElement).checked // Só acessa 'checked' para input de checkbox
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
      const res = await apiFetch(`/update-menu-item/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        navigate("/menu");
      } else {
        console.error("Erro ao atualizar item.");
      }
    } catch (err) {
      console.error("Erro de conexão.", err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Editar Item</h2>
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
          value={formData.price.toString()}
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
