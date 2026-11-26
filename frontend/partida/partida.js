const API = '/api/jogos';
let editandoId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const sessao = await iniciarPagina({ exigir: 'admin' });
    if (!sessao) return;
    document.getElementById('form').addEventListener('submit', salvar);
    document.getElementById('btnCancelar').addEventListener('click', limpar);
    document.getElementById('lista').addEventListener('click', acaoLinha);
    await carregarSelects();
    carregar();
});

async function carregarSelects() {
    try {
        const [competicoes, times] = await Promise.all([api('/api/competicoes'), api('/api/times')]);
        document.getElementById('id_competicao').innerHTML = '<option value="">Selecione</option>' +
            competicoes.map((c) => `<option value="${c.id}">${escapar(c.nome)}</option>`).join('');
        const opcoesTimes = '<option value="">Selecione</option>' +
            times.map((t) => `<option value="${t.id}">${escapar(t.nome)}</option>`).join('');
        document.getElementById('id_time_casa').innerHTML = opcoesTimes;
        document.getElementById('id_time_visitante').innerHTML = opcoesTimes;
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
    }
}

async function carregar() {
    const corpo = document.getElementById('lista');
    try {
        const lista = await api(API);
        if (lista.length === 0) { corpo.innerHTML = '<tr><td colspan="7" class="vazio">Nenhuma partida cadastrada.</td></tr>'; return; }
        corpo.innerHTML = lista.map((j) => `<tr>
            <td>${j.id}</td>
            <td><div class="celula-time">${tagImagem(j.time_casa_logo, 'miniatura', j.time_casa_nome)}<strong>${escapar(j.time_casa_nome)}</strong> x
                ${tagImagem(j.time_visitante_logo, 'miniatura', j.time_visitante_nome)}<strong>${escapar(j.time_visitante_nome)}</strong></div></td>
            <td>${escapar(j.competicao_nome)}</td>
            <td>${dataHora(j.data_hora)}</td>
            <td>${moeda(j.preco)}</td>
            <td>${j.ingressos_vendidos} / ${j.capacidade}</td>
            <td class="acoes">
                <button class="btn btn-pequeno" data-acao="editar" data-id="${j.id}">Editar</button>
                <button class="btn btn-perigo btn-pequeno" data-acao="excluir" data-id="${j.id}">Excluir</button>
            </td></tr>`).join('');
    } catch (erro) {
        corpo.innerHTML = `<tr><td colspan="7" class="vazio">${escapar(erro.message)}</td></tr>`;
    }
}

async function salvar(evento) {
    evento.preventDefault();
    const dados = {
        id_competicao: document.getElementById('id_competicao').value,
        id_time_casa: document.getElementById('id_time_casa').value,
        id_time_visitante: document.getElementById('id_time_visitante').value,
        data_hora: document.getElementById('data_hora').value,
        local: document.getElementById('local').value,
        preco: document.getElementById('preco').value,
        capacidade: document.getElementById('capacidade').value
    };
    try {
        if (editandoId) await api(`${API}/${editandoId}`, { method: 'PUT', body: dados });
        else await api(API, { method: 'POST', body: dados });
        mostrarAviso(editandoId ? 'Partida atualizada!' : 'Partida cadastrada!');
        limpar();
        carregar();
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
    }
}

async function acaoLinha(evento) {
    const botao = evento.target.closest('[data-acao]');
    if (!botao) return;
    const id = botao.dataset.id;
    try {
        if (botao.dataset.acao === 'editar') {
            const j = await api(`${API}/${id}`);
            editandoId = j.id;
            document.getElementById('id_competicao').value = j.id_competicao;
            document.getElementById('id_time_casa').value = j.id_time_casa;
            document.getElementById('id_time_visitante').value = j.id_time_visitante;
            document.getElementById('data_hora').value = paraInputDataHora(j.data_hora);
            document.getElementById('local').value = j.local || '';
            document.getElementById('preco').value = j.preco;
            document.getElementById('capacidade').value = j.capacidade;
            document.getElementById('titulo-form').textContent = `Editando partida #${j.id}`;
            document.getElementById('titulo-form').scrollIntoView({ behavior: 'smooth' });
        } else if (confirm('Excluir esta partida?')) {
            await api(`${API}/${id}`, { method: 'DELETE' });
            mostrarAviso('Partida excluída.');
            carregar();
        }
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
    }
}

function limpar() {
    editandoId = null;
    document.getElementById('form').reset();
    document.getElementById('titulo-form').textContent = 'Nova partida';
}
