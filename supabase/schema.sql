-- =====================================================================
-- Constelação Literária — banco de dados no Supabase
--
-- Como usar: no painel do Supabase, abra "SQL Editor" → "New query",
-- cole este arquivo inteiro e clique em "Run".
-- Pode rodar de novo sempre que este arquivo mudar (é idempotente).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Perfis: um por conta (auth.users), criado automaticamente no cadastro.
--   tipo   = 'membro' (leitor/autor) ou 'adm'
--   status = 'ativo' ou 'pendente' (ADM aguardando aprovação)
-- ---------------------------------------------------------------------
create table if not exists public.perfis (
  id           uuid primary key references auth.users (id) on delete cascade,
  nome         text not null default '',
  usuario      text not null default '',
  email        text not null,
  tipo         text not null default 'membro' check (tipo in ('membro', 'adm')),
  status       text not null default 'ativo' check (status in ('ativo', 'pendente')),
  primordial   boolean not null default false,
  aprovado_por uuid references public.perfis (id) on delete set null,
  aprovado_em  timestamptz,
  criado_em    timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- ---------------------------------------------------------------------
-- É ADM aprovada? (exige também e-mail confirmado, para que ninguém
-- consiga se passar pela ADM primordial cadastrando o e-mail dela)
-- ---------------------------------------------------------------------
create or replace function public.eh_adm(uid uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.perfis p
    join auth.users u on u.id = p.id
    where p.id = uid
      and p.tipo = 'adm'
      and p.status = 'ativo'
      and u.email_confirmed_at is not null
  );
$$;

-- ---------------------------------------------------------------------
-- Cadastro → perfil.
-- Quem pede para ser ADM entra como 'pendente' até uma ADM aprovar.
-- A conta da ADM primordial (Juliana) já nasce aprovada.
-- ---------------------------------------------------------------------
create or replace function public.criar_perfil()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  quer_adm      boolean := coalesce(new.raw_user_meta_data ->> 'tipo', 'membro') = 'adm';
  eh_primordial boolean := lower(new.email) = 'julianapelozopacheco@gmail.com';
begin
  insert into public.perfis (id, nome, usuario, email, tipo, status, primordial)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'nome', ''), 80),
    left(regexp_replace(coalesce(new.raw_user_meta_data ->> 'usuario', ''), '^@+', ''), 40),
    new.email,
    case when quer_adm or eh_primordial then 'adm' else 'membro' end,
    case when quer_adm and not eh_primordial then 'pendente' else 'ativo' end,
    eh_primordial
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- ---------------------------------------------------------------------
-- Permissões (Row Level Security)
--   • cada pessoa vê e edita o próprio perfil (só nome e @usuário)
--   • ADMs aprovadas veem todos os perfis
--   • tipo/status só mudam pelas funções aprovar_adm / recusar_adm
-- ---------------------------------------------------------------------
drop policy if exists "perfis: ver" on public.perfis;
create policy "perfis: ver" on public.perfis
  for select to authenticated
  using (id = auth.uid() or public.eh_adm());

drop policy if exists "perfis: editar o próprio" on public.perfis;
create policy "perfis: editar o próprio" on public.perfis
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

revoke all on public.perfis from anon, authenticated;
grant select on public.perfis to authenticated;
grant update (nome, usuario) on public.perfis to authenticated;

