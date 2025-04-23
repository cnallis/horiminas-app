// Script para o painel administrativo
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se o usuário é administrador
    if (!verificarAdmin()) {
        return;
    }

    try {
        // Carregar contadores
        await carregarContadores();
        
        // Carregar últimos motoristas cadastrados
        await carregarUltimosMotoristas();
        
        // Carregar últimos rendimentos processados
        await carregarUltimosRendimentos();
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        mostrarAlerta('Erro ao carregar dados do dashboard: ' + error.message, 'danger');
    }
});

// Função para carregar os contadores
async function carregarContadores() {
    try {
        // Obter total de motoristas
        const motoristas = await apiRequest('/motoristas');
        document.getElementById('total-motoristas').textContent = motoristas.length;
        
        // Obter total de rendimentos
        const rendimentos = await apiRequest('/rendimentos');
        document.getElementById('total-rendimentos').textContent = rendimentos.length;
    } catch (error) {
        console.error('Erro ao carregar contadores:', error);
        throw error;
    }
}

// Função para carregar os últimos motoristas cadastrados
async function carregarUltimosMotoristas() {
    try {
        const motoristas = await apiRequest('/motoristas');
        
        // Ordenar por data de cadastro (mais recentes primeiro)
        motoristas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Pegar os 5 mais recentes
        const ultimosMotoristas = motoristas.slice(0, 5);
        
        const tbody = document.getElementById('ultimos-motoristas');
        tbody.innerHTML = '';
        
        if (ultimosMotoristas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum motorista cadastrado</td></tr>';
            return;
        }
        
        ultimosMotoristas.forEach(motorista => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${motorista.nome}</td>
                <td>${motorista.documento}</td>
                <td>${formatarData(motorista.created_at)}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar últimos motoristas:', error);
        throw error;
    }
}

// Função para carregar os últimos rendimentos processados
async function carregarUltimosRendimentos() {
    try {
        const rendimentos = await apiRequest('/rendimentos');
        
        // Ordenar por data de cadastro (mais recentes primeiro)
        rendimentos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Pegar os 5 mais recentes
        const ultimosRendimentos = rendimentos.slice(0, 5);
        
        const tbody = document.getElementById('ultimos-rendimentos');
        tbody.innerHTML = '';
        
        if (ultimosRendimentos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum rendimento processado</td></tr>';
            return;
        }
        
        ultimosRendimentos.forEach(rendimento => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${rendimento.motorista_nome || 'Motorista ' + rendimento.motorista_id}</td>
                <td>${obterNomeMes(rendimento.mes)}/${rendimento.ano}</td>
                <td>${formatarMoeda(rendimento.valor_liquido)}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar últimos rendimentos:', error);
        throw error;
    }
}
