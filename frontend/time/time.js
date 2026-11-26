const API = '/api/times';
let editandoId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const sessao = await iniciarPagina({ exigir: 'admin' });
    if (!sessao) return;
    document.getElementById('form').addEventListener('submit', salvar);
    document.getElementById('btnCancelar').addEventListener('click', limpar);
    document.getElementById('lista').addEventListener('click', acaoLinha);
    document.getElementById('imagem').addEventListener('change', mostrarPrevia);
    await carregarTecnicos();
    carregar();
});

async function carregarTecnicos() {
    try {
        const tecnicos = await api('/api/tecnicos');
        document.getElementById('id_tecnico').innerHTML = '<option value="">Sem técnico</option>' +
            tecnicos.map((t) => `<option value="${t.id}">${escapar(t.nome)}</option>`).join('');
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
    }
}

async function carregar() {
    const corpo = document.getElementById('lista');
    try {
        const lista = await api(API);
        if (lista.length === 0) { corpo.innerHTML = '<tr><td colspan="6" class="vazio">Nenhum time cadastrado.</td></tr>'; return; }
        corpo.innerHTML = lista.map((t) => `<tr>
            <td>${tagImagem(t.logo, 'miniatura', t.nome)}</td>
            <td>${t.id}</td><td><strong>${escapar(t.nome)}</strong></td><td>${escapar(t.cidade)}</td>
            <td>${escapar(t.tecnico_nome || '-')}</td>
            <td class="acoes">
                <button class="btn btn-pequeno" data-acao="editar" data-id="${t.id}">Editar</button>
                <button class="btn btn-perigo btn-pequeno" data-acao="excluir" data-id="${t.id}">Excluir</button>
            </td></tr>`).join('');
    } catch (erro) {
        corpo.innerHTML = `<tr><td colspan="6" class="vazio">${escapar(erro.message)}</td></tr>`;
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
        cidade: document.getElementById('cidade').value,
        id_tecnico: document.getElementById('id_tecnico').value || null
    };
    try {
        const time = editandoId
            ? await api(`${API}/${editandoId}`, { method: 'PUT', body: dados })
            : await api(API, { method: 'POST', body: dados });

        // Envia a logo (se escolhida) depois de salvar os dados
        const arquivo = document.getElementById('imagem').files[0];
        if (arquivo) {
            const formData = new FormData();
            formData.append('imagem', arquivo);
            await api(`${API}/${time.id}/imagem`, { method: 'POST', body: formData });
        }
        mostrarAviso(editandoId ? 'Time atualizado!' : 'Time cadastrado!');
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
            document.getElementById('cidade').value = t.cidade || '';
            document.getElementById('id_tecnico').value = t.id_tecnico || '';
            document.getElementById('previa').src = t.logo ? `${t.logo}?v=${Date.now()}` : '/imagens/silhueta.png';
            document.getElementById('titulo-form').textContent = `Editando time #${t.id}`;
            document.getElementById('titulo-form').scrollIntoView({ behavior: 'smooth' });
        } else if (confirm('Excluir este time (e seus jogadores)?')) {
            await api(`${API}/${id}`, { method: 'DELETE' });
            mostrarAviso('Time excluído.');
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
    document.getElementById('titulo-form').textContent = 'Novo time';
}
