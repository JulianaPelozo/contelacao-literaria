/**
 * Paletas dos temas visuais. Fonte única usada pelo Tailwind (tailwind.config.js),
 * que gera uma variável CSS por cor para cada `[data-theme="..."]`.
 * Os metadados exibidos no seletor (nome, ícone) ficam em src/lib/tema.ts.
 */

const noite = {
  surface: '#141125',
  background: '#141125',
  'surface-container-lowest': '#0e0b20',
  'surface-container-low': '#1c192e',
  'surface-container': '#201d32',
  'surface-container-high': '#2b273d',
  'surface-container-highest': '#363248',
  'surface-variant': '#363248',
  'surface-bright': '#3a364d',
  'on-surface': '#e6dffc',
  'on-surface-variant': '#cac4d4',
  'inverse-on-surface': '#312e44',
  outline: '#948e9d',
  'outline-variant': '#494552',
  primary: '#cebdff',
  'primary-container': '#a78bfa',
  'on-primary': '#381385',
  'on-primary-container': '#3c1989',
  secondary: '#d3bbff',
  'secondary-fixed-dim': '#d3bbff',
  'secondary-container': '#5d03ca',
  'on-secondary': '#3f008d',
  'on-secondary-container': '#c7aaff',
  tertiary: '#c8c2e9',
  'tertiary-fixed-dim': '#c8c2e9',
  'tertiary-container': '#9e98bd',
  error: '#ffb4ab',
  sombra: '#0a071b',
};

export const temas = {
  noite: { escuro: true, cores: noite },

  claro: {
    escuro: false,
    cores: {
      surface: '#fbf8ff',
      background: '#fbf8ff',
      'surface-container-lowest': '#ffffff',
      'surface-container-low': '#f4f0fd',
      'surface-container': '#eee9f9',
      'surface-container-high': '#e8e2f5',
      'surface-container-highest': '#e0d9ef',
      'surface-variant': '#e0d9ef',
      'surface-bright': '#ffffff',
      'on-surface': '#1c1830',
      'on-surface-variant': '#4a4558',
      'inverse-on-surface': '#f3eefc',
      outline: '#777186',
      'outline-variant': '#cbc4d8',
      primary: '#5b37c4',
      'primary-container': '#7a5ae6',
      'on-primary': '#ffffff',
      'on-primary-container': '#ffffff',
      secondary: '#6a3fd0',
      'secondary-fixed-dim': '#6537c4',
      'secondary-container': '#b89cff',
      'on-secondary': '#ffffff',
      'on-secondary-container': '#3d1690',
      tertiary: '#7e74a8',
      'tertiary-fixed-dim': '#5d5582',
      'tertiary-container': '#b7b0d6',
      error: '#ba1a1a',
      sombra: '#6b5a9e',
    },
  },

  dourado: {
    escuro: true,
    cores: {
      surface: '#0f1222',
      background: '#0f1222',
      'surface-container-lowest': '#090b17',
      'surface-container-low': '#141729',
      'surface-container': '#1a1e33',
      'surface-container-high': '#232840',
      'surface-container-highest': '#2d334d',
      'surface-variant': '#2d334d',
      'surface-bright': '#363c58',
      'on-surface': '#f4ead6',
      'on-surface-variant': '#cfc3a8',
      'inverse-on-surface': '#2d2a22',
      outline: '#978c74',
      'outline-variant': '#4a4536',
      primary: '#f3cf86',
      'primary-container': '#d6a24e',
      'on-primary': '#3d2800',
      'on-primary-container': '#2e1d00',
      secondary: '#e9c98f',
      'secondary-fixed-dim': '#e8c27a',
      'secondary-container': '#7a5414',
      'on-secondary': '#402c00',
      'on-secondary-container': '#ffdca0',
      tertiary: '#b9c3ea',
      'tertiary-fixed-dim': '#c3cbec',
      'tertiary-container': '#8e98c0',
      error: '#ffb4ab',
      sombra: '#04050d',
    },
  },

  aurora: {
    escuro: true,
    cores: {
      surface: '#0c1a1d',
      background: '#0c1a1d',
      'surface-container-lowest': '#071214',
      'surface-container-low': '#102226',
      'surface-container': '#152a2e',
      'surface-container-high': '#1d3539',
      'surface-container-highest': '#274045',
      'surface-variant': '#274045',
      'surface-bright': '#2f4a4f',
      'on-surface': '#dff5f0',
      'on-surface-variant': '#b4ccc7',
      'inverse-on-surface': '#22322f',
      outline: '#84a09a',
      'outline-variant': '#3d5450',
      primary: '#8ff0d4',
      'primary-container': '#4cc9a9',
      'on-primary': '#00382c',
      'on-primary-container': '#002e24',
      secondary: '#a8d8ff',
      'secondary-fixed-dim': '#9fd3f5',
      'secondary-container': '#00557a',
      'on-secondary': '#00344d',
      'on-secondary-container': '#cbe8ff',
      tertiary: '#c6b8ff',
      'tertiary-fixed-dim': '#c9bdf5',
      'tertiary-container': '#9a8ad8',
      error: '#ffb4ab',
      sombra: '#020a0b',
    },
  },

  sepia: {
    escuro: false,
    cores: {
      surface: '#f6eedd',
      background: '#f6eedd',
      'surface-container-lowest': '#fdf8ee',
      'surface-container-low': '#f1e7d3',
      'surface-container': '#ebe0c9',
      'surface-container-high': '#e4d7bd',
      'surface-container-highest': '#dccdb0',
      'surface-variant': '#dccdb0',
      'surface-bright': '#fffaf0',
      'on-surface': '#33281b',
      'on-surface-variant': '#5e4f3c',
      'inverse-on-surface': '#f6eedd',
      outline: '#867560',
      'outline-variant': '#cdbd9f',
      primary: '#8a4f12',
      'primary-container': '#a8661f',
      'on-primary': '#ffffff',
      'on-primary-container': '#ffffff',
      secondary: '#7b5a2e',
      'secondary-fixed-dim': '#7a4f1c',
      'secondary-container': '#d8a868',
      'on-secondary': '#ffffff',
      'on-secondary-container': '#4a2e08',
      tertiary: '#6e6a52',
      'tertiary-fixed-dim': '#5d5840',
      'tertiary-container': '#b3ac8c',
      error: '#a3271b',
      sombra: '#7a6340',
    },
  },
};

const canais = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** { primary: 'rgb(var(--c-primary) / <alpha-value>)', ... } */
export const coresTailwind = Object.fromEntries(
  Object.keys(noite).map((k) => [k, `rgb(var(--c-${k}) / <alpha-value>)`]),
);

/** Regras CSS base: `:root` usa o tema noite; cada `[data-theme]` sobrescreve. */
export function cssTemas() {
  const vars = (t) => ({
    ...Object.fromEntries(Object.entries(t.cores).map(([k, v]) => [`--c-${k}`, canais(v)])),
    '--fx': t.escuro ? '1' : '0.35',
    colorScheme: t.escuro ? 'dark' : 'light',
  });
  const base = { ':root': vars(temas.noite) };
  for (const [id, t] of Object.entries(temas)) base[`[data-theme="${id}"]`] = vars(t);
  return base;
}
