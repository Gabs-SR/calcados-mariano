// Configuração central da interface.

const API_URL_CONFIGURADA = import.meta.env.VITE_API_URL || 'https://calcados-mariano.onrender.com';

// Remove barras finais para evitar URLs como /produtos// ao concatenar as rotas.
export const URL_API = API_URL_CONFIGURADA.replace(/\/+$/, '');

export const LIMITE_ESTOQUE_BAIXO = Number(import.meta.env.VITE_ESTOQUE_BAIXO) || 10;

export const PUBLICOS = ['Masculino', 'Feminino', 'Infantil', 'Unissex'];

export const TIPOS_DE_BUSCA = [
  { valor: 'nome', rotulo: 'Nome' },
  { valor: 'categoria', rotulo: 'Categoria' },
  { valor: 'numeracao', rotulo: 'Numeração' }
];

export const ORDENACOES = [
  { valor: 'nome', rotulo: 'Nome: A - Z' },
  { valor: 'nome_desc', rotulo: 'Nome: Z - A' },
  { valor: 'recentes', rotulo: 'Cadastrados por último' },
  { valor: 'quantidade', rotulo: 'Menor estoque' },
  { valor: 'quantidade_desc', rotulo: 'Maior estoque' }
];

export const WHATSAPP = import.meta.env.VITE_WHATSAPP || '553798414547';

export const LOJA = {
  nome: 'Calçados Mariano',
  descricao: 'Controle de estoque das duas unidades',
  cidade: 'Bambuí (MG)',
  whatsappVisivel: '(37) 9841-4547',
  unidades: [
    { rotulo: 'Matriz', telefone: '(37) 3431-2762' },
    { rotulo: 'Filial', telefone: '(37) 3431-2270' }
  ]
};
