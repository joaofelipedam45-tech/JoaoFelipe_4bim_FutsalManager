document.addEventListener('DOMContentLoaded', async () => {
    const sessao = await iniciarPagina({ exigir: 'login' });
    if (!sessao) return;
    document.getElementById('listaCompras').addEventListener('click', cancelar);
    carregar();
});

const NOMES_PAGAMENTO = { PIX: 'PIX', CARTAO: 'Cartão', BOLETO: 'Boleto' };

async function carregar() {
    const corpo = document.getElementById('listaCompras');
    try {
        const compras = await api('/api/compras/minhas');
        if (compras.length === 0) {
            corpo.innerHTML = '<tr><td colspan="8" class="vazio">Você ainda não comprou ingressos. <a href="../jogos/jogos.html">Ver partidas</a></td></tr>';
            return;
        }
        corpo.innerHTML = compras.map((c) => {
            const futuro = new Date(c.data_hora) > new Date();
            const podeCancelar = c.status === 'PAGO' && futuro;
            return `<tr>
                <td>#${c.id}</td>
                <td><strong>${escapar(c.time_casa_nome)} x ${escapar(c.time_visitante_nome)}</strong><br><small>${escapar(c.competicao_nome)}</small></td>
                <td>${dataHora(c.data_hora)}</td>
                <td>${c.quantidade}</td>
                <td>${moeda(c.valor_total)}</td>
                <td>${NOMES_PAGAMENTO[c.forma_pagamento]}</td>
                <td><span class="selo ${c.status === 'PAGO' ? 'selo-pago' : 'selo-cancelado'}">${c.status}</span></td>
                <td>${podeCancelar ? `<button class="btn btn-perigo btn-pequeno" data-cancelar="${c.id}">Cancelar</button>` : '-'}</td>
            </tr>`;
        }).join('');
    } catch (erro) {
        corpo.innerHTML = `<tr><td colspan="8" class="vazio">${escapar(erro.message)}</td></tr>`;
    }
}

async function cancelar(evento) {
    const botao = evento.target.closest('[data-cancelar]');
    if (!botao) return;
    if (!confirm('Deseja realmente cancelar esta compra?')) return;
    try {
        await api(`/api/compras/${botao.dataset.cancelar}/cancelar`, { method: 'PUT' });
        mostrarAviso('Compra cancelada.');
        carregar();
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
    }
}
