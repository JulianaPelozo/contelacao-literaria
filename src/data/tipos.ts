export type Classificacao = 'Livre' | '+14' | '+16' | '+18';

export interface Feedback {
  nome: string;
  usuario: string; // @ no Wattpad
  papel?: string; // ex.: "ADM", "Leitora Crítica"
  titulo?: string;
  texto: string;
  capitulos?: string; // ex.: "Capítulos 1 ao 5"
  ciclo?: number;
}

export interface Obra {
  /** Identificador único, usado na URL (#/obra/<id>). Só letras minúsculas, números e hífens. */
  id: string;
  titulo: string;
  autora: string;
  /** Usuário no Wattpad, sem o @ */
  usuario: string;
  /** Link da obra no Wattpad (para onde as miniaturas redirecionam) */
  wattpad: string;
  /** URL da capa. Se ficar vazio, o site gera uma capa ilustrada automaticamente. */
  capa?: string;
  generos: string[];
  classificacao?: Classificacao;
  sinopse: string;
  capitulos?: number;
  status?: 'Em andamento' | 'Concluída';
  /** Aparece em "Constelações em Destaque" na página inicial */
  destaque?: boolean;
  /** Aparece em "Recém-chegadas ao Projeto" */
  nova?: boolean;
  avisos?: string;
  feedbacks?: Feedback[];
}

export interface Leitura {
  /** id da obra (ver obras.ts) */
  obra: string;
  /** Meta de leitura do ciclo, ex.: "1 ao 5" */
  capitulos: string;
}

export interface Grupo {
  nome: string;
  descricao?: string;
  leituras: Leitura[];
}

export interface Ciclo {
  numero: number;
  /** Datas no formato ISO, com fuso de Brasília */
  inicio: string;
  prazo: string;
  grupos: Grupo[];
}
