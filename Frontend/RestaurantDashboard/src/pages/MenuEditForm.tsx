import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/authContext";
import { apiFetch } from "../utils/apiHelper";
import { uploadImage } from "../utils/firebase";
import AddonCheckboxGroup from "../components/AddonCheckBoxGroup";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  available: boolean;
  category: string;
  description?: string;
  imageUrl?: string;
  maxComplementos?: number;
  maxAdicionais?: number;
  complementos?: string[];
  adicionais?: string[];
};


const MenuEditForm = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

   const [showExtras, setShowExtras] = useState(false);
      const [selectedComplementos, setSelectedComplementos] = useState<{ [key: string]: number }>({});
      const [selectedAdicionais, setSelectedAdicionais] = useState<{ [key: string]: number }>({});
      const complementos = ["Ketchup", "Mostarda", "Maionase"];
      const adicionais = ["Morango", "Creme de leite", "Leite condensado"];

  const [formData, setFormData] = useState<MenuItem>({
    id: "",
    name: "",
    price: 0,
    available: true,
    category: "",
    description: "",
    imageUrl: "",
    maxComplementos: 0,
    maxAdicionais: 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      try {
        const res = await apiFetch(`/get-menu-item/${id}`, token ?? "",{
            method: "GET",
        })
        if (!res.ok) {
            throw new Error("Failed to fetch menu item");
        }

        const data : MenuItem = await res.json()

        if (data) {
          setFormData({
            id,
            name: data.name || "",
            price: data.price || 0,
            available: data.available ?? true,
            category: data.category || "",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            maxComplementos: data.maxComplementos ?? 0,
            maxAdicionais: data.maxAdicionais ?? 0,
            complementos: data.complementos || [],
            adicionais: data.adicionais || [],
          });

          if ((data.complementos && data.complementos.length > 0) || (data.adicionais && data.adicionais.length > 0)) {
            setShowExtras(true);
          }

          setSelectedComplementos(
            (data.complementos || []).reduce((acc, nome) => {
              acc[nome] = 1;
              return acc;
            }, {} as { [key: string]: number })
          );

          setSelectedAdicionais(
            (data.adicionais || []).reduce((acc, nome) => {
              acc[nome] = 1;
              return acc;
            }, {} as { [key: string]: number })
          );
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
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, id);
      }

      const updatedData = {
        ...formData,
        imageUrl,
        complementos: Object.keys(selectedComplementos),
        adicionais: selectedAdicionais,
      };


      await apiFetch(`/edit-menu-item`, token ?? "", {
        method: "PUT",
        body: JSON.stringify(updatedData),
      });

      navigate("/menu");
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
                    <input
                        type="checkbox"
                        checked={showExtras}
                        onChange={(e) => setShowExtras(e.target.checked)}
                    />
                    <span>Adicionar complementos e adicionais</span>
                </label>
        
          {showExtras && (
                    <>
                        <AddonCheckboxGroup
                            title="Complementos"
                            addons={complementos}
                            selectedAddons={selectedComplementos}
                            setSelectedAddons={setSelectedComplementos}
                        />

                        <AddonCheckboxGroup
                            title="Adicionais"
                            addons={adicionais}
                            selectedAddons={selectedAdicionais}
                            setSelectedAddons={setSelectedAdicionais}
                            showPriceField={true}
                        />
                    </>
                )}

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
