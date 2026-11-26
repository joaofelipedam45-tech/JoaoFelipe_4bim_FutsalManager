document.addEventListener('DOMContentLoaded', async () => {
    const sessao = await iniciarPagina({ exigir: null });
    if (sessao) { window.location.href = '../menu/menu.html'; return; }

    document.getElementById('formCadastro').addEventListener('submit', cadastrar);
});

async function cadastrar(evento) {
    evento.preventDefault();
    const senha = document.getElementById('senha').value;
    if (senha !== document.getElementById('confirmar').value) {
        mostrarAviso('As senhas não conferem.', 'erro');
        return;
    }
    const botao = evento.target.querySelector('button[type="submit"]');
    botao.disabled = true;
    try {
        await api('/api/auth/registrar', {
            method: 'POST',
            body: { nome: document.getElementById('nome').value, email: document.getElementById('email').value, senha }
        });
        window.location.href = '../menu/menu.html';    // já entra logado
    } catch (erro) {
        mostrarAviso(erro.message, 'erro');
        botao.disabled = false;
    }
}
