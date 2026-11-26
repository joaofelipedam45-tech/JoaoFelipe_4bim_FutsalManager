const API = '/api/tecnicos';
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
        if (lista.length === 0) { corpo.innerHTML = '<tr><td colspan="6" class="vazio">Nenhum técnico cadastrado.</td></tr>'; return; }
        corpo.innerHTML = lista.map((t) => `<tr>
            <td>${t.id}</td><td><strong>${escapar(t.nome)}</strong></td><td>${escapar(t.email)}</td>
            <td>${escapar(t.telefone)}</td><td>${escapar(t.licenca)}</td>
            <td class="acoes">
                <button class="btn btn-pequeno" data-acao="editar" data-id="${t.id}">Editar</button>
                <button class="btn btn-perigo btn-pequeno" data-acao="excluir" data-id="${t.id}">Excluir</button>
            </td></tr>`).join('');
    } catch (erro) {
        corpo.innerHTML = `<tr><td colspan="6" class="vazio">${escapar(erro.message)}</td></tr>`;
    }
}

async function salvar(evento) {
    evento.preventDefault();
    const dados = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        licenca: document.getElementById('licenca').value
    };
    try {
        if (editandoId) await api(`${API}/${editandoId}`, { method: 'PUT', body: dados });
        else await api(API, { method: 'POST', body: dados });
        mostrarAviso(editandoId ? 'Técnico atualizado!' : 'Técnico cadastrado!');
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
            const t = await api(`${API}/${id}`);
            editandoId = t.id;
            document.getElementById('nome').value = t.nome || '';
            document.getElementById('email').value = t.email || '';
            document.getElementById('telefone').value = t.telefone || '';
            document.getElementById('licenca').value = t.licenca || '';
            document.getElementById('titulo-form').textContent = `Editando técnico #${t.id}`;
            document.getElementById('titulo-form').scrollIntoView({ behavior: 'smooth' });
        } else if (confirm('Excluir este técnico?')) {
            await api(`${API}/${id}`, { method: 'DELETE' });
            mostrarAviso('Técnico excluído.');
            carregar();
        }
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
    }
}

function limpar() {
    editandoId = null;
    document.getElementById('form').reset();
    document.getElementById('titulo-form').textContent = 'Novo técnico';
}
