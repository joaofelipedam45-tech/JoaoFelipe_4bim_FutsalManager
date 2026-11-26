document.addEventListener('DOMContentLoaded', async () => {
    const sessao = await iniciarPagina({ exigir: 'login' });
    if (!sessao) return;

    document.getElementById('boas-vindas').textContent = `Olá, ${sessao.nome.split(' ')[0]}!`;
    carregarProximos();
});

// Mostra as 4 próximas partidas (somente futuras)
async function carregarProximos() {
    const lista = document.getElementById('listaProximos');
    try {
        const jogos = await api('/api/jogos');
        const futuros = jogos.filter((j) => new Date(j.data_hora) > new Date()).slice(0, 4);
        if (futuros.length === 0) {
            lista.innerHTML = '<li class="vazio">Nenhuma partida programada.</li>';
            return;
        }
        lista.innerHTML = futuros.map((j) => `
            <li>
                <strong>${escapar(j.time_casa_nome)} x ${escapar(j.time_visitante_nome)}</strong>
                <small>${dataHora(j.data_hora)} · ${moeda(j.preco)}</small>
            </li>`).join('');
    } catch (erro) {
        lista.innerHTML = `<li class="vazio">${escapar(erro.message)}</li>`;
    }
}
