import React, { useState } from "react";

type MenuItem = {
  name: string;
  price: number;
  available: boolean;
  category: string;
  description?: string;
};

const MenuForm = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [formData, setFormData] = useState<MenuItem>({
        name: "",
        price: 0,
        available: true,
        category: "",
        description: "",
    });

    const [responseMsg, setResponseMsg] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
    
        const val =
        type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value;
    
        setFormData((prev) => ({ ...prev, [name]: val }));
    };
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${apiUrl}/add-menu-item`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`, 
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                setResponseMsg("Item adicionado com sucesso!");
                setFormData({ name: "", price: 0, available: true, category: "", description: "" });
            } else {
                setResponseMsg(data || "Erro ao adicionar item.");
            }
        } catch (err) {
            console.error(err);
            setResponseMsg("Erro de conexão com o servidor.");
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold">Cadastrar Novo Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" placeholder="Nome" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="number" name="price" placeholder="Preço" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="text" name="category" placeholder="Categoria" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded" required />
                <textarea name="description" placeholder="Descrição (opcional)" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" />
                <label className="flex items-center space-x-2">
                <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} />
                <span>Disponível</span>
                </label>
                <button type="submit" className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded">Salvar</button>
            </form>
            {responseMsg && <p className="text-center text-sm text-gray-600">{responseMsg}</p>}
        </div>
    );
};

export default MenuForm;
