import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/authContext";
import { apiFetch } from "../utils/apiHelper";
import { uploadImage } from "../utils/firebase";
import AddonCheckboxGroup, { Addon } from "../components/AddonCheckBoxGroup";
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
  id: string;
  name: string;
  price: number;
  available: boolean;
  category: string;
  description?: string;
  imageUrl?: string;
  toppings?: string[];
  max_toppings?: number;
  additionals?: string[];
  max_additionals?: number;
};

const MenuEditForm = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<MenuItem>({
    id: "",
    name: "",
    price: 0,
    available: true,
    category: "",
    description: "",
    imageUrl: "",
    toppings: [],
    max_toppings: 0,
    additionals: [],
    max_additionals: 0,
  });

  const [toppings, setToppings] = useState<Toppings[]>([]);
  const [additionals, setAdditionals] = useState<Additionals[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<{ [key: string]: number }>({});
  const [selectedAdditionals, setSelectedAdditionals] = useState<{ [key: string]: number }>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showExtras, setShowExtras] = useState(false);

  useEffect(() => {
    if (!id || !token) return;

    const fetchData = async () => {
      try {
        const res = await apiFetch(`/get-menu-item/${id}`, token, { method: "GET" });
        if (!res.ok) throw new Error("Erro ao buscar item do menu");

        const data = (await res.json()) as Omit<MenuItem, "toppings" | "additionals"> & {
          toppings: Toppings[];
          additionals: Additionals[];
        };

        setFormData({
          id,
          name: data.name || "",
          price: data.price || 0,
          available: data.available ?? true,
          category: data.category || "",
          description: data.description || "",
          imageUrl: data.imageUrl || "",
          toppings: (data.toppings || []).map(t => t.id),
          max_toppings: data.max_toppings ?? 0,
          additionals: (data.additionals || []).map(a => a.id),
          max_additionals: data.max_additionals ?? 0,
        });

        setSelectedToppings(
          (data.toppings || []).reduce((acc, comp) => {
            acc[comp.id] = 1;
            return acc;
          }, {} as { [key: string]: number })
        );

        setSelectedAdditionals(
          (data.additionals || []).reduce((acc, add) => {
            acc[add.id] = 1;
            return acc;
          }, {} as { [key: string]: number })
        );

        if ((data.toppings?.length ?? 0) > 0 || (data.additionals?.length ?? 0) > 0) {
          setShowExtras(true);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert(error instanceof Error ? error.message : "Erro ao carregar item.");
      }
    };

    const fetchExtras = async () => {
      try {
        const compRes = await apiFetch("/retrieve-toppings", token, { method: "GET" });
        const addRes = await apiFetch("/retrieve-additionals", token, { method: "GET" });

        if (compRes.ok) setToppings(await compRes.json());
        if (addRes.ok) setAdditionals(await addRes.json());
      } catch (err) {
        console.error("Erro ao buscar complementos/adicionais:", err);
      }
    };

    fetchData();
    fetchExtras();
  }, [id, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : ["price", "max_toppings", "max_additionals"].includes(name)
          ? parseFloat(value) || 0
          : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !token) return;

    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, id);
      }

      const updatedData = {
        id: formData.id,
        name: formData.name,
        price: formData.price,
        available: formData.available,
        category: formData.category,
        description: formData.description,
        imageUrl,
        toppings: Object.keys(selectedToppings),
        additionals: Object.keys(selectedAdditionals),
        max_toppings: formData.max_toppings ?? 0,
        max_additionals: formData.max_additionals ?? 0,
      };

      const response = await apiFetch("/edit-menu-item", token, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        console.error(response);
      }

      navigate("/menu");
    } catch (err) {
      console.error("Erro ao atualizar item:", err);
      alert(err instanceof Error ? err.message : "Erro ao atualizar item.");
    }
  };

  const toppingsParaAddons: Addon[] = toppings.map(({ id, name, available }) => ({
    id,
    name,
    available,
  }));

  const additionalsParaAddons: Addon[] = additionals.map(({ id, name, price, description, available }) => ({
    id,
    name,
    price,
    description,
    available,
  }));

  return (
  <div className="min-h-screen flex flex-col">
    <main className="flex-grow p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-bold">Editar Item do Menu</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nome"
            value={formData.name}
            onChange={handleChange}
            className="cursor-pointer w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Preço"
            value={formData.price}
            onChange={handleChange}
            className="cursor-pointer w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Categoria"
            value={formData.category}
            onChange={handleChange}
            className="cursor-pointer w-full p-2 border rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Descrição (opcional)"
            value={formData.description}
            onChange={handleChange}
            className="cursor-pointer w-full p-2 border rounded"
          />

          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
            Imagem
          </label>

          <div className="flex items-center space-x-4">
            <label
              htmlFor="image-upload"
              className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded"
            >
              📷 Selecionar imagem
            </label>
            {imageFile && <span className="text-sm text-gray-600">{imageFile.name}</span>}
          </div>

          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
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

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              className="cursor-pointer "
              onChange={handleChange}
            />
            <span>Disponível</span>
          </label>

          <label className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={showExtras}
              className="cursor-pointer "
              onChange={(e) => setShowExtras(e.target.checked)}
            />
            <span>Complementos e adicionais</span>
          </label>

          {showExtras && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Complementos</h3>
                <input
                  type="number"
                  name="max_toppings"
                  placeholder="Máximo de complementos"
                  value={formData.max_toppings}
                  onChange={handleChange}
                  className="cursor-pointer w-full p-2 border rounded mb-2"
                />
                <AddonCheckboxGroup
                  title="Complementos"
                  addons={toppingsParaAddons}
                  selectedAddons={selectedToppings}
                  setSelectedAddons={setSelectedToppings}
                />
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold">Adicionais</h3>
                <input
                  type="number"
                  name="max_additionals"
                  placeholder="Máximo de adicionais"
                  value={formData.max_additionals}
                  onChange={handleChange}
                  className="cursor-pointer w-full p-2 border rounded mb-2"
                />
                <AddonCheckboxGroup
                  title="Adicionais"
                  addons={additionalsParaAddons}
                  selectedAddons={selectedAdditionals}
                  setSelectedAddons={setSelectedAdditionals}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
          >
            Salvar
          </button>
        </form>
      </div>
    </main>

    <Footer />
  </div>
);
};

export default MenuEditForm;