-- ---------------------------------------------------------------------
-- Aprovação de ADMs
-- ---------------------------------------------------------------------
create or replace function public.aprovar_adm(alvo uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.eh_adm() then
    raise exception 'Apenas ADMs aprovadas podem analisar cadastros.' using errcode = '42501';
  end if;
  update public.perfis
     set status = 'ativo', aprovado_por = auth.uid(), aprovado_em = now()
   where id = alvo and tipo = 'adm' and status = 'pendente';
  if not found then
    raise exception 'Solicitação não encontrada ou já analisada.';
  end if;
end;
$$;

-- Recusar mantém a conta, mas como leitora/autora (sem acesso ADM).
create or replace function public.recusar_adm(alvo uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.eh_adm() then
    raise exception 'Apenas ADMs aprovadas podem analisar cadastros.' using errcode = '42501';
  end if;
  update public.perfis
     set tipo = 'membro', status = 'ativo', aprovado_por = auth.uid(), aprovado_em = now()
   where id = alvo and tipo = 'adm' and status = 'pendente';
  if not found then
    raise exception 'Solicitação não encontrada ou já analisada.';
  end if;
end;
$$;

revoke execute on function public.eh_adm(uuid)       from public, anon;
revoke execute on function public.aprovar_adm(uuid)  from public, anon;
revoke execute on function public.recusar_adm(uuid)  from public, anon;
revoke execute on function public.criar_perfil()     from public, anon, authenticated;
grant  execute on function public.eh_adm(uuid)       to authenticated;
grant  execute on function public.aprovar_adm(uuid)  to authenticated;
grant  execute on function public.recusar_adm(uuid)  to authenticated;

-- ---------------------------------------------------------------------
-- Contas que já existiam antes deste script ganham perfil,
-- e a ADM primordial é garantida mesmo se ela tiver se cadastrado antes.
-- ---------------------------------------------------------------------
insert into public.perfis (id, nome, usuario, email)
select u.id,
       coalesce(u.raw_user_meta_data ->> 'nome', ''),
       coalesce(u.raw_user_meta_data ->> 'usuario', ''),
       u.email
  from auth.users u
 where not exists (select 1 from public.perfis p where p.id = u.id);

update public.perfis
   set tipo = 'adm', status = 'ativo', primordial = true
 where lower(email) = 'julianapelozopacheco@gmail.com';

-- =====================================================================
-- Ciclos e grade de leitura da semana
--   • grupos   = lista de grupos, cada um com suas leituras:
--                [{ "nome": "...", "descricao": "...",
--                   "leituras": [{ "obra": "<id da obra>", "capitulos": "1 ao 5" }] }]
--   • qualquer pessoa (mesmo sem conta) vê os ciclos publicados
--   • só ADMs aprovadas veem rascunhos e criam/editam/excluem ciclos
-- =====================================================================
create table if not exists public.ciclos (
  numero         integer primary key check (numero > 0),
  inicio         timestamptz not null,
  prazo          timestamptz not null,
  grupos         jsonb not null default '[]'::jsonb check (jsonb_typeof(grupos) = 'array'),
  publicado      boolean not null default false,
  atualizado_por uuid references public.perfis (id) on delete set null,
  atualizado_em  timestamptz not null default now(),
  criado_em      timestamptz not null default now(),
  constraint ciclos_prazo_depois_do_inicio check (prazo > inicio)
);

alter table public.ciclos enable row level security;

-- Registra quem mexeu por último e quando.
create or replace function public.ciclos_carimbo()
returns trigger
language plpgsql set search_path = public
as $$
begin
  new.atualizado_por := auth.uid();
  new.atualizado_em  := now();
  return new;
end;
$$;

drop trigger if exists ciclos_carimbo on public.ciclos;
create trigger ciclos_carimbo
  before insert or update on public.ciclos
  for each row execute function public.ciclos_carimbo();

drop policy if exists "ciclos: ver publicados" on public.ciclos;
create policy "ciclos: ver publicados" on public.ciclos
  for select to anon, authenticated
  using (publicado);

drop policy if exists "ciclos: ADM vê todos" on public.ciclos;
create policy "ciclos: ADM vê todos" on public.ciclos
  for select to authenticated
  using (public.eh_adm());

drop policy if exists "ciclos: ADM cria" on public.ciclos;
create policy "ciclos: ADM cria" on public.ciclos
  for insert to authenticated
  with check (public.eh_adm());

drop policy if exists "ciclos: ADM edita" on public.ciclos;
create policy "ciclos: ADM edita" on public.ciclos
  for update to authenticated
  using (public.eh_adm())
  with check (public.eh_adm());

drop policy if exists "ciclos: ADM exclui" on public.ciclos;
create policy "ciclos: ADM exclui" on public.ciclos
  for delete to authenticated
  using (public.eh_adm());

revoke all on public.ciclos from anon, authenticated;
grant select on public.ciclos to anon, authenticated;
grant insert, update, delete on public.ciclos to authenticated;
revoke execute on function public.ciclos_carimbo() from public, anon, authenticated;

-- =====================================================================
-- Feedbacks, metas e conquistas (selos e totens)
--
-- Cada leitura da grade guarda também a autoria:
--   { "obra": "<id>", "capitulos": "1 ao 5", "titulo": "...", "usuario": "<@ no Wattpad>" }
-- A pessoa participa da grade quando o @ do perfil dela é o @ de alguma obra.
-- Meta do ciclo = feedback em todas as obras do(s) grupo(s) dela, menos as próprias.
-- =====================================================================

-- O @ identifica a autora na grade, então não pode se repetir entre contas.
-- (Se este comando falhar, há duas contas com o mesmo @: corrija uma delas e rode de novo.)
create unique index if not exists perfis_usuario_unico
  on public.perfis (lower(usuario)) where usuario <> '';

-- Regras do feedback (mude aqui se as regras mudarem; o site tem as mesmas em src/data/regrasFeedback.ts)
create or replace function public.palavras_minimas()
returns integer language sql immutable as $$ select 150 $$;

create or replace function public.contar_palavras(t text)
returns integer language sql immutable as $$
  select case when btrim(coalesce(t, '')) = '' then 0
              else array_length(regexp_split_to_array(btrim(t), '\s+'), 1) end
$$;

-- Leituras de um ciclo, uma por linha.
create or replace function public.leituras_do_ciclo(c public.ciclos)
returns table (grupo text, obra text, titulo text, usuario text)
language sql immutable as $$
  select g ->> 'nome',
         l ->> 'obra',
         coalesce(nullif(l ->> 'titulo', ''), l ->> 'obra'),
         lower(regexp_replace(coalesce(l ->> 'usuario', ''), '^@+', ''))
    from jsonb_array_elements(c.grupos) g,
         jsonb_array_elements(coalesce(g -> 'leituras', '[]'::jsonb)) l
$$;

create table if not exists public.feedbacks (
  id             uuid primary key default gen_random_uuid(),
  leitor         uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  -- restrict: um ciclo com feedbacks não pode ser excluído (apagaria selos)
  ciclo          integer not null references public.ciclos (numero) on delete restrict,
  obra           text not null,
  forte_1        text not null check (char_length(forte_1) <= 5000),
  forte_2        text not null check (char_length(forte_2) <= 5000),
  sugestao       text not null check (char_length(sugestao) <= 5000),
  -- preenchidos automaticamente (cópia, para o histórico não mudar se a grade mudar)
  obra_titulo    text not null default '',
  autor_usuario  text not null default '',
  leitor_nome    text not null default '',
  leitor_usuario text not null default '',
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  constraint feedbacks_um_por_obra unique (leitor, ciclo, obra)
);

alter table public.feedbacks enable row level security;

create or replace function public.feedbacks_validar()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  c        public.ciclos;
  p        public.perfis;
  l        record;
  palavras integer;
begin
  if tg_op = 'UPDATE' then
    if new.leitor <> old.leitor or new.ciclo <> old.ciclo or new.obra <> old.obra then
      raise exception 'Não é possível trocar a obra ou o ciclo de um feedback.';
    end if;
    new.criado_em := old.criado_em;
  else
    new.leitor    := auth.uid();
    new.criado_em := now();
  end if;

  select * into p from public.perfis where id = new.leitor;
  if not found then
    raise exception 'Entre na sua conta para enviar feedbacks.' using errcode = '42501';
  end if;

  select * into c from public.ciclos where numero = new.ciclo and publicado;
  if not found then
    raise exception 'Este ciclo não existe ou não foi publicado.';
  end if;
  if now() < c.inicio then
    raise exception 'Este ciclo ainda não começou.';
  end if;
  if now() > c.prazo then
    raise exception 'O prazo deste ciclo já terminou.';
  end if;

  select * into l from public.leituras_do_ciclo(c) x where x.obra = new.obra limit 1;
  if not found then
    raise exception 'Esta obra não está na grade deste ciclo.';
  end if;
  if l.usuario <> '' and l.usuario = lower(p.usuario) then
    raise exception 'Você não pode dar feedback na sua própria obra.';
  end if;

  new.forte_1  := btrim(new.forte_1);
  new.forte_2  := btrim(new.forte_2);
  new.sugestao := btrim(new.sugestao);
  if new.forte_1 = '' or new.forte_2 = '' or new.sugestao = '' then
    raise exception 'Preencha os 2 pontos fortes e a sugestão (Fórmula 2+1).';
  end if;
  palavras := public.contar_palavras(new.forte_1 || ' ' || new.forte_2 || ' ' || new.sugestao);
  if palavras < public.palavras_minimas() then
    raise exception 'O feedback precisa ter pelo menos % palavras (tem %).', public.palavras_minimas(), palavras;
  end if;

  new.obra_titulo    := l.titulo;
  new.autor_usuario  := l.usuario;
  new.leitor_nome    := p.nome;
  new.leitor_usuario := p.usuario;
  new.atualizado_em  := now();
  return new;
end;
$$;

drop trigger if exists feedbacks_validar on public.feedbacks;
create trigger feedbacks_validar
  before insert or update on public.feedbacks
  for each row execute function public.feedbacks_validar();

-- Quem escreveu pode apagar até o fim do prazo; ADMs podem apagar a qualquer momento (moderação).
create or replace function public.feedbacks_ao_apagar()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if not public.eh_adm()
     and exists (select 1 from public.ciclos c where c.numero = old.ciclo and now() > c.prazo) then
    raise exception 'O prazo deste ciclo já terminou; o feedback não pode mais ser apagado.';
  end if;
  return old;
end;
$$;

drop trigger if exists feedbacks_ao_apagar on public.feedbacks;
create trigger feedbacks_ao_apagar
  before delete on public.feedbacks
  for each row execute function public.feedbacks_ao_apagar();

drop policy if exists "feedbacks: ver" on public.feedbacks;
create policy "feedbacks: ver" on public.feedbacks
  for select to anon, authenticated
  using (true);

drop policy if exists "feedbacks: escrever o próprio" on public.feedbacks;
create policy "feedbacks: escrever o próprio" on public.feedbacks
  for insert to authenticated
  with check (leitor = auth.uid());

drop policy if exists "feedbacks: editar o próprio" on public.feedbacks;
create policy "feedbacks: editar o próprio" on public.feedbacks
  for update to authenticated
  using (leitor = auth.uid())
  with check (leitor = auth.uid());

drop policy if exists "feedbacks: apagar" on public.feedbacks;
create policy "feedbacks: apagar" on public.feedbacks
  for delete to authenticated
  using (leitor = auth.uid() or public.eh_adm());

revoke all on public.feedbacks from anon, authenticated;
grant select on public.feedbacks to anon, authenticated;
grant insert (ciclo, obra, forte_1, forte_2, sugestao) on public.feedbacks to authenticated;
grant update (forte_1, forte_2, sugestao) on public.feedbacks to authenticated;
grant delete on public.feedbacks to authenticated;

-- ---------------------------------------------------------------------
-- Metas da pessoa logada, por ciclo já iniciado (meta 0 = não estava na grade).
-- O site usa isto para a sequência de semanas e os totens.
-- ---------------------------------------------------------------------
create or replace function public.minhas_metas()
returns table (ciclo integer, inicio timestamptz, prazo timestamptz, meta integer, feitos integer)
language sql stable set search_path = public
as $$
  with eu as (
    select lower(usuario) as u from public.perfis where id = auth.uid() and usuario <> ''
  ),
  linhas as (
    select c.numero, x.grupo, x.obra, x.usuario
      from public.ciclos c, lateral public.leituras_do_ciclo(c) x
     where c.publicado and c.inicio <= now()
  ),
  alvos as (
    select distinct l.numero, l.obra
      from linhas l, eu
     where l.usuario <> eu.u
       and exists (select 1 from linhas m
                    where m.numero = l.numero and m.grupo = l.grupo and m.usuario = eu.u)
  )
  select c.numero,
         c.inicio,
         c.prazo,
         (select count(*) from alvos a where a.numero = c.numero)::integer,
         (select count(*) from alvos a
            join public.feedbacks f on f.ciclo = a.numero and f.obra = a.obra and f.leitor = auth.uid()
           where a.numero = c.numero)::integer
    from public.ciclos c
   where c.publicado and c.inicio <= now()
   order by c.numero
$$;

-- ---------------------------------------------------------------------
-- Acompanhamento de um ciclo para as ADMs: cada participante, meta e feitos.
-- ---------------------------------------------------------------------
create or replace function public.relatorio_ciclo(n integer)
returns table (usuario text, nome text, tem_conta boolean, meta integer, feitos integer)
language plpgsql stable security definer set search_path = public
as $$
#variable_conflict use_column
begin
  if not public.eh_adm() then
    raise exception 'Apenas ADMs aprovadas podem ver o acompanhamento.' using errcode = '42501';
  end if;
  return query
  with linhas as (
    select x.grupo, x.obra, x.usuario
      from public.ciclos c, lateral public.leituras_do_ciclo(c) x
     where c.numero = n
  ),
  pessoas as (
    select distinct l.usuario as u from linhas l where l.usuario <> ''
  ),
  alvos as (
    select distinct p.u, l.obra
      from pessoas p
      join linhas l on l.usuario <> p.u
     where exists (select 1 from linhas m where m.grupo = l.grupo and m.usuario = p.u)
  )
  select p.u,
         coalesce(pf.nome, ''),
         pf.id is not null,
         (select count(*) from alvos a where a.u = p.u)::integer,
         (select count(*) from alvos a
            join public.feedbacks f on f.ciclo = n and f.obra = a.obra and f.leitor = pf.id
           where a.u = p.u)::integer
    from pessoas p
    left join public.perfis pf on lower(pf.usuario) = p.u
   order by 5 desc, 1;
end;
$$;

revoke execute on function public.feedbacks_validar()     from public, anon, authenticated;
revoke execute on function public.feedbacks_ao_apagar()   from public, anon, authenticated;
revoke execute on function public.minhas_metas()          from public, anon;
revoke execute on function public.relatorio_ciclo(integer) from public, anon;
grant  execute on function public.minhas_metas()          to authenticated;
grant  execute on function public.relatorio_ciclo(integer) to authenticated;
