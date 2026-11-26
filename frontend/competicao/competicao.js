const API = '/api/competicoes';
let editandoId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const sessao = await iniciarPagina({ exigir: 'admin' });
    if (!sessao) return;
    document.getElementById('form').addEventListener('submit', salvar);
    document.getElementById('btnCancelar').addEventListener('click', limpar);
    document.getElementById('lista').addEventListener('click', acaoLinha);
    carregar();
});

async function carregar() {
    const corpo = document.getElementById('lista');
    try {
        const lista = await api(API);
        if (lista.length === 0) { corpo.innerHTML = '<tr><td colspan="6" class="vazio">Nenhuma competição cadastrada.</td></tr>'; return; }
        corpo.innerHTML = lista.map((c) => `<tr>
            <td>${c.id}</td><td><strong>${escapar(c.nome)}</strong><br><small>${escapar(c.descricao)}</small></td>
            <td>${escapar(c.local)}</td><td>${dataSimples(c.data_inicio)}</td><td>${dataSimples(c.data_fim)}</td>
            <td class="acoes">
                <button class="btn btn-pequeno" data-acao="editar" data-id="${c.id}">Editar</button>
                <button class="btn btn-perigo btn-pequeno" data-acao="excluir" data-id="${c.id}">Excluir</button>
            </td></tr>`).join('');
    } catch (erro) {
        corpo.innerHTML = `<tr><td colspan="6" class="vazio">${escapar(erro.message)}</td></tr>`;
    }
}

async function salvar(evento) {
    evento.preventDefault();
    const dados = {
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        data_inicio: document.getElementById('data_inicio').value || null,
        data_fim: document.getElementById('data_fim').value || null,
        local: document.getElementById('local').value
    };
    try {
        if (editandoId) await api(`${API}/${editandoId}`, { method: 'PUT', body: dados });
        else await api(API, { method: 'POST', body: dados });
        mostrarAviso(editandoId ? 'Competição atualizada!' : 'Competição cadastrada!');
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
            const c = await api(`${API}/${id}`);
            editandoId = c.id;
            document.getElementById('nome').value = c.nome || '';
            document.getElementById('descricao').value = c.descricao || '';
            document.getElementById('data_inicio').value = c.data_inicio ? c.data_inicio.slice(0, 10) : '';
            document.getElementById('data_fim').value = c.data_fim ? c.data_fim.slice(0, 10) : '';
            document.getElementById('local').value = c.local || '';
            document.getElementById('titulo-form').textContent = `Editando competição #${c.id}`;
            document.getElementById('titulo-form').scrollIntoView({ behavior: 'smooth' });
        } else if (confirm('Excluir esta competição?')) {
            await api(`${API}/${id}`, { method: 'DELETE' });
            mostrarAviso('Competição excluída.');
            carregar();
        }
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
    }
}

function limpar() {
    editandoId = null;
    document.getElementById('form').reset();
    document.getElementById('titulo-form').textContent = 'Nova competição';
}
