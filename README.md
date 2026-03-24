# Banca do Dinei — Site Institucional

Site premium de uma delicatessen artesanal localizada em Uberlândia, MG. Apresenta o cardápio de tábuas, vinhos, doces e cervejas com foco em uma experiência visual de alto padrão.

---

## Stack Tecnológica

| Tecnologia | Versão | Função |
|---|---|---|
| [React](https://react.dev/) | 19.2.4 | Framework UI |
| [TypeScript](https://www.typescriptlang.org/) | ~5.9.3 | Tipagem estática |
| [Vite](https://vitejs.dev/) | 8.0.1 | Build tool e dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.19 | Estilização utilitária |
| [Framer Motion](https://www.framer.com/motion/) | 12.38.0 | Animações e transições |
| [Phosphor Icons](https://phosphoricons.com/) | 2.1.10 | Ícones |

---

## Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── Navbar.tsx           # Navegação principal com scroll suave
│   ├── Hero.tsx             # Seção de abertura com vídeo de fundo
│   ├── Pilares.tsx          # Valores e diferenciais da marca
│   ├── TabuasDestaque.tsx   # Vitrine das tábuas premium
│   ├── MonteSuaTabua.tsx    # Guia de personalização por tamanho
│   ├── CartaVinhos.tsx      # Catálogo de vinhos com filtros
│   ├── Harmonizacoes.tsx    # Harmonizações prato + vinho
│   ├── CervejariaLouvada.tsx # Parceria com cervejaria local
│   ├── SectionDivider.tsx   # Separador visual entre seções
│   └── Footer.tsx           # Rodapé com contato e redes
├── data/
│   ├── tabuas.ts            # Dados das tábuas (preços, tamanhos, itens)
│   └── wines.ts             # Catálogo de vinhos (70+ rótulos)
├── assets/                  # Imagens e vídeos
├── App.tsx                  # Componente raiz
├── App.css                  # Estilos do App
├── main.tsx                 # Entry point React
└── index.css                # Tokens de design + classes globais
```

---

## Catálogo de Produtos

### Tábuas de Frios

| Produto | Tamanhos | Faixa de Preço |
|---|---|---|
| Tábua Trivial | Baby (550g) → 20 pessoas (2,52kg) | R$ 49,99 – R$ 189,99 |
| Caprese | Baby → 20 pessoas | R$ 49,99 – R$ 189,99 |
| Manta de Búfala Aberta | Baby → 20 pessoas | R$ 59,99 – R$ 219,99 |
| Manta de Búfala Fechada | Baby → 20 pessoas | R$ 59,99 – R$ 219,99 |

### Vinhos

Mais de **70 rótulos** de: Portugal, Chile, Argentina, Itália, Espanha, Uruguai, Brasil, França e África do Sul.
Tipos: Tinto, Branco, Rosé, Espumante, Porto. Faixa de preço: R$ 19,99 – R$ 1.069,00.

---

## Design System

Tokens de cor definidos em `tailwind.config.js`:

```js
gold:     '#C9A84C'  // Destaque / CTA
bordeaux: '#6B2737'  // Hover / acento
cream:    '#F5EDD6'  // Texto claro
dark:     '#1A1410'  // Background
```

Fontes: **Playfair Display** (títulos) · **Cormorant Garamond** (editorial) · **Lato** (corpo)

---

## Observações sobre Vídeos

Os arquivos `.mp4` **não estão versionados** neste repositório por serem grandes demais para o Git padrão. Em produção, devem ser hospedados em um serviço de armazenamento em nuvem (ex: AWS S3, Cloudflare R2, Bunny CDN).

Para desenvolvimento local, coloque os vídeos em `src/assets/` manualmente.

---

## Contato

Pedidos via **WhatsApp**: [(34) 3212-2009](https://wa.me/5534321220099)
Localização: **Uberlândia, MG**
