import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Carregando } from '../components/Carregando';
import { Alerta, Campo } from '../components/Formulario';
import { Icone } from '../components/Icone';
import { autoria, obraPorId, obras } from '../data/obras';
import type { Grupo } from '../data/tipos';
import { useAuth } from '../lib/auth';
import { useCiclo, type LinhaCiclo } from '../lib/ciclo';
import { supabase, traduzirErro } from '../lib/supabase';
import { deBrasilia, partesBrasilia, segundaDestaSemana, somarDias } from '../lib/tempo';

// ---------------------------------------------------------------------------
// Estado do formulário
// ---------------------------------------------------------------------------

interface LeituraForm {
  k: string;
  obra: string;
  capitulos: string;
}
interface GrupoForm {
  k: string;
  nome: string;
  descricao: string;
  leituras: LeituraForm[];
}
interface Form {
  numero: string;
  dataInicio: string;
  dataPrazo: string;
  horaPrazo: string;
  grupos: GrupoForm[];
}

let seq = 0;
const novaChave = () => `k${++seq}`;
const leituraVazia = (): LeituraForm => ({ k: novaChave(), obra: '', capitulos: '' });
const grupoVazio = (n: number): GrupoForm => ({ k: novaChave(), nome: `Grupo ${n}`, descricao: '', leituras: [leituraVazia()] });

const gruposParaForm = (grupos: Grupo[]): GrupoForm[] =>
  grupos.map((g) => ({
    k: novaChave(),
    nome: g.nome,
    descricao: g.descricao ?? '',
    leituras: g.leituras.map((l) => ({ k: novaChave(), obra: l.obra, capitulos: l.capitulos })),
  }));

function formDeLinha(l: LinhaCiclo): Form {
  const ini = partesBrasilia(l.inicio);
  const fim = partesBrasilia(l.prazo);
  return { numero: String(l.numero), dataInicio: ini.data, dataPrazo: fim.data, horaPrazo: fim.hora, grupos: gruposParaForm(l.grupos ?? []) };
}

/** Novo ciclo: começa no dia seguinte ao fim do último e dura uma semana (seg → dom 23:59). */
function formNovo(ultimo?: LinhaCiclo): Form {
  const inicio = ultimo ? somarDias(partesBrasilia(ultimo.prazo).data, 1) : segundaDestaSemana();
  return {
    numero: String(ultimo ? ultimo.numero + 1 : 1),
    dataInicio: inicio,
    dataPrazo: somarDias(inicio, 6),
    horaPrazo: '23:59',
    grupos: [grupoVazio(1)],
  };
}

/** Comparação ignorando as chaves internas, para saber se há alterações não salvas. */
const assinatura = (f: Form) =>
  JSON.stringify({ ...f, grupos: f.grupos.map((g) => ({ ...g, k: 0, leituras: g.leituras.map((l) => ({ ...l, k: 0 })) })) });

/** Rascunho só exige número e datas; publicar exige a grade completa. */
function validar(f: Form, completo: boolean): string[] {
  const erros: string[] = [];
  const n = Number(f.numero);
  if (!Number.isInteger(n) || n < 1) erros.push('O número do ciclo precisa ser um inteiro a partir de 1.');
  if (!f.dataInicio || !f.dataPrazo || !f.horaPrazo) erros.push('Preencha as datas de início e de prazo.');
  else if (new Date(deBrasilia(f.dataPrazo, f.horaPrazo)) <= new Date(deBrasilia(f.dataInicio)))
    erros.push('O prazo precisa ser depois do início.');
  if (!completo) return erros;
  if (f.grupos.length === 0) erros.push('Adicione pelo menos um grupo antes de publicar.');

  const nomes = new Set<string>();
  const usadas = new Map<string, string>();
  f.grupos.forEach((g, i) => {
    const nome = g.nome.trim();
    const rot = nome || `Grupo ${i + 1}`;
    if (!nome) erros.push(`O ${i + 1}º grupo está sem nome.`);
    else if (nomes.has(nome.toLowerCase())) erros.push(`Há dois grupos chamados "${nome}".`);
    nomes.add(nome.toLowerCase());
    if (g.leituras.length === 0) erros.push(`"${rot}" não tem nenhuma obra.`);
    g.leituras.forEach((l, j) => {
      if (!l.obra) erros.push(`"${rot}": escolha a obra da ${j + 1}ª linha.`);
      else if (usadas.has(l.obra))
        erros.push(`"${obraPorId(l.obra)?.titulo ?? l.obra}" aparece duas vezes (${usadas.get(l.obra)} e ${rot}).`);
      else usadas.set(l.obra, rot);
      if (!l.capitulos.trim()) erros.push(`"${rot}": informe os capítulos da ${j + 1}ª linha.`);
    });
  });
  return erros;
}

