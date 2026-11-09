import type { Obra } from './tipos';

/**
 * Obras do projeto.
 *
 * ⚠️ Todas as obras abaixo são FICTÍCIAS (vieram do protótipo).
 * Substitua pelos dados reais e troque o campo `wattpad` pelo link de cada história.
 * Para usar a capa original, copie o endereço da imagem da capa no Wattpad
 * (algo como https://img.wattpad.com/cover/...) no campo `capa`.
 */
const WATTPAD_PROVISORIO = 'https://www.wattpad.com/';

export const obras: Obra[] = [
  {
    id: 'ecos-de-nebulosa',
    titulo: 'Ecos de Nebulosa',
    autora: 'Marina Valente',
    usuario: 'marina_valente',
    wattpad: WATTPAD_PROVISORIO,
    generos: ['Ficção Científica', 'Fantasia'],
    classificacao: '+16',
    capitulos: 18,
    status: 'Em andamento',
    destaque: true,
    avisos: 'Violência e temas sensíveis',
    sinopse:
      'No limiar do setor estelar de Antares, a estação de pesquisa Astraea VII perde contato após registrar uma flutuação gravitacional sem precedentes no interior da Nebulosa de Tiamat. A capitã Elora Vance, veterana de guerras coloniais que jurou jamais retornar ao espaço profundo, é convocada para liderar uma missão de resgate de emergência com tripulação reduzida.\n\nO que parecia um colapso tecnológico comum revela-se um pesadelo metafísico: a poeira cósmica que circunda a estação sintetiza ecos perceptivos — manifestações das memórias mais dolorosas de qualquer um que se aproxime.\n\nEnquanto a nave é atraída para o vórtice silencioso de Tiamat, Elora precisa escolher entre enfrentar as visões que a assombram há uma década ou permitir que a entidade adormecida no núcleo da nebulosa expanda sua canção até devorar o restante dos quadrantes habitados.',
    feedbacks: [
      {
        nome: 'Thiago Leal',
        usuario: 'thiago_sci',
        papel: 'ADM',
        titulo: 'Construção de atmosfera imersiva com forte rigor sensorial',
        texto:
          'A abertura impressiona pela capacidade de balancear a terminologia técnica espacial com o peso dramático das lembranças de Elora. A cena no Capítulo 3, em que a câmara estática capta sussurros de frequências mortas há vinte anos, é digna dos grandes clássicos da ficção cósmica psicológica.',
        capitulos: 'Capítulos 1 ao 5',
        ciclo: 14,
      },
      {
        nome: 'Clarice Salles',
        usuario: 'clarice_s',
        papel: 'Leitora Crítica',
        titulo: 'Sensação claustrofóbica única: a nebulosa parece viva',
        texto:
          'Deixei 22 comentários parágrafo a parágrafo porque era impossível não reagir aos ganchos de final de capítulo. A forma como você personifica o silêncio da Astraea VII através de ruídos mecânicos e despressurização gradual cria uma tensão palpável.',
        capitulos: 'Capítulos 1 ao 5',
        ciclo: 14,
      },
    ],
  },
  {
    id: 'o-sussurro-do-eclipse',
    titulo: 'O Sussurro do Eclipse',
    autora: 'Lucas Estrela',
    usuario: 'lucas_estrela',
    wattpad: WATTPAD_PROVISORIO,
    generos: ['Fantasia'],
    classificacao: '+16',
    capitulos: 14,
    status: 'Em andamento',
    destaque: true,
    sinopse:
      'Em uma cidade velada por névoas celestes, uma astrônoma descobre que cada estrela cadente carrega o lamento de uma divindade esquecida.',
  },
  {
    id: 'entre-orbitas-e-afetos',
    titulo: 'Entre Órbitas e Afetos',
    autora: 'Clara Luz',
    usuario: 'clara.luz',
    wattpad: WATTPAD_PROVISORIO,
    generos: ['Romance'],
    classificacao: 'Livre',
    capitulos: 22,
    status: 'Concluída',
    destaque: true,
    sinopse:
      'Dois poetas trocam cartas secretas através de uma frequência de rádio interestelar analógica desativada nos anos 70.',
  },
  {
    id: 'codex-centauri',
    titulo: 'Códex Centauri',
    autora: 'Thales Autor',
    usuario: 'thales.autor',
    wattpad: WATTPAD_PROVISORIO,
    generos: ['Ficção Científica'],
    classificacao: '+14',
    capitulos: 9,
    status: 'Em andamento',
    destaque: true,
    sinopse:
      'Uma IA sentinela desperta em um cargueiro à deriva e precisa decifrar as últimas memórias fragmentadas da tripulação desaparecida.',
  },
  {
    id: 'o-labirinto-das-estrelas-mortas',
    titulo: 'O Labirinto das Estrelas Mortas',
    autora: 'Isadora Sol',
    usuario: 'isadora.sol',
    wattpad: WATTPAD_PROVISORIO,
    generos: ['Fantasia'],
    classificacao: '+14',
    capitulos: 6,
    status: 'Em andamento',
    nova: true,
    sinopse:
      'Quando a bússola de prata aponta para a escuridão absoluta, Sofia precisa escolher entre salvar seu reino ou quebrar a barreira do céu.',
  },
  {
    id: 'vozes-antes-da-meia-noite',
    titulo: 'Vozes Antes da Meia-Noite',
    autora: 'Gabriel T.',
    usuario: 'gabriel_t',
    wattpad: WATTPAD_PROVISORIO,
    generos: ['Suspense'],
    classificacao: '+16',
    capitulos: 11,
    status: 'Em andamento',
    nova: true,
    sinopse:
      'Um jornalista descobre que os obituários publicados no jornal local estão sendo redigidos doze horas antes das mortes ocorrerem.',
  },
  {
    id: 'versos-em-gravidade-zero',
    titulo: 'Versos em Gravidade Zero',
    autora: 'Aurora Versos',
    usuario: 'aurora_versos',
    wattpad: WATTPAD_PROVISORIO,
    generos: ['Poesia'],
    classificacao: 'Livre',
    capitulos: 30,
    status: 'Em andamento',
    nova: true,
    sinopse:
      'Coletânea de poemas sobre despedidas silenciosas, saudades sem peso e o eco de palavras ditas no vácuo de quartos escuros.',
  },
  {
    id: 'sob-as-estrelas-de-cetus',
    titulo: 'Sob as Estrelas de Cetus',
    autora: 'Leo Alves',
    usuario: 'leo_alves',
    wattpad: WATTPAD_PROVISORIO,
    generos: ['Ficção Científica'],
    classificacao: '+14',
    capitulos: 12,
    status: 'Em andamento',
    sinopse:
      'Uma cartógrafa estelar aceita mapear a última região inexplorada da galáxia — e descobre que alguém já desenhou aquele mapa antes dela nascer.',
  },
  {
    id: 'o-sussurro-dos-corvos',
    titulo: 'O Sussurro dos Corvos',
    autora: 'Isabela Santos',
    usuario: 'isabela_s',
    wattpad: WATTPAD_PROVISORIO,
    generos: ['Fantasia', 'Suspense'],
    classificacao: '+16',
    capitulos: 15,
    status: 'Em andamento',
    sinopse:
      'No campanário de uma cidade gótica, os corvos anunciam cada morte um dia antes. Até que começam a anunciar a de Lorde Vane.',
  },
  {
    id: 'memorias-de-vidro',
    titulo: 'Memórias de Vidro',
    autora: 'Thiago Noronha',
    usuario: 'thiago_noronha',
    wattpad: WATTPAD_PROVISORIO,
    generos: ['Romance'],
    classificacao: '+14',
    capitulos: 20,
    status: 'Concluída',
    sinopse:
      'Quando todas as recordações parecem frágeis como cristais, Clara precisa reencontrar o homem que ela prometeu esquecer antes do inverno.',
  },
];

export const obraPorId = (id: string) => obras.find((o) => o.id === id);

/** Lista de gêneros (para os filtros), na ordem em que aparecem */
export const generos = Array.from(new Set(obras.flatMap((o) => o.generos)));
