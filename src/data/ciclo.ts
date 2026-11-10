import type { Ciclo } from './tipos';

/**
 * RESERVA: a grade de verdade é criada pelas ADMs no site (Painel ADM → Grade da semana)
 * e fica na tabela `ciclos` do Supabase. Este arquivo só é usado enquanto não houver
 * nenhum ciclo publicado lá (ou se o Supabase não estiver configurado).
 *
 * Grade de leitura do ciclo atual.
 * A cada semana, atualize o número, as datas e as leituras de cada grupo.
 * O campo `obra` deve ser o `id` de uma obra de obras.json.
 *
 * Exemplo de grupo:
 *   {
 *     nome: 'Grupo Órion',
 *     descricao: 'Fantasia e paranormal',
 *     leituras: [
 *       { obra: 'o-fio-da-balanca', capitulos: '1 ao 5' },
 *       { obra: 'carne-da-ruina-esquadrao-12', capitulos: '1 ao 3' },
 *     ],
 *   },
 *
 * Enquanto `grupos` estiver vazio, a página da grade mostra "grade em preparação".
 */
export const cicloAtual: Ciclo = {
  numero: 1,
  inicio: '2026-11-09T00:00:00-03:00',
  prazo: '2026-11-15T23:59:00-03:00',
  grupos: [],
};