const paraGrupos = (f: Form): Grupo[] =>
  f.grupos.map((g) => ({
    nome: g.nome.trim(),
    ...(g.descricao.trim() ? { descricao: g.descricao.trim() } : {}),
    leituras: g.leituras.map((l) => ({ obra: l.obra, capitulos: l.capitulos.trim() })),
  }));

const dataCurta = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });

const obrasOrdenadas = [...obras].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export function EditorGrade() {
  const { sessao, ehAdm, carregando } = useAuth();
  const { recarregar: recarregarSite } = useCiclo();
  const [ciclos, setCiclos] = useState<LinhaCiclo[] | null>(null);
  const [selecionado, setSelecionado] = useState<number | 'novo'>('novo');
  const [form, setForm] = useState<Form>(() => formNovo());
  const [base, setBase] = useState(() => assinatura(form));
  const [erros, setErros] = useState<string[]>([]);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [salvando, setSalvando] = useState(false);

  const atual = typeof selecionado === 'number' ? ciclos?.find((c) => c.numero === selecionado) : undefined;
  const ultimo = ciclos?.[0];
  const sujo = assinatura(form) !== base;

  const abrir = useCallback((f: Form, sel: number | 'novo') => {
    setForm(f);
    setBase(assinatura(f));
    setSelecionado(sel);
    setErros([]);
  }, []);

  const carregar = useCallback(
    async (manter?: number) => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('ciclos')
        .select('numero, inicio, prazo, grupos, publicado, atualizado_em')
        .order('numero', { ascending: false });
      if (error) return setErro(traduzirErro(error));
      const lista = data as LinhaCiclo[];
      setCiclos(lista);
      const alvo = lista.find((c) => c.numero === manter);
      if (alvo) abrir(formDeLinha(alvo), alvo.numero);
      else if (manter === undefined) abrir(lista[0] ? formDeLinha(lista[0]) : formNovo(), lista[0]?.numero ?? 'novo');
    },
    [abrir],
  );

  useEffect(() => {
    if (ehAdm) carregar();
  }, [ehAdm, carregar]);

  // Aviso ao fechar a aba com alterações não salvas
  useEffect(() => {
    if (!sujo) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [sujo]);

  const usadas = useMemo(() => new Set(form.grupos.flatMap((g) => g.leituras.map((l) => l.obra)).filter(Boolean)), [form]);

  if (carregando) return <Carregando />;
  if (!sessao) return <Navigate to="/entrar" replace state={{ de: '/adm/grade' }} />;
  if (!ehAdm) return <Navigate to="/adm" replace />;

  const trocar = (f: () => Form, sel: number | 'novo') => {
    if (sujo && !window.confirm('Há alterações não salvas. Descartar?')) return;
    setErro('');
    setOk('');
    abrir(f(), sel);
  };

  // --- edição -------------------------------------------------------------
  const campo = (k: keyof Omit<Form, 'grupos'>, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const mudarGrupos = (fn: (g: GrupoForm[]) => GrupoForm[]) => setForm((f) => ({ ...f, grupos: fn(f.grupos) }));
  const mudarGrupo = (k: string, fn: (g: GrupoForm) => GrupoForm) => mudarGrupos((gs) => gs.map((g) => (g.k === k ? fn(g) : g)));
  const mover = (i: number, d: -1 | 1) =>
    mudarGrupos((gs) => {
      const j = i + d;
      if (j < 0 || j >= gs.length) return gs;
      const c = [...gs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  // --- gravação -----------------------------------------------------------
  const salvar = async (publicar: boolean) => {
    if (!supabase) return;
    setErro('');
    setOk('');
    const problemas = validar(form, publicar);
    setErros(problemas);
    if (problemas.length) return;

    const numero = Number(form.numero);
    const linha = {
      numero,
      inicio: deBrasilia(form.dataInicio),
      prazo: deBrasilia(form.dataPrazo, form.horaPrazo),
      grupos: paraGrupos(form),
      publicado: publicar,
    };
    setSalvando(true);
    const { error } =
      selecionado === 'novo'
        ? await supabase.from('ciclos').insert(linha)
        : await supabase.from('ciclos').update(linha).eq('numero', selecionado);
    setSalvando(false);
    if (error) {
      setErro(error.code === '23505' ? `Já existe um ciclo nº ${numero}. Abra-o na lista para editar.` : traduzirErro(error));
      return;
    }
    setOk(publicar ? `Ciclo ${numero} publicado! A grade já aparece para todo mundo.` : `Rascunho do ciclo ${numero} salvo. Só ADMs o veem.`);
    await carregar(numero);
    recarregarSite();
  };

  const excluir = async () => {
    if (!supabase || typeof selecionado !== 'number') return;
    if (!window.confirm(`Excluir o ciclo ${selecionado}? Isso não pode ser desfeito.`)) return;
    setSalvando(true);
    const { error } = await supabase.from('ciclos').delete().eq('numero', selecionado);
    setSalvando(false);
    if (error) return setErro(traduzirErro(error));
    setOk(`Ciclo ${selecionado} excluído.`);
    setBase(assinatura(form)); // evita o aviso de "não salvo"
    await carregar();
    recarregarSite();
  };

  return (
    <div className="max-w-6xl mx-auto px-gutter-mobile lg:px-margin pt-space-md lg:pt-space-lg flex flex-col gap-space-lg">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest p-space-md sm:p-space-lg shadow-xl">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-secondary-container/30 rounded-full blur-3xl pointer-events-none" />
        <Link to="/adm" className="relative inline-flex items-center gap-1 text-label-md text-on-surface-variant hover:text-primary">
          <Icone nome="arrow_back" className="text-[16px]" /> Painel ADM
        </Link>
        <h1 className="relative font-display text-headline-lg-mobile sm:text-headline-lg text-on-surface mt-space-sm">
          Grade da Semana
        </h1>
        <p className="relative text-body-sm sm:text-body-md text-on-surface-variant mt-1 max-w-2xl">
          Monte os grupos e as leituras de cada ciclo. Rascunhos só aparecem para ADMs; ao publicar, a grade vai para o site.
        </p>
      </header>

      <div className="grid lg:grid-cols-[260px_1fr] gap-space-lg items-start">
        {/* Lista de ciclos */}
        <aside className="flex flex-col gap-space-sm">
          <button type="button" onClick={() => trocar(() => formNovo(ultimo), 'novo')} className="btn-primary w-full">
            <Icone nome="add" className="text-[18px]" /> Novo ciclo
          </button>
          <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar -mx-gutter-mobile px-gutter-mobile lg:mx-0 lg:px-0">
            {ciclos === null && <p className="text-body-sm text-on-surface-variant p-2">Carregando ciclos…</p>}
            {ciclos?.length === 0 && <p className="text-body-sm text-on-surface-variant p-2">Nenhum ciclo cadastrado ainda.</p>}
            {ciclos?.map((c) => {
              const ativo = c.numero === selecionado;
              return (
                <button
                  key={c.numero}
                  type="button"
                  onClick={() => !ativo && trocar(() => formDeLinha(c), c.numero)}
                  className={`flex-shrink-0 min-w-[170px] text-left p-3 rounded-xl transition-colors ${
                    ativo ? 'bg-primary-container/20 ring-1 ring-primary-container/50' : 'bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className={`font-display text-headline-sm ${ativo ? 'text-primary' : 'text-on-surface'}`}>Ciclo {c.numero}</span>
                    <EtiquetaStatus publicado={c.publicado} />
                  </span>
                  <span className="block text-body-sm text-on-surface-variant mt-0.5">
                    {dataCurta(c.inicio)} – {dataCurta(c.prazo)} · {(c.grupos ?? []).length} grupo(s)
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Formulário */}
        <section className="flex flex-col gap-space-md min-w-0">
          <Alerta tipo="erro">{erro}</Alerta>
          <Alerta tipo="sucesso">{ok}</Alerta>
          {erros.length > 0 && (
            <Alerta tipo="erro">
              <p className="font-semibold">Corrija antes de salvar:</p>
              <ul className="list-disc pl-4 mt-1">
                {erros.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Alerta>
          )}

          <div className="card p-space-md sm:p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-headline-sm text-on-surface">
                {selecionado === 'novo' ? 'Novo ciclo' : `Editando o ciclo ${selecionado}`}
              </h2>
              {atual && <EtiquetaStatus publicado={atual.publicado} />}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
              <Campo
                rotulo="Número"
                type="number"
                min={1}
                required
                value={form.numero}
                onChange={(e) => campo('numero', e.target.value)}
                disabled={selecionado !== 'novo'}
                dica={selecionado !== 'novo' ? 'Fixo após criar' : undefined}
              />
              <Campo rotulo="Início" type="date" required value={form.dataInicio} onChange={(e) => campo('dataInicio', e.target.value)} />
              <Campo rotulo="Prazo" type="date" required value={form.dataPrazo} onChange={(e) => campo('dataPrazo', e.target.value)} />
              <Campo
                rotulo="Hora do prazo"
                type="time"
                required
                value={form.horaPrazo}
                onChange={(e) => campo('horaPrazo', e.target.value)}
                dica="Horário de Brasília"
              />
            </div>
            {selecionado === 'novo' && ultimo && (ultimo.grupos ?? []).length > 0 && (
              <button
                type="button"
                className="btn-ghost w-fit"
                onClick={() => {
                  if (form.grupos.some((g) => g.leituras.some((l) => l.obra)) && !window.confirm('Substituir os grupos atuais?')) return;
                  setForm((f) => ({ ...f, grupos: gruposParaForm(ultimo.grupos) }));
                }}
              >
                <Icone nome="content_copy" className="text-[18px]" /> Copiar grupos do ciclo {ultimo.numero}
              </button>
            )}
          </div>

          {form.grupos.map((g, i) => (
            <div key={g.k} className="card p-space-md sm:p-space-lg flex flex-col gap-space-md">
              <div className="flex items-start gap-space-sm">
                <div className="flex-1 grid sm:grid-cols-2 gap-space-md">
                  <Campo
                    rotulo={`Nome do grupo ${i + 1}`}
                    required
                    icone="flare"
                    value={g.nome}
                    maxLength={60}
                    onChange={(e) => mudarGrupo(g.k, (x) => ({ ...x, nome: e.target.value }))}
                  />
                  <Campo
                    rotulo="Descrição (opcional)"
                    value={g.descricao}
                    maxLength={120}
                    placeholder="Ex.: Fantasia e paranormal"
                    onChange={(e) => mudarGrupo(g.k, (x) => ({ ...x, descricao: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-1 pt-6">
                  <BotaoIcone icone="arrow_upward" rotulo="Mover grupo para cima" onClick={() => mover(i, -1)} desativado={i === 0} />
                  <BotaoIcone icone="arrow_downward" rotulo="Mover grupo para baixo" onClick={() => mover(i, 1)} desativado={i === form.grupos.length - 1} />
                  <BotaoIcone
                    icone="delete"
                    rotulo="Remover grupo"
                    perigo
                    onClick={() => {
                      if (g.leituras.some((l) => l.obra) && !window.confirm(`Remover "${g.nome || `Grupo ${i + 1}`}"?`)) return;
                      mudarGrupos((gs) => gs.filter((x) => x.k !== g.k));
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-label-md text-on-surface-variant">Leituras</span>
                {g.leituras.map((l, j) => {
                  const obra = obraPorId(l.obra);
                  return (
                    <div key={l.k} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-xl bg-surface-container-lowest/60">
                      <select
                        aria-label={`Obra ${j + 1} do grupo ${g.nome || i + 1}`}
                        value={l.obra}
                        onChange={(e) =>
                          mudarGrupo(g.k, (x) => ({ ...x, leituras: x.leituras.map((y) => (y.k === l.k ? { ...y, obra: e.target.value } : y)) }))
                        }
                        className="flex-1 min-w-0 h-11 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm px-3 ring-1 ring-outline-variant/60 focus:ring-2 focus:ring-primary-container focus:outline-none"
                      >
                        <option value="">Escolha a obra…</option>
                        {l.obra && !obra && <option value={l.obra}>{l.obra} (não está mais na vitrine)</option>}
                        {obrasOrdenadas.map((o) => (
                          <option key={o.id} value={o.id} disabled={o.id !== l.obra && usadas.has(o.id)}>
                            {o.titulo} — {autoria(o)}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          aria-label="Capítulos"
                          placeholder="Capítulos (ex.: 1 ao 5)"
                          value={l.capitulos}
                          maxLength={40}
                          onChange={(e) =>
                            mudarGrupo(g.k, (x) => ({ ...x, leituras: x.leituras.map((y) => (y.k === l.k ? { ...y, capitulos: e.target.value } : y)) }))
                          }
                          className="flex-1 sm:w-48 h-11 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm px-3 placeholder:text-outline/70 ring-1 ring-outline-variant/60 focus:ring-2 focus:ring-primary-container focus:outline-none"
                        />
                        <BotaoIcone
                          icone="close"
                          rotulo="Remover obra"
                          perigo
                          onClick={() => mudarGrupo(g.k, (x) => ({ ...x, leituras: x.leituras.filter((y) => y.k !== l.k) }))}
                        />
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => mudarGrupo(g.k, (x) => ({ ...x, leituras: [...x.leituras, leituraVazia()] }))}
                  className="btn-ghost w-fit"
                  disabled={usadas.size >= obras.length}
                >
                  <Icone nome="add" className="text-[18px]" /> Adicionar obra
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => mudarGrupos((gs) => [...gs, grupoVazio(gs.length + 1)])}
            className="w-full p-space-md rounded-2xl border-2 border-dashed border-outline-variant/60 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2 text-label-md"
          >
            <Icone nome="group_add" className="text-[20px]" /> Adicionar grupo
          </button>

          {/* Ações */}
          <div className="sticky bottom-[calc(80px+env(safe-area-inset-bottom,0px))] lg:bottom-4 z-10 card p-space-sm sm:p-space-md flex flex-wrap items-center gap-2 ring-1 ring-outline-variant/40">
            <span className="text-body-sm text-on-surface-variant mr-auto">
              {sujo ? 'Alterações não salvas' : atual ? (atual.publicado ? 'Publicado' : 'Rascunho salvo') : 'Ainda não salvo'}
            </span>
            {typeof selecionado === 'number' && (
              <button type="button" onClick={excluir} disabled={salvando} className="btn-ghost hover:text-error disabled:opacity-60">
                <Icone nome="delete" className="text-[18px]" /> Excluir
              </button>
            )}
            <button type="button" onClick={() => salvar(false)} disabled={salvando} className="btn-ghost disabled:opacity-60">
              <Icone nome={atual?.publicado ? 'visibility_off' : 'save'} className="text-[18px]" />
              {atual?.publicado ? 'Despublicar' : 'Salvar rascunho'}
            </button>
            <button type="button" onClick={() => salvar(true)} disabled={salvando} className="btn-primary disabled:opacity-60">
              {salvando ? (
                <Icone nome="progress_activity" className="text-[18px] animate-spin" />
              ) : (
                <Icone nome="publish" className="text-[18px]" />
              )}
              {atual?.publicado ? 'Salvar e manter publicado' : 'Publicar'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function EtiquetaStatus({ publicado }: { publicado: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
        publicado ? 'bg-primary-container/25 text-primary' : 'bg-surface-container-highest text-on-surface-variant'
      }`}
    >
      {publicado ? 'Publicado' : 'Rascunho'}
    </span>
  );
}

function BotaoIcone({
  icone,
  rotulo,
  onClick,
  desativado,
  perigo,
}: {
  icone: string;
  rotulo: string;
  onClick: () => void;
  desativado?: boolean;
  perigo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desativado}
      aria-label={rotulo}
      title={rotulo}
      className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:pointer-events-none ${
        perigo ? 'hover:text-error' : 'hover:text-primary'
      }`}
    >
      <Icone nome={icone} className="text-[19px]" />
    </button>
  );
}
