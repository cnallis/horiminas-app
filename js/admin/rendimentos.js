// Script para visualização de rendimentos (admin)
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se o usuário é administrador
    if (!verificarAdmin()) {
        return;
    }

    // Referências aos elementos do DOM
    const filtroMes = document.getElementById('filtro-mes');
    const filtroAno = document.getElementById('filtro-ano');
    const btnFiltrar = document.getElementById('btn-filtrar');
    const buscaMotorista = document.getElementById('busca-motorista');
    const btnBuscar = document.getElementById('btn-buscar');
    
    // Variáveis para armazenar os dados
    let todosRendimentos = [];
    let rendimentosFiltrados = [];
    
    // Preencher o select de anos com os anos disponíveis
    preencherAnosDisponiveis();
    
    // Carregar rendimentos iniciais
    await carregarRendimentos();
    
    // Event listeners
    btnFiltrar.addEventListener('click', filtrarRendimentos);
    btnBuscar.addEventListener('click', () => buscarMotorista(buscaMotorista.value));
    buscaMotorista.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            buscarMotorista(buscaMotorista.value);
        }
    });
    
    // Função para preencher o select de anos
    function preencherAnosDisponiveis() {
        const anoAtual = new Date().getFullYear();
        const selectAno = document.getElementById('filtro-ano');
        
        // Limpar opções existentes, exceto a primeira
        while (selectAno.options.length > 1) {
            selectAno.remove(1);
        }
        
        // Adicionar anos (atual e 2 anteriores)
        for (let i = anoAtual; i >= anoAtual - 2; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            selectAno.appendChild(option);
        }
    }
    
    // Função para carregar rendimentos
    async function carregarRendimentos() {
        try {
            const mes = filtroMes.value;
            const ano = filtroAno.value;
            
            // Construir a URL com os parâmetros de filtro
            let url = '/rendimentos';
            const params = [];
            
            if (mes) params.push(`mes=${mes}`);
            if (ano) params.push(`ano=${ano}`);
            
            if (params.length > 0) {
                url += `?${params.join('&')}`;
            }
            
            // Fazer a requisição
            const rendimentos = await apiRequest(url);
            todosRendimentos = rendimentos;
            rendimentosFiltrados = rendimentos;
            
            // Renderizar os rendimentos
            renderizarRendimentos(rendimentos);
        } catch (error) {
            console.error('Erro ao carregar rendimentos:', error);
            mostrarAlerta('Erro ao carregar rendimentos: ' + error.message, 'danger');
        }
    }
    
    // Função para filtrar rendimentos
    function filtrarRendimentos() {
        carregarRendimentos();
    }
    
    // Função para buscar motorista
    function buscarMotorista(termo) {
        if (!termo.trim()) {
            renderizarRendimentos(rendimentosFiltrados);
            return;
        }
        
        const termoLower = termo.toLowerCase();
        const resultados = rendimentosFiltrados.filter(r => 
            (r.motorista_nome && r.motorista_nome.toLowerCase().includes(termoLower)) || 
            (r.motorista_documento && r.motorista_documento.toLowerCase().includes(termoLower))
        );
        
        renderizarRendimentos(resultados);
    }
    
    // Função para renderizar rendimentos
    function renderizarRendimentos(rendimentos) {
        const tbody = document.getElementById('lista-rendimentos');
        tbody.innerHTML = '';
        
        if (rendimentos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum rendimento encontrado</td></tr>';
            return;
        }
        
        // Ordenar por mês/ano (mais recentes primeiro) e nome do motorista
        rendimentos.sort((a, b) => {
            if (a.ano !== b.ano) return b.ano - a.ano;
            if (a.mes !== b.mes) return b.mes - a.mes;
            
            const nomeA = a.motorista_nome || '';
            const nomeB = b.motorista_nome || '';
            return nomeA.localeCompare(nomeB);
        });
        
        rendimentos.forEach(rendimento => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${rendimento.motorista_nome || 'Motorista ' + rendimento.motorista_id}</td>
                <td>${rendimento.motorista_documento || '-'}</td>
                <td>${obterNomeMes(rendimento.mes)}/${rendimento.ano}</td>
                <td>${rendimento.total_entregas}</td>
                <td>${formatarNumero(rendimento.toneladas)} ton</td>
                <td>${formatarMoeda(rendimento.valor_bruto)}</td>
                <td>${formatarMoeda(rendimento.descontos)}</td>
                <td>${formatarMoeda(rendimento.valor_liquido)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
});
