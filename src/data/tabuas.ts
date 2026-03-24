export interface TabuaSize {
  label: string;
  weight: string;
  price: number;
  serves?: string;
}

export interface Tabua {
  name: string;
  description: string;
  ingredients: string[];
  sizes: TabuaSize[];
  image: string;
  featured?: boolean;
}

export const TABUAS: Tabua[] = [
  {
    name: 'Tábua Trivial',
    description: 'A clássica que agrada a todos — embutidos selecionados, queijos variados e acompanhamentos artesanais.',
    ingredients: [
      'Salame Italiano',
      'Lombo Canadense',
      'Presunto',
      'Mussarela',
      'Queijo Prato',
      'Queijo Minas',
      'Provolone',
      'Azeitonas Verde e Preta',
    ],
    sizes: [
      { label: 'Baby', weight: '550g', price: 49.99 },
      { label: 'Média', weight: '1kg', price: 79.99 },
      { label: '8 pessoas', weight: '1,25kg', price: 99.99, serves: '8p' },
      { label: '10 pessoas', weight: '1,7kg', price: 129.99, serves: '10p' },
      { label: '15 pessoas', weight: '2,1kg', price: 149.99, serves: '15p' },
      { label: '20 pessoas', weight: '2,52kg', price: 189.99, serves: '20p' },
    ],
    image: 'https://picsum.photos/seed/trivial-tabua/800/600',
    featured: true,
  },
  {
    name: 'Caprese',
    description: 'Frescor e elegância italiana — burrata cremosa, pesto aromático e tomates selecionados com presunto cru.',
    ingredients: [
      'Burrata',
      'Pesto',
      'Tomates',
      'Pão Baguete',
      'Manjericão',
      'Presunto Cru',
    ],
    sizes: [
      { label: 'Único', weight: 'até 4 pessoas', price: 209.99, serves: '4p' },
    ],
    image: 'https://picsum.photos/seed/caprese-tabua/800/600',
    featured: true,
  },
  {
    name: 'Manta de Búfala Aberta',
    description: 'Leveza e sofisticação — mussarela de búfala com tomates cereja e a delicadeza da burrata.',
    ingredients: [
      'Mussarela de Búfala',
      'Tomate Cereja',
      'Manjericão',
      'Burrata',
    ],
    sizes: [
      { label: 'Único', weight: 'até 5 pessoas', price: 389.99, serves: '5p' },
    ],
    image: 'https://picsum.photos/seed/bufala-aberta/800/600',
    featured: true,
  },
  {
    name: 'Manta de Búfala Fechada',
    description: 'Uma experiência única — manta enrolada com rúcula, presunto cru, geleia de pimenta e flor de damasco.',
    ingredients: [
      'Manta de Búfala',
      'Rúcula',
      'Tomate Seco',
      'Presunto Cru',
      'Geleia de Pimenta',
      'Flor de Damasco',
    ],
    sizes: [
      { label: 'Único', weight: 'até 5 pessoas', price: 289.99, serves: '5p' },
    ],
    image: 'https://picsum.photos/seed/bufala-fechada/800/600',
  },
];

export const EMBALAGENS = [
  { tipo: 'Isopor Tradicional', detalhe: 'Incluso no preço', adicional: 0 },
  { tipo: 'Grazing Table Baby', detalhe: 'Apresentação especial', adicional: 30 },
  { tipo: 'Grazing Table Média', detalhe: 'Apresentação especial', adicional: 35 },
  { tipo: 'Grazing Table Grande', detalhe: 'Apresentação especial', adicional: 40 },
];

export const HARMONIZACOES = [
  {
    vinho: 'Vinhos Rosé',
    harmoniza: ['Tábuas de Frios', 'Camarão', 'Macarrão com Molho de Tomate'],
    icon: 'rose',
  },
  {
    vinho: 'Vinhos Brancos',
    harmoniza: ['Queijos Frescos', 'Burrata', 'Ricota', 'Carnes Brancas'],
    icon: 'branco',
  },
  {
    vinho: 'Vinhos Tintos',
    harmoniza: ['Queijos Semi Duros', 'Gorgonzola', 'Carnes Vermelhas', 'Massas', 'Castanhas'],
    icon: 'tinto',
  },
];
