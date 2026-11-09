#!/usr/bin/env node
/**
 * Cadastra e atualiza obras a partir do Wattpad (API pública).
 *
 *   npm run obra:adicionar -- <link do wattpad> [outro link...]
 *   npm run obras:atualizar
 *
 * "adicionar" cria a obra em src/data/obras.json (marcada como recém-chegada).
 * "atualizar" refresca capítulos, status, classificação e capa de todas as obras;
 * título, sinopse, gêneros e avisos NÃO são mexidos (podem ter sido ajustados à mão).
 */
import { readFile, writeFile } from 'node:fs/promises';

const ARQUIVO = new URL('../src/data/obras.json', import.meta.url);
const CAMPOS = 'id,title,user(name,username,fullname),description,cover,tags,numParts,completed,mature,url,categories';

const CATEGORIAS = {
  1: 'Ficção Adolescente', 2: 'Poesia', 3: 'Fantasia', 4: 'Romance', 5: 'Ficção Científica', 6: 'Fanfic',
  7: 'Humor', 8: 'Mistério / Suspense', 9: 'Terror', 10: 'Clássicos', 11: 'Aventura', 12: 'Paranormal',
  13: 'Espiritual', 14: 'Ação', 16: 'Não Ficção', 17: 'Conto', 18: 'Vampiro', 19: 'Diversos',
  21: 'Ficção Geral', 22: 'Lobisomem', 23: 'Ficção Histórica', 24: 'Literatura Feminina',
};
const TAGS_ROMANCE = /^(romance|slowburn|enemiestolovers|friendstolovers|darkromance|clich[eê]|romantico)$/;

async function buscar(idWattpad) {
  const r = await fetch(`https://www.wattpad.com/api/v3/stories/${idWattpad}?fields=${CAMPOS}`, {
    headers: { 'User-Agent': 'constelacao-literaria (atualizador de vitrine)' },
  });
  if (!r.ok) throw new Error(`Wattpad respondeu ${r.status} para a história ${idWattpad}`);
  return r.json();
}

const idDoLink = (link) => link.match(/story\/(\d+)/)?.[1] ?? link.match(/^(\d+)$/)?.[1];

const slug = (url) =>
  decodeURIComponent(url.split('/').pop())
    .replace(/^\d+-/, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const limpar = (t = '') =>
  t.replace(/​/g, '').replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

const nomeLegivel = (u) => {
  const nome = (u.fullname || u.name || '').replace(/\p{Extended_Pictographic}|️/gu, '').trim();
  // Se o nome é igual ao @, ou parece um slogan em maiúsculas, mostramos só o @.
  if (!nome || nome.toLowerCase() === u.username.toLowerCase() || nome === nome.toUpperCase()) return undefined;
  return nome.replace(/_/g, ' ');
};

function camposAtualizaveis(d) {
  return {
    capa: d.cover?.replace('-256-', '-512-'),
    capitulos: d.numParts,
    status: d.completed ? 'Concluída' : 'Em andamento',
    ...(d.mature ? { classificacao: '+18' } : {}),
  };
}

function novaObra(d) {
  const principal = CATEGORIAS[d.categories?.find((c) => c)] ?? 'Ficção Geral';
  const generos = [principal];
  if (principal !== 'Romance' && (d.tags ?? []).some((t) => TAGS_ROMANCE.test(t.toLowerCase()))) generos.push('Romance');
  const autora = nomeLegivel(d.user);
  return {
    id: slug(d.url),
    titulo: d.title.trim().replace(/\.$/, '').trim(),
    ...(autora ? { autora } : {}),
    usuario: d.user.username,
    wattpad: d.url,
    wattpadId: String(d.id),
    generos,
    ...camposAtualizaveis(d),
    nova: true,
    sinopse: limpar(d.description),
  };
}

const ler = async () => JSON.parse(await readFile(ARQUIVO, 'utf8'));
const salvar = (obras) => writeFile(ARQUIVO, JSON.stringify(obras, null, 2) + '\n');

async function adicionar(links) {
  if (!links.length) {
    console.error('Uso: npm run obra:adicionar -- https://www.wattpad.com/story/123456789-titulo');
    process.exit(1);
  }
  const obras = await ler();
  for (const link of links) {
    const id = idDoLink(link);
    if (!id) {
      console.error(`✗ Não reconheci o link: ${link}`);
      continue;
    }
    if (obras.some((o) => o.wattpadId === id)) {
      console.log(`• Já cadastrada: ${link}`);
      continue;
    }
    try {
      const obra = novaObra(await buscar(id));
      obras.push(obra);
      console.log(`✓ ${obra.titulo} (@${obra.usuario}) — gêneros: ${obra.generos.join(', ')}`);
    } catch (e) {
      console.error(`✗ ${link}: ${e.message}`);
    }
  }
  await salvar(obras);
  console.log('\nConfira src/data/obras.json: revise gêneros, avisos e a sinopse (notas do autor).');
}

async function atualizar() {
  const obras = await ler();
  for (const o of obras) {
    if (!o.wattpadId) continue;
    try {
      const antes = o.capitulos;
      Object.assign(o, camposAtualizaveis(await buscar(o.wattpadId)));
      console.log(`✓ ${o.titulo}: ${antes} → ${o.capitulos} capítulos (${o.status})`);
    } catch (e) {
      console.error(`✗ ${o.titulo}: ${e.message}`);
    }
  }
  await salvar(obras);
}

const [comando, ...args] = process.argv.slice(2);
if (comando === 'adicionar') await adicionar(args);
else if (comando === 'atualizar') await atualizar();
else {
  console.error('Comandos: adicionar <links...> | atualizar');
  process.exit(1);
}
