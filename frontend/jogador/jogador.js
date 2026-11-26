const API = '/api/jogadores';
let editandoId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const sessao = await iniciarPagina({ exigir: 'admin' });
    if (!sessao) return;
    document.getElementById('form').addEventListener('submit', salvar);
    document.getElementById('btnCancelar').addEventListener('click', limpar);
    document.getElementById('lista').addEventListener('click', acaoLinha);
    document.getElementById('imagem').addEventListener('change', mostrarPrevia);
    await carregarTimes();
    carregar();
});

async function carregarTimes() {
    try {
        const times = await api('/api/times');
        document.getElementById('id_time').innerHTML = '<option value="">Sem time</option>' +
            times.map((t) => `<option value="${t.id}">${escapar(t.nome)}</option>`).join('');
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
    }
}

async function carregar() {
    const corpo = document.getElementById('lista');
    try {
        const lista = await api(API);
        if (lista.length === 0) { corpo.innerHTML = '<tr><td colspan="8" class="vazio">Nenhum jogador cadastrado.</td></tr>'; return; }
        corpo.innerHTML = lista.map((j) => `<tr>
            <td>${tagImagem(j.foto, 'miniatura', j.nome)}</td>
            <td>${j.id}</td><td><strong>${escapar(j.nome)}</strong></td><td>${j.numero}</td>
            <td>${escapar(j.posicao)}</td><td>${escapar(j.time_nome || '-')}</td><td>${dataSimples(j.data_nascimento)}</td>
            <td class="acoes">
                <button class="btn btn-pequeno" data-acao="editar" data-id="${j.id}">Editar</button>
                <button class="btn btn-perigo btn-pequeno" data-acao="excluir" data-id="${j.id}">Excluir</button>
            </td></tr>`).join('');
    } catch (erro) {
        corpo.innerHTML = `<tr><td colspan="8" class="vazio">${escapar(erro.message)}</td></tr>`;
    }
}

function mostrarPrevia() {
    const arquivo = document.getElementById('imagem').files[0];
    if (arquivo) document.getElementById('previa').src = URL.createObjectURL(arquivo);
}

async function salvar(evento) {
    evento.preventDefault();
    const dados = {
        nome: document.getElementById('nome').value,
        numero: document.getElementById('numero').value,
        posicao: document.getElementById('posicao').value,
        id_time: document.getElementById('id_time').value || null,
        data_nascimento: document.getElementById('data_nascimento').value || null
    };
    try {
        const jogador = editandoId
            ? await api(`${API}/${editandoId}`, { method: 'PUT', body: dados })
            : await api(API, { method: 'POST', body: dados });

        const arquivo = document.getElementById('imagem').files[0];
        if (arquivo) {
            const formData = new FormData();
            formData.append('imagem', arquivo);
            await api(`${API}/${jogador.id}/imagem`, { method: 'POST', body: formData });
        }
        mostrarAviso(editandoId ? 'Jogador atualizado!' : 'Jogador cadastrado!');
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
            document.getElementById('nome').value = j.nome || '';
            document.getElementById('numero').value = j.numero || '';
            document.getElementById('posicao').value = j.posicao || '';
            document.getElementById('id_time').value = j.id_time || '';
            document.getElementById('data_nascimento').value = j.data_nascimento ? j.data_nascimento.slice(0, 10) : '';
            document.getElementById('previa').src = j.foto ? `${j.foto}?v=${Date.now()}` : '/imagens/silhueta.png';
            document.getElementById('titulo-form').textContent = `Editando jogador #${j.id}`;
            document.getElementById('titulo-form').scrollIntoView({ behavior: 'smooth' });
        } else if (confirm('Excluir este jogador?')) {
            await api(`${API}/${id}`, { method: 'DELETE' });
            mostrarAviso('Jogador excluído.');
            carregar();
        }
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
    }
}

function limpar() {
    editandoId = null;
    document.getElementById('form').reset();
    document.getElementById('previa').src = '/imagens/silhueta.png';
    document.getElementById('titulo-form').textContent = 'Novo jogador';
}
