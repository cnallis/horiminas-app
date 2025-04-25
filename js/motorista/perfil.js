// Script para gerenciamento de perfil do motorista
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se o usuário está logado
    if (!verificarLogin()) {
        return;
    }

    // Verificar se o usuário NÃO é administrador
    const usuario = obterUsuario();
    if (usuario.is_admin) {
        window.location.href = '../admin/dashboard.html';
        return;
    }

    // Referências aos elementos do DOM
    const perfilForm = document.getElementById('perfil-form');
    const senhaForm = document.getElementById('senha-form');
    const nomeInput = document.getElementById('nome');
    const documentoInput = document.getElementById('documento');
    const dataCadastroInput = document.getElementById('data-cadastro');
    const senhaAtualInput = document.getElementById('senha-atual');
    const novaSenhaInput = document.getElementById('nova-senha');
    const confirmarSenhaInput = document.getElementById('confirmar-senha');

    // Carregar dados do perfil
    await carregarPerfil();

    // Event listeners
    perfilForm.addEventListener('submit', atualizarPerfil);
    senhaForm.addEventListener('submit', alterarSenha);

    // Função para carregar dados do perfil
    async function carregarPerfil() {
        try {
            // Obter dados do motorista
            const motorista = await apiRequest(`/motoristas/${usuario.id}`);
            
            // Preencher o formulário
            nomeInput.value = motorista.nome;
            documentoInput.value = motorista.documento;
            dataCadastroInput.value = formatarData(motorista.created_at);
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            mostrarAlerta('Erro ao carregar dados do perfil: ' + error.message, 'danger');
        }
    }

    // Função para atualizar perfil
    async function atualizarPerfil(e) {
        e.preventDefault();
        
        try {
            const nome = nomeInput.value;
            
            if (!nome.trim()) {
                return mostrarAlerta('O nome é obrigatório', 'danger');
            }
            
            // Atualizar dados do motorista
            await apiRequest(`/motoristas/${usuario.id}`, 'PUT', { nome });
            
            // Atualizar dados no localStorage
            const usuarioAtualizado = { ...usuario, nome };
            salvarUsuario(usuarioAtualizado);
            
            mostrarAlerta('Perfil atualizado com sucesso!', 'success');
            
            // Atualizar o nome exibido no cabeçalho
            document.getElementById('usuario-nome').textContent = nome;
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            mostrarAlerta('Erro ao atualizar perfil: ' + error.message, 'danger');
        }
    }

    // Função para alterar senha
    async function alterarSenha(e) {
        e.preventDefault();
        
        try {
            const senhaAtual = senhaAtualInput.value;
            const novaSenha = novaSenhaInput.value;
            const confirmarSenha = confirmarSenhaInput.value;
            
            // Validar campos
            if (!senhaAtual || !novaSenha || !confirmarSenha) {
                return mostrarAlerta('Todos os campos são obrigatórios', 'danger');
            }
            
            if (novaSenha !== confirmarSenha) {
                return mostrarAlerta('As senhas não coincidem', 'danger');
            }
            
            if (novaSenha.length < 6) {
                return mostrarAlerta('A nova senha deve ter pelo menos 6 caracteres', 'danger');
            }
            
            // Enviar requisição para alterar senha
            await apiRequest('/auth/alterar-senha', 'POST', {
                documento: usuario.documento,
                senhaAtual,
                novaSenha
            });
            
            mostrarAlerta('Senha alterada com sucesso!', 'success');
            
            // Limpar formulário
            senhaForm.reset();
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            mostrarAlerta('Erro ao alterar senha: ' + error.message, 'danger');
        }
    }
});
