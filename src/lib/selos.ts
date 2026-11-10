import { obraPorId } from '../data/obras';

export interface TipoSelo {
  id: string;
  nome: string;
  icone: string;
  /** Duas cores do degradê da medalha */
  cores: [string, string];
  lema: string;
}

/** Cada feedback rende um selo; o tipo depende do gênero principal da obra lida. */
const POR_GENERO: Record<string, TipoSelo> = {
  Romance: { id: 'venus', nome: 'Selo de Vênus', icone: 'favorite', cores: ['#ff8fb1', '#b0306a'], lema: 'Para quem leu um romance' },
  Fantasia: { id: 'draco', nome: 'Selo de Draco', icone: 'castle', cores: ['#9f8cff', '#4b2fb8'], lema: 'Para quem leu uma fantasia' },
  Fanfic: { id: 'gemeos', nome: 'Selo de Gêmeos', icone: 'diversity_1', cores: ['#7fd7ff', '#2a6fb0'], lema: 'Para quem leu uma fanfic' },
  Paranormal: { id: 'lua-nova', nome: 'Selo da Lua Nova', icone: 'dark_mode', cores: ['#b6a4d9', '#3b2c63'], lema: 'Para quem leu um paranormal' },
  'Ação': { id: 'orion', nome: 'Selo de Órion', icone: 'bolt', cores: ['#ffb36b', '#b8461c'], lema: 'Para quem leu uma ação' },
  'Mistério / Suspense': { id: 'nebulosa', nome: 'Selo da Nebulosa', icone: 'visibility', cores: ['#8de3c8', '#1f6e66'], lema: 'Para quem leu um mistério' },
  'Ficção Científica': { id: 'andromeda', nome: 'Selo de Andrômeda', icone: 'rocket_launch', cores: ['#8fb8ff', '#283f9e'], lema: 'Para quem leu uma ficção científica' },
};

export const SELO_ESTELAR: TipoSelo = {
  id: 'estelar',
  nome: 'Selo Estelar',
  icone: 'star',
  cores: ['#f6d77f', '#b5832a'],
  lema: 'Para quem leu uma obra da constelação',
};

export const TODOS_OS_SELOS: TipoSelo[] = [...Object.values(POR_GENERO), SELO_ESTELAR];

export function seloDaObra(obraId: string): TipoSelo {
  const genero = obraPorId(obraId)?.generos[0];
  return (genero && POR_GENERO[genero]) || SELO_ESTELAR;
}
