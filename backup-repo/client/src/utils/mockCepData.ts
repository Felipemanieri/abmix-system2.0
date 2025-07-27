// Mock data para CEPs quando API externa não está disponível
interface CepData {
  [key: string]: {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
  };
}

export const mockCepDatabase: CepData = {
  '01310100': {
    logradouro: 'Avenida Paulista, 1578',
    bairro: 'Bela Vista',
    localidade: 'São Paulo',
    uf: 'SP'
  },
  '04038001': {
    logradouro: 'Rua Vergueiro, 3185',
    bairro: 'Vila Mariana',
    localidade: 'São Paulo',
    uf: 'SP'
  },
  '20040020': {
    logradouro: 'Avenida Rio Branco, 1',
    bairro: 'Centro',
    localidade: 'Rio de Janeiro',
    uf: 'RJ'
  },
  '30112000': {
    logradouro: 'Avenida Afonso Pena, 1270',
    bairro: 'Centro',
    localidade: 'Belo Horizonte',
    uf: 'MG'
  },
  '12946220': {
    logradouro: 'Rua Vladimir Herzog, 56',
    bairro: 'Jardim dos Pinheiros',
    localidade: 'Atibaia',
    uf: 'SP'
  },
  '08540090': {
    logradouro: 'Rua das Flores, 123',
    bairro: 'Vila Esperança',
    localidade: 'Ferraz de Vasconcelos',
    uf: 'SP'
  },
  '05508010': {
    logradouro: 'Rua Funchal, 418',
    bairro: 'Vila Olímpia',
    localidade: 'São Paulo',
    uf: 'SP'
  }
};

export const getMockCepData = (cep: string) => {
  const cepLimpo = cep.replace(/\D/g, '');
  return mockCepDatabase[cepLimpo] || null;
};