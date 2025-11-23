import React, { useState, FormEvent, ChangeEvent } from 'react';
import { RegistrationFormData, Representative, ViaCepResponse, CpfCheckResponse } from '../types';
import { masks, unmask, CSRF_TOKEN, CPF_API_TOKEN, PLANS, STATES } from '../utils';

interface RegistrationFormProps {
  representative: Representative;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ representative }) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    cpf: '',
    birth: '',
    name: '',
    email: '',
    phone: '',
    cell: '',
    cep: '',
    district: '',
    city: '',
    state: '',
    street: '',
    number: '',
    complement: '',
    typeChip: 'fisico',
    coupon: '',
    plan_id: '',
    typeFrete: '',
  });

  const [selectedOperator, setSelectedOperator] = useState<'VIVO' | 'TIM' | 'CLARO'>('VIVO');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let maskedValue = value;
    if (name === 'cpf') maskedValue = masks.cpf(value);
    if (name === 'phone') maskedValue = masks.phone(value);
    if (name === 'cell') maskedValue = masks.cell(value);
    if (name === 'cep') maskedValue = masks.cep(value);

    setFormData(prev => ({ ...prev, [name]: maskedValue }));
  };

  const handleCepBlur = async () => {
    const cepClean = unmask(formData.cep);
    if (cepClean.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
        const data: ViaCepResponse = await response.json();

        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || '',
            district: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
            complement: data.complemento || '',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleCpfBlur = async () => {
    const cpfClean = unmask(formData.cpf);
    if (cpfClean.length === 11) {
      try {
        const response = await fetch(`https://api.federalassociados.com.br/api/check_cpf_lp/${cpfClean}`, {
          headers: {
            'Authorization': `Bearer ${CPF_API_TOKEN}`,
          }
        });
        const data: CpfCheckResponse = await response.json();

        if (data.data && data.data.nome_da_pf) {
          setFormData(prev => ({
            ...prev,
            name: data.data.nome_da_pf || '',
            birth: data.data.data_nascimento || '',
          }));
        }
      } catch (error) {
        console.error('Erro ao verificar CPF:', error);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const submitData = {
        ...formData,
        cpf: unmask(formData.cpf),
        phone: unmask(formData.phone),
        cell: unmask(formData.cell),
        cep: unmask(formData.cep),
        representative_id: representative.id,
      };

      const response = await fetch('https://api.federalassociados.com.br/api/submitLp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': CSRF_TOKEN,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setMessage('Cadastro realizado com sucesso!');
        // Reset form
        setFormData({
          cpf: '', birth: '', name: '', email: '', phone: '', cell: '', cep: '',
          district: '', city: '', state: '', street: '', number: '', complement: '',
          typeChip: 'fisico', coupon: '', plan_id: '', typeFrete: '',
        });
      } else {
        setMessage('Erro ao enviar cadastro. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessage('Erro ao enviar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 form-shadow">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro de Associado</h1>
          <p className="text-gray-600">Representante: {representative.nome}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                onBlur={handleCpfBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                maxLength={14}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
              <input
                type="date"
                name="birth"
                value={formData.birth}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={14}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular *</label>
              <input
                type="tel"
                name="cell"
                value={formData.cell}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                maxLength={15}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Endereço</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  onBlur={handleCepBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  maxLength={9}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                <input
                  type="text"
                  name="complement"
                  value={formData.complement}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Plano */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Plano de Internet</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Operadora</label>
              <div className="flex gap-4">
                {(['VIVO', 'TIM', 'CLARO'] as const).map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      setSelectedOperator(op);
                      setFormData(prev => ({ ...prev, plan_id: '' }));
                    }}
                    className={`px-6 py-2 rounded-lg font-medium transition ${
                      selectedOperator === op
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plano *</label>
              <select
                name="plan_id"
                value={formData.plan_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um plano</option>
                {PLANS[selectedOperator].map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.label}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Chip *</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="typeChip"
                    value="fisico"
                    checked={formData.typeChip === 'fisico'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span>Chip Físico</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="typeChip"
                    value="eSim"
                    checked={formData.typeChip === 'eSim'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span>eSim</span>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cupom de Desconto</label>
              <input
                type="text"
                name="coupon"
                value={formData.coupon}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="loader mr-2"></div>
                Enviando...
              </>
            ) : (
              'Finalizar Cadastro'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
