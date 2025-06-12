import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiHelper";
import { useAuth } from "../utils/authContext";
import { uploadImage } from "../utils/firebase";
import AddonCheckboxGroup from "../components/AddonCheckBoxGroup";

type Adicional = {
  id: string;
  name: string;
  price: number;
  description?: string;
  available: boolean;
};

type Complemento = {
  id: string;
  name: string;
  available: boolean;
};

type MenuItem = {
  name: string;
  price: number;
  available: boolean;
  category: string;
  description?: string;
  imageUrl?: string;
  max_toppings?: number;

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
    max_toppings: 0,

  });

  const [toppings, setComplementos] = useState<Complemento[]>([]);
  const [additionals, setAdicionais] = useState<Adicional[]>([]);

  const [selectedComplementos, setSelectedComplementos] = useState<{ [key: string]: number }>({});
  const [selectedAdicionais, setSelectedAdicionais] = useState<{ [key: string]: number }>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showExtras, setShowExtras] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  useEffect(() => {
    console.log("Enviando formData:", { ...formData, toppings: Object.keys(selectedComplementos), adicionais: Object.keys(selectedAdicionais) });

    const fetchComplementos = async () => {
      if (!token) return;
      try {
        const response = await apiFetch("/retrieve-toppings", token);
        const data: Complemento[] = await response.json();
        setComplementos(data.filter(c => c.available));
      } catch (error) {
        console.error("Erro ao buscar complementos:", error);
      }
    };

    const fetchAdicionais = async () => {
      if (!token) return;
      try {
        const response = await apiFetch("/retrieve-additionals", token);
        const data: Adicional[] = await response.json();
        setAdicionais(data.filter(item => item.available));
      } catch (error) {
        console.error("Erro ao buscar adicionais:", error);
      }
    };

    fetchComplementos();
    fetchAdicionais();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    let val: string | boolean | number = value;

    if (type === "checkbox") {
      val = (e.target as HTMLInputElement).checked;
    } else if (name === "max_toppings" || name === "price") {
      const parsed = parseInt(value, 10);
      val = isNaN(parsed) ? 0 : parsed;
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await apiFetch(`/add-menu-item`, token ?? "", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          toppings: Object.keys(selectedComplementos),
          adicionais: Object.keys(selectedAdicionais),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        let imageUrl = formData.imageUrl;

        if (imageFile) {
          imageUrl = await uploadImage(imageFile, data.id);
        }

        await apiFetch(`/edit-menu-item`, token ?? "", {
          method: "PUT",
          body: JSON.stringify({ ...formData, imageUrl, id: data.id }),
        });

        setResponseMsg("Item adicionado com sucesso!");
        setFormData({
          name: "",
          price: 0,
          available: true,
          category: "",
          description: "",
          imageUrl: "",
          max_toppings: 0,

        });
        setImagePreview(null);
      } else {
        setResponseMsg(data || "Erro ao adicionar item.");
      }
    } catch (err) {
      console.error(err);
      setResponseMsg("Erro de conexão com o servidor.");
    }
  };

  const handleAdicionalCheckbox = (id: string) => {
    setSelectedAdicionais((prev) =>
      id in prev
        ? Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id))
        : { ...prev, [id]: 1 }
    );
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Cadastrar Novo Item</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Nome" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="number" name="price" placeholder="Preço" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="category" placeholder="Categoria" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded" required />
        <textarea name="description" placeholder="Descrição (opcional)" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" />

        {/* Upload de Imagem */}
        <div className="space-y-2">
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
            Imagem do prato
          </label>
          <div className="flex items-center space-x-4">
            <label htmlFor="image-upload" className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded shadow">
              📷 Selecionar imagem
            </label>
            {imageFile && <span className="text-sm truncate">{imageFile.name}</span>}
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImageFile(e.target.files[0]);
                setImagePreview(URL.createObjectURL(e.target.files[0]));
              }
            }}
            className="hidden"
          />
          {(imagePreview || formData.imageUrl) && (
            <img src={imagePreview || formData.imageUrl} alt="Pré-visualização" className="mt-2 h-32 w-32 object-cover rounded border" />
          )}
        </div>

        <label className="flex items-center space-x-2">
          <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} />
          <span>Disponível</span>
        </label>

        <label className="flex items-center space-x-2 mb-4">
          <input type="checkbox" checked={showExtras} onChange={(e) => setShowExtras(e.target.checked)} />
          <span>Complementos e adicionais</span>
        </label>

        {showExtras && (
          <>
            {/* Complementos */}
            <div>
              <h3 className="text-lg font-semibold">Complementos</h3>
              <input
                type="number"
                name="max_toppings"
                placeholder="Máximo de complementos"
                value={formData.max_toppings}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2"
              />
              <AddonCheckboxGroup
                title=""
                addons={toppings}
                selectedAddons={selectedComplementos}
                setSelectedAddons={setSelectedComplementos}
              />
            </div>

            {/* Adicionais */}
            <div>
              <h3 className="text-lg font-semibold">Adicionais disponíveis</h3>
              <ul className="space-y-2">
                {additionals.map((adicional) => (
                  <li key={adicional.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`adicional-${adicional.id}`}
                      checked={adicional.id in selectedAdicionais}
                      onChange={() => handleAdicionalCheckbox(adicional.id)}
                    />
                    <label htmlFor={`adicional-${adicional.id}`}>
                      {adicional.name} - R$ {adicional.price.toFixed(2)}
                      {adicional.description && (
                        <span className="text-sm text-gray-600"> ({adicional.description})</span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
          Salvar Menu
        </button>
      </form>

      {responseMsg && <p className="text-center text-sm text-red-500 mt-2">{responseMsg}</p>}
    </div>
  );
};

export default MenuForm;
