import { useEffect, useState } from "react";
import { apiFetch } from "../utils/apiHelper";
import { useAuth } from "../utils/authContext";
import React from "react";

type Adicional = {
  id: string;
  name: string;
  price: number;
  description?: string;
  available: boolean;
};

export default function AdicionaisPage() {
  const { token } = useAuth();
  const [form, setForm] = useState<{
    name: string;
    price: string;
    description: string;
    available: boolean;
  }>({
    name: "",
    price: "",
    description: "",
    available: true,
  });

  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const fetchAdicionais = async () => {
    if (!token)
      return;
    try {

      const response = await apiFetch("/retrieve-additionals", token);
      const data: Adicional[] = await response.json();
      setAdicionais(data);
    } catch (error) {
      console.error("Erro ao buscar adicionais:", error);
    }
  };
  useEffect(() => {

    fetchAdicionais();
  }, [token]);

  const createAdicional = async (item: Omit<Adicional, "id">) => {
    if (!token)
      return;
    try {
      const response = await apiFetch("/add-additional", token, {
        method: "POST",
        body: JSON.stringify(item),
      });

      if (response.ok) {
        fetchAdicionais();
        setMessage("✅ Criado!");
      }
    } catch (error) {
      console.error("Erro ao adicionar adicional:", error);
    }
  };

  const updateAdicional = async (item: Adicional) => {
    if (!token) return;

    try {
      const response = await apiFetch("/edit-additional/", token, {
        method: "PUT",
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar adicional");
      }

      setMessage("✅ Atualizado!");
    } catch (error) {
      console.error("Erro ao atualizar adicional:", error);
      throw error; // relança o erro para capturar no checkbox
    }
  };


  const deleteAdicional = async (id: string) => {
    if (!token)
      return;
    try {
      const response = await apiFetch(`/delete-additional/${id}`, token, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAdicionais();
      }
    } catch (error) {
      console.error("Erro ao excluir adicional:", error)
    }
  };

  const handleEdit = (item: Adicional) => {
    setForm({
      name: item.name,
      price: item.price.toString(),
      description: item.description || "",
      available: item.available,

    });
    setEditId(item.id);
  };

  const handleDelete = async (id: string) => {
    await deleteAdicional(id); // <-- Chamar API
    if (editId === id) {
      setForm({ name: "", price: "", description: "", available: true });
      setEditId(null);
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Crie um objeto sem o id para criação
    const newItem = {
      name: form.name.trim(),
      price: parseFloat(form.price),
      ...(form.description && { description: form.description.trim() }),
      available: form.available,
    };

    if (editId) {
      // Para edição, crie um objeto do tipo Adicional incluindo o id
      const updatedItem: Adicional = {
        ...newItem,
        id: editId,
      };
      await updateAdicional(updatedItem);
    } else {
      // Para criação, envie o objeto sem id
      await createAdicional(newItem);
    }

    setForm({ name: "", price: "", description: "", available: true });
    setEditId(null);
  };




  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Adicionais</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nome"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Preço"
          value={form.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Descrição (opcional)"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editId ? "Atualizar" : "Adicionar"}
        </button>
        {message && <p>{message}</p>}
      </form>

      <hr className="my-6" />

      <ul className="space-y-2">
        {adicionais.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div>
              <strong>{item.name}</strong> - R$ {item.price.toFixed(2)}
              {item.description && <p className="text-sm">{item.description}</p>}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(item)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Excluir
              </button>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.available}
                  onChange={async (e) => {
                    const isChecked = e.target.checked;

                    const previousItem = { ...item };

                    const updatedItem = { ...item, available: isChecked };
                    setAdicionais((prev) =>
                      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
                    );

                    try {
                      await updateAdicional(updatedItem);
                    } catch (error) {
                      console.error("Erro ao atualizar adicional:", error);
                      
                      setAdicionais((prev) =>
                        prev.map((i) => (i.id === previousItem.id ? previousItem : i))
                      );
                    }
                  }}
                />
                Disponível
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

