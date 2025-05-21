import { useState } from 'react';
import { LoadScript, Autocomplete as GoogleAutocomplete } from '@react-google-maps/api';

type AutocompleteType = google.maps.places.Autocomplete | null;
const libraries = ['places'] as Array<'places' | 'drawing' | 'geometry' | 'visualization'>;

const googleMapsApiKey = 'AIzaSyAEJwPiFgqcTZ3UrKubRozTt9282HnrIUc';

function FinalizarPedido() {
  const [autocomplete, setAutocomplete] = useState<AutocompleteType>(null);
  const [form, setForm] = useState({
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    formaPagamento: 'credito',
    metodoEntrega: 'delivery',
  });

  const handlePlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const addressComponents = place.address_components || [];

      const getComponent = (type: string) =>
        addressComponents.find((c) => c.types.includes(type))?.long_name || '';

      setForm((form) => ({
        ...form,
        rua: getComponent('route'),
        numero: getComponent('street_number'),
        bairro: getComponent('sublocality') || getComponent('neighborhood'),
        cidade: getComponent('administrative_area_level_2'),
      }));
    }
  };

  // Função para buscar o endereço pelo CEP na API ViaCEP
  const buscarEnderecoPorCEP = async (cep: string) => {
    // Remove qualquer caractere não numérico do CEP
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setForm((form) => ({
            ...form,
            rua: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
          }));
        } else {
          alert('CEP não encontrado');
        }
     } catch (error) {
  console.error(error); 
  alert('Erro ao buscar CEP');
}

    }
  };

  const handleSubmit = () => {
    console.log('Pedido finalizado:', form);
  };

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
      <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg font-sans bg-white">
        <h2 className="text-2xl font-semibold mb-6 text-center">Finalizar Pedido</h2>

        <div className="mb-6">
          <label className="block font-bold mb-2">Método de entrega:</label>

          <label className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              value="delivery"
              checked={form.metodoEntrega === 'delivery'}
              onChange={() => setForm({ ...form, metodoEntrega: 'delivery' })}
              className="form-radio"
            />
            Delivery
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="retirada"
              checked={form.metodoEntrega === 'retirada'}
              onChange={() => setForm({ ...form, metodoEntrega: 'retirada' })}
              className="form-radio"
            />
            Retirada no local
          </label>
        </div>

        {form.metodoEntrega === 'delivery' && (
          <>
            <h4 className="text-lg font-semibold mb-4">Endereço</h4>

            <input
              type="text"
              placeholder="CEP"
              className="w-full p-2 mb-3 border border-gray-300 rounded"
              value={form.cep}
              onChange={(e) => setForm({ ...form, cep: e.target.value })}
              onBlur={() => buscarEnderecoPorCEP(form.cep)}
            />

            <GoogleAutocomplete
              onLoad={(autocompleteInstance) => setAutocomplete(autocompleteInstance)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                placeholder="Rua"
                className="w-full p-2 mb-3 border border-gray-300 rounded"
                value={form.rua}
                onChange={(e) => setForm({ ...form, rua: e.target.value })}
              />
            </GoogleAutocomplete>

            <input
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
              placeholder="Número"
              className="w-full p-2 mb-3 border border-gray-300 rounded"
            />

            <input
              value={form.bairro}
              onChange={(e) => setForm({ ...form, bairro: e.target.value })}
              placeholder="Bairro"
              className="w-full p-2 mb-3 border border-gray-300 rounded"
            />

            <input
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              placeholder="Cidade"
              className="w-full p-2 mb-3 border border-gray-300 rounded"
            />
          </>
        )}

        <div className="mb-6">
          <label className="block font-bold mb-2">Forma de pagamento:</label>

          <label className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              value="credito"
              checked={form.formaPagamento === 'credito'}
              onChange={() => setForm({ ...form, formaPagamento: 'credito' })}
              className="form-radio"
            />
            Cartão de crédito
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="pix"
              checked={form.formaPagamento === 'pix'}
              onChange={() => setForm({ ...form, formaPagamento: 'pix' })}
              className="form-radio"
            />
            Pix
          </label>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
        >
          Finalizar Pedido
        </button>
      </div>
    </LoadScript>
  );
}

export default FinalizarPedido;
