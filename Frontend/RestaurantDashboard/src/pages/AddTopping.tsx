import { useEffect, useState } from "react";
import { apiFetch } from "../utils/apiHelper";
import { useAuth } from "../utils/authContext";
import React from "react";

type Toppings = {
    id: string;
    name: string;
    description?: string;
    available: boolean;
};

export default function ComplementosPage() {
    const { token } = useAuth();
    const [form, setForm] = useState<{
        name: string;
        description: string;
        available: boolean;
    }>({
        name: "",
        description: "",
        available: true,
    });

    const [toppings, setToppings] = useState<Toppings[]>([]);
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

    const fetchComplemntos = async () => {
        if (!token)
            return;
        const response = await apiFetch("/retrieve-toppings", token);
        if (response.ok) {
            const data: Toppings[] = await response.json();
            setToppings(data);
        }
        else {
            const data = await response.text();
            console.error("Erro ao buscar Complementos:", data);
            setMessage("❌ Erro ao buscar complementos.");
        }
    };

    useEffect(() => {
        fetchComplemntos();
    }, [token]);

    const createComplemento = async (item: Omit<Toppings, "id">) => {
        if (!token)
            return;
        const response = await apiFetch("/add-topping", token, {
            method: "POST",
            body: JSON.stringify(item),
        });

        if (response.ok) {
            fetchComplemntos();
            setMessage("✅ Criado!");
        }
        else {
            const data = await response.text();
            console.error("Erro ao adicionar complemento:", data);
            setMessage("❌ Erro ao adicionar complemento.");
        }
    };

    const updateComplemento = async (item: Toppings) => {
        if (!token) return;
        const response = await apiFetch("/edit-topping/", token, {
            method: "PUT",
            body: JSON.stringify(item),
        });
        if (response.ok) {
            setMessage("✅ Atualizado!");
            await fetchComplemntos();
        }
        else {
            const data = await response.text();
            console.error("Erro ao atualizar complemento:", data);
            setMessage("❌ Erro ao atualizar complemento.");
        }
    };

    const deleteComplemento = async (id: string) => {
        if (!token)
            return;
        const response = await apiFetch(`/delete-topping/${id}`, token, {
            method: "DELETE",
        });
        if (response.ok) {
            fetchComplemntos();
        }
        else {
            const data = await response.text();
            console.error("Erro ao excluir complemento:", data);
            setMessage("❌ Erro ao excluir complemento.");
        }
    };

    const handleEdit = (item: Toppings) => {
        setForm({
            name: item.name,
            description: item.description || "",
            available: item.available,
        });
        setEditId(item.id);
    };

    const handleDelete = async (id: string) => {
        await deleteComplemento(id);
        if (editId === id) {
            setForm({ name: "", description: "", available: true });
            setEditId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newItem = {
            name: form.name.trim(),
            ...(form.description && { description: form.description.trim() }),
            available: form.available,
        };
        if (editId) {
            const updatedItem: Toppings = {
                ...newItem,
                id: editId,
            };
            await updateComplemento(updatedItem);
        } else {
            await createComplemento(newItem);
        }
        setForm({ name: "", description: "", available: true });
        setEditId(null);
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
            <h1 className="text-2xl font-bold mb-4">Gerenciar Complementos</h1>
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
                {toppings.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center justify-between p-2 border rounded">
                        <div className="flex flex-col flex-1">
                            <p className="font-semibold">{item.name}</p>
                            {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                        </div>
                        <div className="space-x-2">
                            <button
                                onClick={() => handleEdit(item)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded">
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded">
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
                                        setToppings((prev) =>
                                            prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
                                        try {
                                            await updateComplemento(updatedItem);
                                        } catch (error) {
                                            console.error("Erro ao atualizar adicional:", error);
                                            setToppings((prev) =>
                                                prev.map((i) => (i.id === previousItem.id ? previousItem : i)));
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

