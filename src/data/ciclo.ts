import type { Ciclo } from './tipos';

/**
 * Grade de leitura do ciclo atual.
 * A cada semana, atualize o número, as datas e as leituras de cada grupo.
 * O campo `obra` deve ser o `id` de uma obra cadastrada em obras.ts.
 */
export const cicloAtual: Ciclo = {
  numero: 14,
  inicio: '2026-11-09T00:00:00-03:00',
  prazo: '2026-11-15T23:59:00-03:00',
  grupos: [
    {
      nome: 'Grupo Cassiopeia',
      descricao: 'Mistério, suspense e ficção científica',
      leituras: [
        { obra: 'sob-as-estrelas-de-cetus', capitulos: '1 ao 5' },
        { obra: 'o-sussurro-dos-corvos', capitulos: '1 ao 4' },
        { obra: 'memorias-de-vidro', capitulos: '1 ao 3' },
        { obra: 'ecos-de-nebulosa', capitulos: '1 ao 5' },
      ],
    },
    {
      nome: 'Grupo Órion',
      descricao: 'Fantasia, sci-fi e especulativa',
      leituras: [
        { obra: 'o-sussurro-do-eclipse', capitulos: '1 ao 5' },
        { obra: 'codex-centauri', capitulos: '1 ao 4' },
        { obra: 'o-labirinto-das-estrelas-mortas', capitulos: '1 ao 3' },
      ],
    },
    {
      nome: 'Grupo Andrômeda',
      descricao: 'Romance, drama e poesia',
      leituras: [
        { obra: 'entre-orbitas-e-afetos', capitulos: '6 ao 10' },
        { obra: 'versos-em-gravidade-zero', capitulos: '1 ao 4' },
        { obra: 'vozes-antes-da-meia-noite', capitulos: '1 ao 5' },
      ],
    },
  ],
};
