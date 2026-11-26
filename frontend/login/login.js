document.addEventListener('DOMContentLoaded', async () => {
    // Se já existe sessão ativa, vai direto para o menu
    const sessao = await iniciarPagina({ exigir: null });
    if (sessao) { window.location.href = '../menu/menu.html'; return; }

    document.getElementById('formLogin').addEventListener('submit', entrar);
});

async function entrar(evento) {
    evento.preventDefault();
    const botao = evento.target.querySelector('button[type="submit"]');
    botao.disabled = true;
    try {
        await api('/api/auth/login', {
            method: 'POST',
            body: {
                email: document.getElementById('email').value,
                senha: document.getElementById('senha').value
            }
        });
        window.location.href = '../menu/menu.html';
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
        botao.disabled = false;
    }
}
