import dados from './obras.json';
import type { Obra } from './tipos';

/**
 * As obras ficam em obras.json.
 *
 * Para cadastrar uma obra nova a partir do link do Wattpad:
 *   npm run obra:adicionar -- https://www.wattpad.com/story/123456789-titulo
 * Para atualizar capítulos/status/capa de todas:
 *   npm run obras:atualizar
 *
 * Também dá para editar o JSON à mão (gêneros, avisos, destaque: true, nova: true...).
 */
export const obras = dados as Obra[];

export const obraPorId = (id: string) => obras.find((o) => o.id === id);

/** Nome para exibir: o nome de autoria, ou o @ quando não houver nome. */
export const autoria = (o: Obra) => o.autora ?? `@${o.usuario}`;

/** Lista de gêneros (para os filtros), na ordem em que aparecem */
export const generos = Array.from(new Set(obras.flatMap((o) => o.generos)));
