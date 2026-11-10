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
