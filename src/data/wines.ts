export type WineType = 'Tinto' | 'Branco' | 'Rosé' | 'Espumante' | 'Porto';
export type WineTier = 'dia' | 'especial';

export interface Wine {
  name: string;
  type: string;
  price: number;
  tier: WineTier;
  country: string;
  countryCode: string;
  imagemUrl?: string;
}

export const COUNTRIES = [
  { code: 'PT', name: 'Portugal' },
  { code: 'CL', name: 'Chile' },
  { code: 'AR', name: 'Argentina' },
  { code: 'IT', name: 'Itália' },
  { code: 'ES', name: 'Espanha' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'BR', name: 'Brasil' },
  { code: 'FR', name: 'França' },
  { code: 'ZA', name: 'África do Sul' },
] as const;

export const WINES: Wine[] = [
  // Portugal - Dia
  { name: 'Dona Jóia', type: 'Tinto Meio Seco', price: 39.99, tier: 'dia', country: 'Portugal', countryCode: 'PT' },
  { name: 'Júlia Florista', type: 'Tinto Meio Seco', price: 64.95, tier: 'dia', country: 'Portugal', countryCode: 'PT' },
  { name: 'Vinho Verde 500', type: 'Rosé / Branco Meio Seco', price: 64.95, tier: 'dia', country: 'Portugal', countryCode: 'PT' },
  { name: 'Bons-Ventos', type: 'Tinto · Rosé Meio Seco · Branco Seco', price: 62.99, tier: 'dia', country: 'Portugal', countryCode: 'PT' },
  { name: 'Calamares', type: 'Branco · Rosé Meio Seco', price: 68.99, tier: 'dia', country: 'Portugal', countryCode: 'PT' },
  { name: 'Casal Garcia', type: 'Rosé · Tinto · Verde M.S. · Sweet Red', price: 79.90, tier: 'dia', country: 'Portugal', countryCode: 'PT' },
  { name: 'Barrica 143', type: 'Branco Seco · Tinto Seco', price: 84.95, tier: 'dia', country: 'Portugal', countryCode: 'PT' },
  { name: 'Parcela Original Signature', type: 'Tinto Seco', price: 129.90, tier: 'dia', country: 'Portugal', countryCode: 'PT' },
  { name: 'Vale de Moncorvo', type: 'Tinto Seco', price: 149.90, tier: 'dia', country: 'Portugal', countryCode: 'PT' },
  // Portugal - Especiais
  { name: "Graham's Fine Ruby", type: 'Porto Tinto Doce', price: 229.90, tier: 'especial', country: 'Portugal', countryCode: 'PT' },
  { name: 'Cartuxa', type: 'Branco Seco', price: 265.00, tier: 'especial', country: 'Portugal', countryCode: 'PT' },
  { name: 'Esporão', type: 'Branco Seco', price: 269.00, tier: 'especial', country: 'Portugal', countryCode: 'PT' },
  { name: 'Coelheiros', type: 'Branco Seco · Rosé Seco', price: 309.90, tier: 'especial', country: 'Portugal', countryCode: 'PT' },

  // Chile - Dia
  { name: 'Chilano', type: 'Tinto · Branco · Rosé Seco', price: 34.95, tier: 'dia', country: 'Chile', countryCode: 'CL' },
  { name: 'Reservado Concha Y Toro', type: 'Tinto/Branco M.S. · Tinto/Branco Suave', price: 39.99, tier: 'dia', country: 'Chile', countryCode: 'CL' },
  { name: 'Kolinas', type: 'Tinto · Branco Seco', price: 39.99, tier: 'dia', country: 'Chile', countryCode: 'CL' },
  { name: 'Santa Sofia', type: 'Tinto Seco', price: 39.99, tier: 'dia', country: 'Chile', countryCode: 'CL' },
  { name: 'Santa Helena', type: 'Tinto Seco', price: 39.99, tier: 'dia', country: 'Chile', countryCode: 'CL' },
  { name: 'El Raco Varietal', type: 'Tinto · Rosé · Branco Seco', price: 54.95, tier: 'dia', country: 'Chile', countryCode: 'CL' },
  { name: 'Casillero Del Diablo', type: 'Tinto · Branco Seco', price: 59.99, tier: 'dia', country: 'Chile', countryCode: 'CL' },
  { name: 'El Raco Reserva', type: 'Tinto Seco', price: 89.90, tier: 'dia', country: 'Chile', countryCode: 'CL' },
  { name: 'El Raco Gran Reserva', type: 'Tinto Seco', price: 149.90, tier: 'dia', country: 'Chile', countryCode: 'CL' },
  // Chile - Especiais
  { name: 'Carmen Insigne', type: 'Tinto Seco', price: 104.95, tier: 'especial', country: 'Chile', countryCode: 'CL' },
  { name: 'Tarapaca Gran Reserva', type: 'Tinto Seco', price: 115.90, tier: 'especial', country: 'Chile', countryCode: 'CL' },
  { name: 'Carmen Gran Reserva', type: 'Tinto Seco', price: 289.90, tier: 'especial', country: 'Chile', countryCode: 'CL' },

  // Argentina - Dia
  { name: 'Hormiga Negra', type: 'Rosé Meio Seco', price: 39.99, tier: 'dia', country: 'Argentina', countryCode: 'AR' },
  { name: 'Chac Chac', type: 'Tinto · Rosé Meio Seco', price: 54.99, tier: 'dia', country: 'Argentina', countryCode: 'AR' },
  { name: 'Cordero Con Piel Del Lobo', type: 'Tinto Seco · Branco · Rosé Malbec', price: 69.95, tier: 'dia', country: 'Argentina', countryCode: 'AR' },
  // Argentina - Especiais
  { name: 'Alamos', type: 'Tinto · Branco Seco', price: 145.90, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'Alma Negra Espumante', type: 'Espumante Rosé Extra Brut', price: 239.90, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'Alma Negra Branco', type: 'Branco Seco', price: 244.50, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'Alma Negra Tinto', type: 'Tinto Seco', price: 299.95, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'DV Catena Cabernet-Malbec', type: 'Tinto Seco', price: 299.90, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'Catena High Mountain Vines', type: 'Tinto Seco (Malbec)', price: 249.90, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'Catena Lunlunta', type: 'Tinto Seco (Malbec)', price: 304.90, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'DV Catena Malbec-Malbec', type: 'Tinto Seco', price: 349.95, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'El Enemigo', type: 'Tinto Seco (Malbec)', price: 319.50, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'Amancaya', type: 'Tinto Seco', price: 332.90, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'Luca Pinot Noir Vintage', type: 'Tinto Seco', price: 399.90, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'Angelica Zapata', type: 'Branco Seco (Chardonnay)', price: 469.90, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'Angelina Zapata', type: 'Tinto Seco (Malbec)', price: 539.90, tier: 'especial', country: 'Argentina', countryCode: 'AR' },
  { name: 'Nicola Catena', type: 'Tinto Seco (Bonarda)', price: 699.90, tier: 'especial', country: 'Argentina', countryCode: 'AR' },

  // Itália - Dia
  { name: 'Cella Lambrusco', type: 'Frisante Suave: Rosé · Branco · Tinto', price: 69.99, tier: 'dia', country: 'Itália', countryCode: 'IT' },
  { name: 'Esperanto', type: 'Tinto Meio Seco', price: 69.99, tier: 'dia', country: 'Itália', countryCode: 'IT' },
  // Itália - Especiais
  { name: 'Orvieto Clássico', type: 'Branco Seco', price: 116.90, tier: 'especial', country: 'Itália', countryCode: 'IT' },
  { name: 'Barba', type: 'Tinto Meio Seco', price: 146.90, tier: 'especial', country: 'Itália', countryCode: 'IT' },
  { name: 'Sangiovese', type: 'Tinto Seco', price: 149.90, tier: 'especial', country: 'Itália', countryCode: 'IT' },
  { name: 'Pinot Grigio', type: 'Branco Seco', price: 162.90, tier: 'especial', country: 'Itália', countryCode: 'IT' },
  { name: 'Regaleali Rosé', type: 'Rosé Seco', price: 230.00, tier: 'especial', country: 'Itália', countryCode: 'IT' },
  { name: 'Regaleali Branco', type: 'Branco Seco', price: 239.90, tier: 'especial', country: 'Itália', countryCode: 'IT' },
  { name: "Regaleali Nero D'Avila", type: 'Tinto Seco', price: 239.90, tier: 'especial', country: 'Itália', countryCode: 'IT' },

  // Espanha - Dia
  { name: 'Pata Negra Oro', type: 'Tinto Seco', price: 69.99, tier: 'dia', country: 'Espanha', countryCode: 'ES' },
  // Espanha - Especiais
  { name: 'Posadas Viejas', type: 'Rosé Seco', price: 93.50, tier: 'especial', country: 'Espanha', countryCode: 'ES' },
  { name: 'Bayanegra', type: 'Rosé Seco', price: 104.95, tier: 'especial', country: 'Espanha', countryCode: 'ES' },

  // Uruguai
  { name: 'Fuga', type: 'Rosé · Tinto · Branco Seco', price: 39.99, tier: 'dia', country: 'Uruguai', countryCode: 'UY' },
  { name: 'Filgueira', type: 'Branco · Rosé Seco', price: 89.99, tier: 'dia', country: 'Uruguai', countryCode: 'UY' },
  { name: 'Pizzorno', type: 'Tinto · Branco Seco', price: 113.99, tier: 'dia', country: 'Uruguai', countryCode: 'UY' },

  // Brasil - Dia
  { name: 'Vila Romana', type: 'Tinto/Branco/Rosé Suave · Bordô Seco/Suave', price: 19.99, tier: 'dia', country: 'Brasil', countryCode: 'BR' },
  { name: 'Pérgola', type: 'Tinto Seco · Tinto/Branco Suave', price: 29.95, tier: 'dia', country: 'Brasil', countryCode: 'BR' },
  // Brasil - Especiais
  { name: 'Miolo Single Vineyard', type: 'Tinto Seco · Branco Meio Seco', price: 109.50, tier: 'especial', country: 'Brasil', countryCode: 'BR' },
  { name: 'Miolo Wild', type: 'Tinto Seco', price: 112.50, tier: 'especial', country: 'Brasil', countryCode: 'BR' },
  { name: 'Casa Bruxel', type: 'Tinto · Branco Seco', price: 149.99, tier: 'especial', country: 'Brasil', countryCode: 'BR' },

  // França - Dia
  { name: 'Rosé Piscine', type: 'Rosé Suave', price: 139.99, tier: 'dia', country: 'França', countryCode: 'FR' },
  // França - Especiais
  { name: 'La Vieille Ferme', type: 'Tinto Seco', price: 199.90, tier: 'especial', country: 'França', countryCode: 'FR' },
  { name: 'Famile Perrin – Châteauneuf Du Pape', type: 'Tinto Seco', price: 1069.00, tier: 'especial', country: 'França', countryCode: 'FR' },

  // África do Sul - Especiais
  { name: 'Robertson Winery', type: 'Tinto Meio Seco', price: 112.50, tier: 'especial', country: 'África do Sul', countryCode: 'ZA' },
  { name: 'Barista', type: 'Tinto Meio Seco', price: 259.90, tier: 'especial', country: 'África do Sul', countryCode: 'ZA' },
];
