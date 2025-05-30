import React, { useState } from "react";
import { apiFetch } from "../utils/apiHelper";
import { useAuth } from "../utils/authContext";
import { uploadImage } from "../utils/firebase";



type MenuItem = {
  name: string;
  price: number;
  available: boolean;
  category: string;
  description?: string;
  imageUrl?: string;
};

const MenuForm = () => {
    const { token } = useAuth();
    const [formData, setFormData] = useState<MenuItem>({
        name: "",
        price: 0,
        available: true,
        category: "",
        description: "",
        imageUrl: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
            const res = await apiFetch(`/add-menu-item`, token ?? "",{
                method: "POST",
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                let imageUrl = formData.imageUrl;

                if (imageFile) {
                    imageUrl = await uploadImage(imageFile, data.id);
                }

                const updatedData = {
                    ...formData,
                    imageUrl,
                    id: data.id,
                };

                await apiFetch(`/edit-menu-item`, token ?? "", {
                    method: "PUT",
                    body: JSON.stringify(updatedData),
                });
                setResponseMsg("Item adicionado com sucesso!");
                setFormData({ name: "", price: 0, available: true, category: "", description: "", imageUrl: "" });
                setImagePreview(null);
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
                <div className="space-y-2">
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
                        Imagem do prato
                    </label>

                    <div className="flex items-center space-x-4">
                        <label
                            htmlFor="image-upload"
                            className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded shadow"
                        >
                            📷 Selecionar imagem
                        </label>
                        {imageFile && (
                            <span className="text-sm text-gray-600 truncate max-w-[200px]">{imageFile.name}</span>
                        )}
                    </div>

                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setImageFile(file);
                                setImagePreview(URL.createObjectURL(file));
                            }
                        }}
                        name="imageUrl"
                        value={formData.imageUrl}
                        className="hidden"
                    />

                    {(imagePreview || formData.imageUrl) && (
                        <img
                        src={imagePreview || formData.imageUrl}
                        alt="Pré-visualização"
                        className="mt-2 h-32 w-32 object-cover rounded border"
                        />
                    )}
                </div>
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
