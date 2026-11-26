// =====================================================================
// Funções comuns a todas as páginas do Futsal Manager
// =====================================================================

// O frontend é servido pelo próprio backend (mesma origem), então o caminho é relativo.
const URL_API = '';

// Dados do aluno exibidos no rodapé (altere aqui)
const ALUNO = { nome: 'João Felipe', turma: 'Informe a turma', ano: 2026 };

const IMAGEM_PADRAO = '/imagens/silhueta.png';

/** Faz uma requisição à API enviando o cookie de sessão. Lança Error com a mensagem do servidor. */
async function api(caminho, opcoes = {}) {
    const config = { credentials: 'include', method: opcoes.method || 'GET', headers: {} };
    if (opcoes.body instanceof FormData) {
        config.body = opcoes.body;                       // upload: o navegador define o Content-Type
    } else if (opcoes.body !== undefined) {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(opcoes.body);
    }

    const resposta = await fetch(URL_API + caminho, config);
    let dados = null;
    try { dados = await resposta.json(); } catch (e) { /* resposta sem corpo */ }

    if (resposta.status === 401 && document.body.dataset.publica !== 'true') {
        window.location.href = '../login/login.html';    // sessão expirada
        throw new Error('Sessão expirada. Faça login novamente.');
    }
    if (!resposta.ok) throw new Error((dados && dados.error) || 'Erro ao comunicar com o servidor.');
    return dados;
}

/**
 * Inicializa a página: confirma a sessão, mostra o usuário, libera os itens do admin
 * e configura o botão Sair.
 * exigir: 'login' (cliente ou admin) | 'admin' | null (página pública)
 */
async function iniciarPagina({ exigir = 'login' } = {}) {
    preencherRodape();
    marcarMenuAtivo();

    let sessao = null;
    try {
        sessao = await api('/api/auth/me');
    } catch (e) {
        if (exigir) return null;                          // api() já redirecionou para o login
    }

    if (sessao) {
        if (sessao.perfil === 'admin') document.body.classList.add('perfil-admin');
        const area = document.getElementById('area-usuario');
        if (area) {
            document.getElementById('nome-usuario').textContent = sessao.nome;
            const selo = document.getElementById('perfil-usuario');
            selo.textContent = sessao.perfil === 'admin' ? 'Administrador' : 'Cliente';
            selo.classList.toggle('selo-admin', sessao.perfil === 'admin');
            area.hidden = false;
            document.getElementById('btnSair').addEventListener('click', sair);
        }
        if (exigir === 'admin' && sessao.perfil !== 'admin') {
            window.location.href = '../menu/menu.html';
            return null;
        }
    }
    return sessao;
}

async function sair() {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch (e) { /* segue para o login */ }
    window.location.href = '../login/login.html';
}

function marcarMenuAtivo() {
    document.querySelectorAll('.menu a').forEach((link) => {
        if (link.getAttribute('href') && window.location.pathname.endsWith(link.getAttribute('href').replace('..', ''))) {
            link.setAttribute('aria-current', 'page');
        }
    });
}

function preencherRodape() {
    const aluno = document.getElementById('rodape-aluno');
    if (aluno) aluno.textContent = ALUNO.nome;
    const turma = document.getElementById('rodape-turma');
    if (turma) turma.textContent = ALUNO.turma;
    const ano = document.getElementById('rodape-ano');
    if (ano) ano.textContent = ALUNO.ano;
}

/** Mensagem temporária no canto da tela. tipo: 'sucesso' | 'erro' | 'info' */
function mostrarAviso(mensagem, tipo = 'sucesso') {
    let caixa = document.getElementById('avisos');
    if (!caixa) {
        caixa = document.createElement('div');
        caixa.id = 'avisos';
        caixa.setAttribute('aria-live', 'polite');
        document.body.appendChild(caixa);
    }
    const aviso = document.createElement('div');
    aviso.className = `aviso ${tipo === 'sucesso' ? '' : tipo}`;
    aviso.textContent = mensagem;
    caixa.appendChild(aviso);
    setTimeout(() => aviso.remove(), 4500);
}

// ---------- Formatação ----------
const moeda = (valor) => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function dataHora(valor) {
    const d = new Date(valor);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function dataSimples(valor) {                            // valor 'AAAA-MM-DD'
    if (!valor) return '-';
    const [a, m, d] = String(valor).slice(0, 10).split('-');
    return `${d}/${m}/${a}`;
}

/** Converte data do banco para o formato do input datetime-local (hora local). */
function paraInputDataHora(valor) {
    const d = new Date(valor);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Evita que texto cadastrado vire HTML (proteção contra XSS ao usar innerHTML). */
function escapar(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Tag <img> com imagem padrão caso o arquivo não exista. */
function tagImagem(caminho, classe, alt) {
    const origem = caminho ? `${escapar(caminho)}?v=${Date.now() % 100000}` : IMAGEM_PADRAO;
    return `<img class="${classe}" src="${origem}" alt="${escapar(alt)}" onerror="this.onerror=null;this.src='${IMAGEM_PADRAO}'">`;
}
