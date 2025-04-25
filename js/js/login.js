// Configuração da API
const API_URL = 'https://horiminas-backend.onrender.com/api';

// Função para realizar o login
async function login(documento, senha) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ documento, senha })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao fazer login');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro no login:', error);
        throw error;
    }
}

// Função para salvar os dados do usuário no localStorage
function salvarUsuario(usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

// Função para obter os dados do usuário do localStorage
function obterUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

// Função para verificar se o usuário está logado
function verificarLogin() {
    const usuario = obterUsuario();
    if (!usuario || !usuario.token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// Evento de submissão do formulário de login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginAlert = document.getElementById('login-alert');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const documento = document.getElementById('documento').value;
            const senha = document.getElementById('senha').value;
            
            try {
                loginAlert.classList.add('d-none');
                
                // Desabilitar o botão de login e mostrar indicador de carregamento
                const submitButton = loginForm.querySelector('button[type="submit"]');
                if (submitButton) {
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';

                // Após login...
                const usuario = await login(documento, senha);
                salvarUsuario(usuario);

                if (usuario.is_admin) {
                window.location.href = 'pages/admin/dashboard.html';
                } else {
                window.location.href = 'pages/motorista/dashboard.html';
    }

    // Só em caso de erro a gente restaura o botão
} else {
    console.warn('Botão de submit não encontrado');
}

                
                const usuario = await login(documento, senha);
                
                // Salvar dados do usuário
                salvarUsuario(usuario);
                
                // Redirecionar para a página apropriada
                if (usuario.is_admin) {
                    window.location.href = 'pages/admin/dashboard.html';
                } else {
                    window.location.href = 'pages/motorista/dashboard.html';
                }
            } catch (error) {
                // Mostrar mensagem de erro
                loginAlert.textContent = error.message || 'Documento ou senha incorretos.';
                loginAlert.classList.remove('d-none');
            
                // Restaurar o botão de login (com verificação de existência)
                const submitButton = loginForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Entrar';
                }
            }
                    });
    }
    
    // Verificar se o usuário já está logado e redirecionar
    const usuario = obterUsuario();
    if (usuario && usuario.token && window.location.pathname.includes('index.html')) {
        if (usuario.is_admin) {
            window.location.href = 'pages/admin/dashboard.html';
        } else {
            window.location.href = 'pages/motorista/dashboard.html';
        }
    }
});
