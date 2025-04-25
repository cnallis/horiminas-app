// Funções utilitárias para a aplicação
const API_URL = 'https://horiminas-backend.onrender.com/api';

// Função para obter o token do usuário
function obterToken() {
    const usuario = obterUsuario();
    return usuario ? usuario.token : null;
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
        window.location.href = '../../index.html';
        return false;
    }
    return true;
}

// Função para verificar se o usuário é administrador
function verificarAdmin() {
    const usuario = obterUsuario();
    if (!usuario || !usuario.is_admin) {
        window.location.href = '../../index.html';
        return false;
    }
    return true;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('usuario');
    window.location.href = '../../index.html';
}

// Função para fazer requisições à API
async function apiRequest(endpoint, method = 'GET', body = null) {
    try {
        const token = obterToken();
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token inválido ou expirado
                logout();
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }
            
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro na requisição');
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Erro na requisição para ${endpoint}:`, error);
        throw error;
    }
}

// Função para formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Função para formatar valor monetário
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Função para formatar número com casas decimais
function formatarNumero(numero, casasDecimais = 2) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: casasDecimais,
        maximumFractionDigits: casasDecimais
    }).format(numero);
}

// Função para mostrar mensagem de alerta
function mostrarAlerta(mensagem, tipo = 'success', container = 'alert-container', tempo = 5000) {
    const alertContainer = document.getElementById(container);
    if (!alertContainer) return;
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertElement.role = 'alert';
    
    alertElement.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    alertContainer.appendChild(alertElement);
    
    // Remover o alerta após o tempo especificado
    if (tempo > 0) {
        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => alertElement.remove(), 150);
        }, tempo);
    }
}

// Função para obter nome do mês
function obterNomeMes(numeroMes) {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return meses[numeroMes - 1] || '';
}

// Inicialização comum para todas as páginas
document.addEventListener('DOMContentLoaded', () => {
    // Verificar login em todas as páginas exceto a de login
    if (!window.location.pathname.includes('index.html')) {
        verificarLogin();
    }
    
    // Configurar botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Exibir nome do usuário logado
    const usuarioNome = document.getElementById('usuario-nome');
    if (usuarioNome) {
        const usuario = obterUsuario();
        if (usuario) {
            usuarioNome.textContent = usuario.nome;
        }
    }
});
