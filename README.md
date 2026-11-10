<p align="center">
  <img src="assets/logo.png" alt="Constelação Literária" width="260" />
</p>

<h1 align="center">Constelação Literária</h1>

<p align="center">
  Ciclos semanais de leitura recíproca entre autoras e autores independentes do Wattpad.<br />
  <a href="https://julianapelozo.github.io/contelacao-literaria/"><strong>Acessar o site →</strong></a>
</p>

---

Site estático em React, Vite e Tailwind. É responsivo e pode ser instalado como app (PWA). A vitrine de obras e os
textos ficam em arquivos dentro de `src/data/`. As **contas**, as **grades da semana** e os **feedbacks** ficam no
[Supabase](https://supabase.com), que funciona como o backend do projeto.

O protótipo original, gerado no Stitch, continua em [`prototipo/`](prototipo/).

## Como funciona

1. A cada semana, as ADMs publicam a **grade**: grupos com as obras do ciclo e os capítulos de cada uma.
2. De **segunda a domingo (23:59)**, cada participante lê as obras das outras pessoas do seu grupo, comenta no
   Wattpad e registra aqui o seu **feedback** (Fórmula 2+1).
3. Cada feedback rende um **selo**. Quatro semanas seguidas com a meta cumprida rendem um **totem**.

## Páginas

| Rota               | Conteúdo                                                                      |
| ------------------ | ----------------------------------------------------------------------------- |
| `#/`               | Vitrine: destaques, recém-chegadas, todas as obras, busca e filtro por gênero |
| `#/grade`          | Grade do ciclo por grupo, contagem regressiva e progresso da sua meta         |
| `#/obra/<id>`      | Detalhes da obra: sinopse, dados, feedbacks recebidos e se está na grade      |
| `#/feedback/<id>`  | Formulário de feedback de uma obra da grade (precisa entrar)                  |
| `#/regras`         | Como funciona, Protocolo de Honra, regulamento, ritmos e grupos               |
| `#/entrar`         | Login (abas "Autor & Leitor" e "Mesa ADM") e recuperação de senha             |
| `#/cadastro`       | Cadastro como leitora/autora ou como ADM                                      |
| `#/conta`          | Minha conta: conquistas, feedbacks enviados e recebidos, dados                |
| `#/adm`            | Painel ADM: acompanhamento do ciclo, aprovação de ADMs e membros              |
| `#/adm/grade`      | Editor da grade da semana: criar ciclos, montar grupos e publicar             |

Na vitrine e na grade, **clicar na capa abre a obra direto no Wattpad** (nova aba). O título leva para a página
de detalhes.

## Grade, feedbacks, selos e totens

- **Quem participa:** cada conta tem o @ do Wattpad (em *Minha conta*). Se o @ for o de alguma obra da grade, a
  pessoa participa daquele ciclo, seja ela ADM ou não. Por isso o @ não pode se repetir entre contas.
- **Meta da semana:** enviar feedback para todas as obras do(s) seu(s) grupo(s), menos as suas, até o prazo.
- **Feedback:** é enviado no botão "Dar feedback" da grade. Segue a **Fórmula 2+1** (dois pontos fortes e uma
  sugestão carinhosa) e precisa ter no mínimo **150 palavras** no total. Dá para editar ou apagar até o prazo. Os
  feedbacks aparecem na página da obra e no perfil de quem escreveu e de quem recebeu.
- **Selos:** cada feedback rende um selo, e o tipo depende do gênero da obra lida:

  | Gênero              | Selo      |
  | ------------------- | --------- |
  | Romance             | Vênus     |
  | Fantasia            | Draco     |
  | Fanfic              | Gêmeos    |
  | Paranormal          | Lua Nova  |
  | Ação                | Órion     |
  | Mistério / Suspense | Nebulosa  |
  | Ficção Científica   | Andrômeda |
  | Demais gêneros      | Estelar   |

- **Totens:** cada 4 semanas seguidas com a meta cumprida rendem um totem. Uma semana encerrada sem a meta zera a
  sequência.
- **Painel ADM:** mostra quem já cumpriu a meta do ciclo vigente e quanto falta para cada pessoa.
- **Onde as regras são conferidas:** no banco ([`supabase/schema.sql`](supabase/schema.sql)), que confere prazo,
  autoria, Fórmula 2+1 e palavras mínimas. Não dá para burlar pelo navegador. Se as regras mudarem, ajuste lá e em
  [`src/data/regrasFeedback.ts`](src/data/regrasFeedback.ts).

## Como editar o conteúdo

### Obras: [`src/data/obras.json`](src/data/obras.json)

Para cadastrar uma história nova, basta o link do Wattpad:

```bash
npm run obra:adicionar -- https://www.wattpad.com/story/123456789-titulo
```

O script busca título, @, sinopse, capa, capítulos, status e classificação, e já marca a obra como recém-chegada
(`"nova": true`). Depois, revise no JSON os gêneros, os `avisos` de conteúdo e a sinopse, que às vezes traz notas do
autor. Para atualizar capítulos, status e capa de todas as obras de uma vez:

```bash
npm run obras:atualizar
```

Campos que você pode mudar à mão:
- `"destaque": true` coloca a obra em "Constelações em Destaque";
- remover `"nova"` tira a obra de "Recém-chegadas";
- `"autora"` é o nome exibido. Sem ele, aparece só o @.

### Grade da semana: pelo site, em **Painel ADM → Grade da semana**

- **Criar um ciclo:** informe número, início e prazo, em horário de Brasília. Um ciclo novo já vem com as datas da
  semana seguinte.
- **Montar os grupos:** escolha as obras da vitrine e os capítulos de cada uma. O botão "Copiar grupos do ciclo
  anterior" reaproveita a semana passada.
- **Publicar:** rascunhos só aparecem para ADMs. Ao publicar, a grade vai para o site na hora, sem precisar de deploy.
- **Ciclo exibido:** o site mostra o ciclo publicado de maior número que já começou. Assim, dá para publicar a
  próxima semana com antecedência.
- **Autora sem conta:** o editor avisa quando a autora de uma obra ainda não tem conta no site.
- **Exclusão:** um ciclo que já tem feedbacks não pode ser excluído, para não apagar os selos, mas pode ser
  despublicado.
- **Reserva:** o arquivo [`src/data/ciclo.ts`](src/data/ciclo.ts) só é usado enquanto não houver nenhum ciclo
  publicado.

### Textos: [`src/data/site.ts`](src/data/site.ts)

Dica da semana, Protocolo de Honra, regulamento, ritmos e a frase do rodapé.

## Temas

O botão de paleta 🎨 no cabeçalho troca o visual do site. A escolha fica salva no aparelho de cada pessoa.

| Tema                | Estilo                                 |
| ------------------- | -------------------------------------- |
| Automático          | Segue o modo claro/escuro do aparelho  |
| Noite Estrelada     | Escuro violeta (padrão)                |
| Manhã Lilás         | Claro                                  |
| Constelação Dourada | Azul-noite com dourado, como a logo    |
| Aurora Boreal       | Escuro, em verde-água                  |
| Pergaminho          | Claro e quente, bom para leitura longa |

As cores de cada tema ficam em [`temas.js`](temas.js).

## Contas e ADMs

- Leitoras e autoras se cadastram e já podem entrar, depois de confirmar o e-mail.
- Quem se cadastra como **ADM** fica **pendente** até uma ADM aprovada aprovar no Painel ADM. Enquanto isso, usa o
  site como leitora/autora. Se for recusada, a conta continua existindo, só que sem acesso ADM.
- A conta de **julianapelozopacheco@gmail.com** é a **ADM Primordial** e já nasce aprovada.
- As permissões ficam no banco, e não no site. Assim, ninguém consegue se promover a ADM nem mexer em grades ou
  feedbacks alheios pelo navegador.

### Configurando o Supabase (uma vez só)

1. Crie uma conta e um projeto em [supabase.com](https://supabase.com). Na região, prefira *South America (São Paulo)*.
2. No painel do projeto, abra **SQL Editor → New query**, cole todo o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
3. Em **Authentication → Sign In / Providers → Email**, deixe **Confirm email** ativado. É a confirmação do e-mail
   que garante que só a dona do e-mail primordial vira ADM Primordial.
4. Em **Authentication → URL Configuration**:
   - **Site URL**: `https://julianapelozo.github.io/contelacao-literaria/`
   - **Redirect URLs**: `https://julianapelozo.github.io/contelacao-literaria/**` e `http://localhost:5173/**`
5. Em **Project Settings → API**, copie a *Project URL* e a chave *anon public*:
   - para rodar no seu computador: copie `.env.example` para `.env.local` e preencha;
   - para o site publicado: no GitHub, abra **Settings → Secrets and variables → Actions → Variables** e crie
     `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

   A chave *anon* é pública por natureza, porque vai junto do site. Nunca use a chave *service_role* aqui.
6. **Conta da Juliana:** abra o site em `#/cadastro`, cadastre-se com `julianapelozopacheco@gmail.com` e confirme o
   e-mail. A conta já entra como ADM Primordial.

### Atualizando o banco

Sempre que o [`supabase/schema.sql`](supabase/schema.sql) mudar, rode o arquivo inteiro de novo no SQL Editor. Ele é
idempotente: só acrescenta o que falta e não apaga dados.

Se aparecer o erro `could not create unique index "perfis_usuario_unico"`, há duas contas com o mesmo @. Para
descobrir quais são, rode a consulta abaixo:

```sql
select id, nome, email, usuario from public.perfis
where lower(usuario) in (
  select lower(usuario) from public.perfis where usuario <> '' group by 1 having count(*) > 1
);
```

Depois, apague o @ de uma delas (`update public.perfis set usuario = '' where email = '...'`) e rode o schema de novo.

> O envio de e-mails embutido no Supabase tem um limite baixo (poucos e-mails por hora) e serve para testes. Quando
> a comunidade começar a se cadastrar, configure um SMTP próprio em **Authentication → Emails → SMTP Settings**
> (ex.: Resend, Brevo). Os textos dos e-mails podem ser traduzidos em **Authentication → Emails → Templates**.

## Rodando localmente

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # gera o site em dist/
npm run preview   # serve o dist/ (útil para testar o PWA)
```

## Publicação

O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publica no GitHub Pages a cada push na
`main`. Ele já está ativo, com **Settings → Pages → Source: GitHub Actions**.

Se uma publicação ficar travada em "waiting" (geralmente por instabilidade do GitHub Actions), dispare outra em
**Actions → Publicar no GitHub Pages → Run workflow** ou com `gh workflow run deploy.yml --ref main`. A nova
execução cancela a anterior sozinha.

O site também funciona em qualquer hospedagem estática (Netlify, Vercel, Cloudflare Pages): basta enviar a pasta
`dist/`. Como as rotas usam `#/`, não é preciso configurar redirecionamentos.

## PWA

O app pode ser instalado na tela inicial. O botão de instalação aparece no cabeçalho quando o navegador permite. Ele
funciona offline depois da primeira visita. Os ícones ficam em `public/` e foram gerados a partir da logo,
[`assets/logo.png`](assets/logo.png).

## Estrutura

```
src/
  pages/        telas (Inicio, Grade, Feedback, Conta, PainelAdm, EditorGrade…)
  components/   peças reutilizáveis (Layout, cartões, selos e totem, seletor de tema…)
  lib/          integração com o Supabase, autenticação, ciclo, feedbacks, temas, datas
  data/         obras, textos do site e regras do feedback
supabase/
  schema.sql    tabelas, permissões e regras do banco
scripts/
  obras.mjs     adicionar/atualizar obras a partir do Wattpad
```

---

<p align="center">Criado por <strong>Juliana Pelozo Pacheco</strong> ✨</p>
