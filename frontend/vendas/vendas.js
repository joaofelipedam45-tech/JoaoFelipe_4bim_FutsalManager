let compras = [];

document.addEventListener('DOMContentLoaded', async () => {
    const sessao = await iniciarPagina({ exigir: 'admin' });
    if (!sessao) return;
    document.getElementById('filtroStatus').addEventListener('change', desenharTabela);
    document.getElementById('listaVendas').addEventListener('click', cancelar);
    carregar();
});

async function carregar() {
    try {
        const [resumo, lista] = await Promise.all([api('/api/compras/resumo'), api('/api/compras')]);
        document.getElementById('indReceita').textContent = moeda(resumo.receita);
        document.getElementById('indIngressos').textContent = resumo.ingressos_vendidos;
        document.getElementById('indVendas').textContent = resumo.vendas_pagas;
        document.getElementById('indCancel').textContent = resumo.cancelamentos;
        compras = lista;
        desenharTabela();
    } catch (erro) {
        document.getElementById('listaVendas').innerHTML = `<tr><td colspan="8" class="vazio">${escapar(erro.message)}</td></tr>`;
    }
}

function desenharTabela() {
    const status = document.getElementById('filtroStatus').value;
    const lista = compras.filter((c) => !status || c.status === status);
    const corpo = document.getElementById('listaVendas');
    if (lista.length === 0) {
        corpo.innerHTML = '<tr><td colspan="8" class="vazio">Nenhuma compra encontrada.</td></tr>';
        return;
    }
    corpo.innerHTML = lista.map((c) => {
        const podeCancelar = c.status === 'PAGO' && new Date(c.data_hora) > new Date();
        return `<tr>
            <td>#${c.id}</td>
            <td>${escapar(c.cliente_nome)}<br><small>${escapar(c.cliente_email)}</small></td>
            <td><strong>${escapar(c.time_casa_nome)} x ${escapar(c.time_visitante_nome)}</strong><br><small>${dataHora(c.data_hora)}</small></td>
            <td>${c.quantidade}</td>
            <td>${moeda(c.valor_total)}</td>
            <td>${escapar(c.forma_pagamento)}</td>
            <td><span class="selo ${c.status === 'PAGO' ? 'selo-pago' : 'selo-cancelado'}">${c.status}</span></td>
            <td>${podeCancelar ? `<button class="btn btn-perigo btn-pequeno" data-cancelar="${c.id}">Cancelar</button>` : '-'}</td>
        </tr>`;
    }).join('');
}

async function cancelar(evento) {
    const botao = evento.target.closest('[data-cancelar]');
    if (!botao || !confirm('Cancelar esta compra?')) return;
    try {
        await api(`/api/compras/${botao.dataset.cancelar}/cancelar`, { method: 'PUT' });
        mostrarAviso('Compra cancelada.');
        carregar();
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
    }
}
