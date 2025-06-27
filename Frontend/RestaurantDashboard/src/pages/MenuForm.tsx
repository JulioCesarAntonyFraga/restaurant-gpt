import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiHelper";
import { useAuth } from "../utils/authContext";
import { uploadImage } from "../utils/firebase";
import AddonCheckboxGroup from "../components/AddonCheckBoxGroup";
import Footer from "../components/Footer";


type Additionals = {
  id: string;
  name: string;
  price: number;
  description?: string;
  available: boolean;
};

type Toppings = {
  id: string;
  name: string;
  available: boolean;
};

type MenuItem = {
  name: string;
  price: string | number;
  available: boolean;
  category: string;
  description?: string | undefined;
  imageUrl?: string | undefined;
  toppings?: string[];
  max_toppings?: number | undefined;
  additionals?: string[];
  max_additionals?: number | undefined;
};

const MenuForm: React.FC = () => {
  const { token } = useAuth();

  const [formData, setFormData] = useState<MenuItem>({
    name: "",
    price: "",
    available: true,
    category: "",
    description: undefined,
    imageUrl: undefined,
    toppings: [],
    max_toppings: undefined,
    additionals: [],
    max_additionals: undefined,
  });

  const [toppings, setToppings] = useState<Toppings[]>([]);
  const [additionals, setAdditionals] = useState<Additionals[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<{ [key: string]: number }>({});
  const [selectedAdditionals, setSelectedAdditionals] = useState<{ [key: string]: number }>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showExtras, setShowExtras] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchToppings = async () => {
      const response = await apiFetch("/retrieve-toppings", token);

      if (response.ok) {
          const data: Toppings[] = await response.json();
        setToppings(data.filter(c => c.available));
      }
      else {
        const errorData = await response.text();
        console.error("Erro ao buscar complementos:", errorData);
      }
    };

    const fetchAdditionals = async () => {
      const response = await apiFetch("/retrieve-additionals", token);

      if (response.ok) {
        const data: Additionals[] = await response.json();
        setAdditionals(data.filter(item => item.available));
      }
      else {
        const errorData = await response.text();
        console.error("Erro ao buscar adicionais:", errorData);
      }
    };

    fetchToppings();
    fetchAdditionals();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let val: string | boolean | number = value;

    if (type === "checkbox") {
      val = (e.target as HTMLInputElement).checked;

      if (name === "showExtras") {
        setShowExtras(val as boolean);
        setSelectedToppings({});
        setSelectedAdditionals({});
        return;
      }
    } else if (name === "max_toppings" || name === "max_additionals" || name === "price") {
      const parsed = parseInt(value, 10);
      val = isNaN(parsed) ? 0 : parsed;
      val = value === "" ? "" : parseFloat(value);
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch(`/add-menu-item`, token ?? "", {
      method: "POST",
      body: JSON.stringify({
        ...formData,
        toppings: Object.keys(selectedToppings),
        additionals: Object.keys(selectedAdditionals),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, data.id);

        await apiFetch(`/edit-menu-item`, token ?? "", {
          method: "PUT",
          body: JSON.stringify({ 
            ...formData, 
            imageUrl, 
            id: data.id, 
            toppings: selectedToppings && Object.keys(selectedToppings || undefined), 
            additionals: selectedAdditionals && Object.keys(selectedAdditionals) 
          }),
        });
      }
      
      setResponseMsg("Item adicionado com sucesso!");
      setTimeout(() =>{
        setResponseMsg("");
      }, 3000);

      setFormData({
        name: "",
        price: "",
        available: true,
        category: "",
        description: "",
        imageUrl: "",
        toppings: [],
        max_toppings: 0,
        additionals: [],
        max_additionals: 0,
      });
      setImageFile(null);
      setImagePreview(null);
      setSelectedToppings({});
      setSelectedAdditionals({});
    } else {
      const data = await res.text();
      console.error("Erro ao adicionar item:", data);
      setResponseMsg(data || "Erro ao adicionar item.");
    }
  };  

  return (
  <div className="min-h-screen flex flex-col pb-10">
    <main className="flex-grow p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-bold">Cadastrar Novo Item</h2>

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
              <img
                src={imagePreview || formData.imageUrl}
                alt="Pré-visualização"
                className="mt-2 h-32 w-32 object-cover rounded border"
              />
            )}
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
            />
            <span>Disponível</span>
          </label>

          <label className="flex items-center space-x-2 mb-4">
            <input name="showExtras"
              type="checkbox"
              checked={showExtras}
              onChange={handleChange}
            />
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
                  selectedAddons={selectedToppings}
                  setSelectedAddons={setSelectedToppings}
                />
              </div>

              {/* Adicionais */}
              <div>
                <h3 className="text-lg font-semibold">Adicionais</h3>
                <input
                  type="number"
                  name="max_additionals"
                  placeholder="Máximo de adicionais"
                  value={formData.max_additionals}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />
                <AddonCheckboxGroup
                  title=""
                  addons={additionals}
                  selectedAddons={selectedAdditionals}
                  setSelectedAddons={setSelectedAdditionals}
                />
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
            Salvar Menu
          </button>
        </form>

        {responseMsg && <p className="text-center text-sm text-red-500 mt-2">{responseMsg}</p>}
      </div>
    </main>

    <Footer />
  </div>
);
};

export default MenuForm;
