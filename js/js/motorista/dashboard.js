// Script para o painel do motorista
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

    try {
        // Carregar dados do motorista
        await carregarDadosMotorista();
        
        // Carregar últimos rendimentos
        await carregarUltimosRendimentos();
    } catch (error) {
        console.error('Erro ao carregar dados do painel:', error);
        mostrarAlerta('Erro ao carregar dados: ' + error.message, 'danger');
    }
});

// Função para carregar dados do motorista
async function carregarDadosMotorista() {
    try {
        const usuario = obterUsuario();
        
        // Obter rendimentos do motorista
        const rendimentos = await apiRequest(`/rendimentos/motorista/${usuario.id}`);
        
        // Ordenar por data (mais recentes primeiro)
        rendimentos.sort((a, b) => {
            if (a.ano !== b.ano) return b.ano - a.ano;
            return b.mes - a.mes;
        });
        
        // Obter o rendimento mais recente
        if (rendimentos.length > 0) {
            const ultimoRendimento = rendimentos[0];
            
            // Atualizar os cards com os dados do último rendimento
            document.getElementById('total-entregas').textContent = ultimoRendimento.total_entregas;
            document.getElementById('total-toneladas').textContent = formatarNumero(ultimoRendimento.toneladas) + ' ton';
            document.getElementById('valor-bruto').textContent = formatarMoeda(ultimoRendimento.valor_bruto);
            document.getElementById('valor-liquido').textContent = formatarMoeda(ultimoRendimento.valor_liquido);
        }
    } catch (error) {
        console.error('Erro ao carregar dados do motorista:', error);
        throw error;
    }
}

// Função para carregar os últimos rendimentos
async function carregarUltimosRendimentos() {
    try {
        const usuario = obterUsuario();
        
        // Obter rendimentos do motorista
        const rendimentos = await apiRequest(`/rendimentos/motorista/${usuario.id}`);
        
        // Ordenar por data (mais recentes primeiro)
        rendimentos.sort((a, b) => {
            if (a.ano !== b.ano) return b.ano - a.ano;
            return b.mes - a.mes;
        });
        
        // Pegar os 5 mais recentes
        const ultimosRendimentos = rendimentos.slice(0, 5);
        
        const tbody = document.getElementById('ultimos-rendimentos');
        tbody.innerHTML = '';
        
        if (ultimosRendimentos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum rendimento encontrado</td></tr>';
            return;
        }
        
        ultimosRendimentos.forEach(rendimento => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${obterNomeMes(rendimento.mes)}/${rendimento.ano}</td>
                <td>${rendimento.total_entregas}</td>
                <td>${formatarNumero(rendimento.toneladas)} ton</td>
                <td>${formatarMoeda(rendimento.valor_bruto)}</td>
                <td>${formatarMoeda(rendimento.descontos)}</td>
                <td>${formatarMoeda(rendimento.valor_liquido)}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar últimos rendimentos:', error);
        throw error;
    }
}
