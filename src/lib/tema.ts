import { useCallback, useEffect, useState } from 'react';

/** Metadados do seletor. As paletas completas ficam em /temas.js. */
export const TEMAS = [
  { id: 'sistema', nome: 'Automático', descricao: 'Segue o claro/escuro do aparelho', icone: 'brightness_auto', cores: ['#141125', '#fbf8ff', '#a78bfa'] },
  { id: 'noite', nome: 'Noite Estrelada', descricao: 'Escuro, em tons de violeta', icone: 'dark_mode', cores: ['#141125', '#cebdff', '#5d03ca'] },
  { id: 'claro', nome: 'Manhã Lilás', descricao: 'Claro e suave', icone: 'light_mode', cores: ['#fbf8ff', '#5b37c4', '#b89cff'] },
  { id: 'dourado', nome: 'Constelação Dourada', descricao: 'Azul-noite com dourado, como a logo', icone: 'auto_awesome', cores: ['#0f1222', '#f3cf86', '#7a5414'] },
  { id: 'aurora', nome: 'Aurora Boreal', descricao: 'Escuro, em verde-água', icone: 'nights_stay', cores: ['#0c1a1d', '#8ff0d4', '#00557a'] },
  { id: 'sepia', nome: 'Pergaminho', descricao: 'Claro e quente, bom para ler', icone: 'menu_book', cores: ['#f6eedd', '#8a4f12', '#d8a868'] },
] as const;

export type IdTema = (typeof TEMAS)[number]['id'];
type TemaAplicado = Exclude<IdTema, 'sistema'>;

const CHAVE = 'tema';
const COR_BARRA: Record<TemaAplicado, string> = {
  noite: '#141125',
  claro: '#fbf8ff',
  dourado: '#0f1222',
  aurora: '#0c1a1d',
  sepia: '#f6eedd',
};

const midiaEscura = () => window.matchMedia?.('(prefers-color-scheme: dark)');

function lerEscolha(): IdTema {
  try {
    const v = localStorage.getItem(CHAVE);
    if (v && TEMAS.some((t) => t.id === v)) return v as IdTema;
  } catch {
    /* armazenamento indisponível */
  }
  return 'noite';
}

function aplicar(escolha: IdTema) {
  const tema: TemaAplicado = escolha === 'sistema' ? (midiaEscura()?.matches === false ? 'claro' : 'noite') : escolha;
  document.documentElement.dataset.theme = tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_BARRA[tema]);
}

/** Tema escolhido (salvo neste aparelho). O index.html aplica antes de carregar o React, sem piscar. */
export function useTema() {
  const [tema, setTemaEstado] = useState<IdTema>(lerEscolha);

  useEffect(() => {
    aplicar(tema);
    if (tema !== 'sistema') return;
    const m = midiaEscura();
    const ouvir = () => aplicar('sistema');
    m?.addEventListener('change', ouvir);
    return () => m?.removeEventListener('change', ouvir);
  }, [tema]);

  const setTema = useCallback((t: IdTema) => {
    try {
      localStorage.setItem(CHAVE, t);
    } catch {
      /* segue só nesta sessão */
    }
    setTemaEstado(t);
  }, []);

  return { tema, setTema };
}
