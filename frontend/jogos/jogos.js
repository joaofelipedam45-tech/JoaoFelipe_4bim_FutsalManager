let jogos = [];
let jogoSelecionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    const sessao = await iniciarPagina({ exigir: 'login' });
    if (!sessao) return;

    document.getElementById('filtroCompeticao').addEventListener('change', desenharJogos);
    document.getElementById('quantidade').addEventListener('input', atualizarTotal);
    document.getElementById('formCompra').addEventListener('submit', comprar);
    document.getElementById('gradeJogos').addEventListener('click', (e) => {
        const botao = e.target.closest('[data-comprar]');
        if (botao) selecionarJogo(Number(botao.dataset.comprar));
    });

    await carregarJogos();
});

async function carregarJogos() {
    try {
        jogos = await api('/api/jogos');
        // Preenche o filtro com as competições que têm partidas
        const nomes = [...new Set(jogos.map((j) => j.competicao_nome))].sort();
        const filtro = document.getElementById('filtroCompeticao');
        filtro.innerHTML = '<option value="">Todas</option>' +
            nomes.map((n) => `<option value="${escapar(n)}">${escapar(n)}</option>`).join('');
        desenharJogos();
    } catch (erro) {
        document.getElementById('gradeJogos').innerHTML = `<p class="vazio">${escapar(erro.message)}</p>`;
    }
}

function situacao(jogo) {
    if (new Date(jogo.data_hora) <= new Date()) return 'encerrado';
    if (jogo.ingressos_disponiveis <= 0) return 'esgotado';
    return 'aberto';
}

function desenharJogos() {
    const competicao = document.getElementById('filtroCompeticao').value;
    const lista = jogos
        .filter((j) => !competicao || j.competicao_nome === competicao)
        // partidas futuras primeiro (da mais próxima para a mais distante); encerradas por último
        .sort((a, b) => (situacao(a) === 'encerrado') - (situacao(b) === 'encerrado') || new Date(a.data_hora) - new Date(b.data_hora));
    const grade = document.getElementById('gradeJogos');

    if (lista.length === 0) {
        grade.innerHTML = '<p class="vazio">Nenhuma partida encontrada.</p>';
        return;
    }

    grade.innerHTML = lista.map((j) => {
        const estado = situacao(j);
        const ocupacao = Math.min(100, Math.round((j.ingressos_vendidos / j.capacidade) * 100));
        const classeBarra = ocupacao >= 100 ? 'cheio' : ocupacao >= 80 ? 'quase' : '';
        const selo = estado === 'encerrado' ? '<span class="selo selo-cancelado">Encerrado</span>'
                   : estado === 'esgotado' ? '<span class="selo selo-cancelado">Esgotado</span>'
                   : `<span class="selo">${j.ingressos_disponiveis} disponíveis</span>`;
        return `
        <article class="jogo ${jogoSelecionado && jogoSelecionado.id === j.id ? 'selecionado' : ''}">
            <div class="jogo-topo"><span>${escapar(j.competicao_nome)}</span>${selo}</div>
            <div class="jogo-confronto">
                <div class="jogo-time">${tagImagem(j.time_casa_logo, '', j.time_casa_nome)}<span>${escapar(j.time_casa_nome)}</span></div>
                <div class="jogo-versus">X</div>
                <div class="jogo-time">${tagImagem(j.time_visitante_logo, '', j.time_visitante_nome)}<span>${escapar(j.time_visitante_nome)}</span></div>
            </div>
            <div class="jogo-info">
                <p>📅 ${dataHora(j.data_hora)}</p>
                <p>📍 ${escapar(j.local || 'Local a definir')}</p>
                <div class="barra-lotacao" title="${ocupacao}% vendido"><div class="${classeBarra}" style="width:${ocupacao}%"></div></div>
            </div>
            <div class="jogo-rodape">
                <span class="jogo-preco">${moeda(j.preco)}</span>
                <button type="button" class="btn btn-destaque btn-pequeno" data-comprar="${j.id}" ${estado !== 'aberto' ? 'disabled' : ''}>Comprar</button>
            </div>
        </article>`;
    }).join('');
}

function selecionarJogo(id) {
    jogoSelecionado = jogos.find((j) => j.id === id);
    document.getElementById('comprovante').hidden = true;
    document.getElementById('semSelecao').hidden = true;
    document.getElementById('formCompra').hidden = false;

    const maximo = Math.min(6, jogoSelecionado.ingressos_disponiveis);
    const qtd = document.getElementById('quantidade');
    qtd.max = maximo;
    qtd.value = 1;

    document.getElementById('resumoJogo').innerHTML = `
        <strong>${escapar(jogoSelecionado.time_casa_nome)} x ${escapar(jogoSelecionado.time_visitante_nome)}</strong>
        ${dataHora(jogoSelecionado.data_hora)}<br>${escapar(jogoSelecionado.local || '')}<br>
        Ingresso: ${moeda(jogoSelecionado.preco)}`;
    atualizarTotal();
    desenharJogos();
    document.getElementById('titulo-compra').scrollIntoView({ block: 'nearest' });
}

function atualizarTotal() {
    if (!jogoSelecionado) return;
    const qtd = parseInt(document.getElementById('quantidade').value, 10) || 0;
    document.getElementById('totalCompra').textContent = moeda(qtd * Number(jogoSelecionado.preco));
}

async function comprar(evento) {
    evento.preventDefault();
    const botao = document.getElementById('btnComprar');
    botao.disabled = true;
    try {
        const forma = document.querySelector('input[name="pagamento"]:checked').value;
        const compra = await api('/api/compras', {
            method: 'POST',
            body: {
                id_jogo: jogoSelecionado.id,
                quantidade: document.getElementById('quantidade').value,
                forma_pagamento: forma
            }
        });
        mostrarComprovante(compra, forma);
        mostrarAviso('Compra confirmada!');
        jogoSelecionado = null;
        document.getElementById('formCompra').hidden = true;
        await carregarJogos();                      // atualiza as vagas disponíveis
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
    } finally {
        botao.disabled = false;
    }
}

// Pagamento simulado: apenas exibe um comprovante conforme a forma escolhida
function mostrarComprovante(compra, forma) {
    const detalhe = {
        PIX: 'Pagamento via PIX aprovado.<code>00020126580014BR.GOV.BCB.PIX0136simulado-futsal-manager</code>',
        CARTAO: 'Pagamento no cartão aprovado em 1x.',
        BOLETO: 'Boleto gerado e compensado (simulação).<code>34191.79001 01043.510047 91020.150008 1 99990000000000</code>'
    }[forma];
    const caixa = document.getElementById('comprovante');
    caixa.innerHTML = `
        <h3>✅ Compra #${compra.id} confirmada</h3>
        <p>${compra.quantidade} ingresso(s) · ${moeda(compra.valor_total)}</p>
        <p>${detalhe}</p>
        <a class="btn btn-pequeno" href="../meus_ingressos/meus_ingressos.html">Ver meus ingressos</a>`;
    caixa.hidden = false;
    document.getElementById('semSelecao').hidden = true;
}
