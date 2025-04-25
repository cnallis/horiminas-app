// Script para gerenciamento de motoristas
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se o usuário é administrador
    if (!verificarAdmin()) {
        return;
    }

    // Referências aos elementos do DOM
    const formMotorista = document.getElementById('form-motorista');
    const formTitulo = document.getElementById('form-titulo');
    const motoristaForm = document.getElementById('motorista-form');
    const motoristaId = document.getElementById('motorista-id');
    const motoristaNome = document.getElementById('motorista-nome');
    const motoristaDocumento = document.getElementById('motorista-documento');
    const motoristaSenha = document.getElementById('motorista-senha');
    const btnNovoMotorista = document.getElementById('btn-novo-motorista');
    const btnCancelar = document.getElementById('btn-cancelar');
    const buscaMotorista = document.getElementById('busca-motorista');
    const btnBuscar = document.getElementById('btn-buscar');
    const modalExcluir = new bootstrap.Modal(document.getElementById('modal-excluir'));
    const nomeMotoristaExcluir = document.getElementById('nome-motorista-excluir');
    const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');

    // Variável para armazenar o ID do motorista a ser excluído
    let motoristaExcluirId = null;

    // Carregar lista de motoristas
    await carregarMotoristas();

    // Verificar se há parâmetro para abrir o formulário de novo motorista
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('new') === 'true') {
        mostrarFormulario();
    }

    // Event listeners
    btnNovoMotorista.addEventListener('click', mostrarFormulario);
    btnCancelar.addEventListener('click', ocultarFormulario);
    motoristaForm.addEventListener('submit', salvarMotorista);
    btnBuscar.addEventListener('click', () => buscarMotoristas(buscaMotorista.value));
    buscaMotorista.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            buscarMotoristas(buscaMotorista.value);
        }
    });
    btnConfirmarExclusao.addEventListener('click', confirmarExclusao);

    // Função para mostrar o formulário de cadastro/edição
    function mostrarFormulario(motorista = null) {
        if (motorista) {
            // Modo edição
            formTitulo.textContent = 'Editar Motorista';
            motoristaId.value = motorista.id;
            motoristaNome.value = motorista.nome;
            motoristaDocumento.value = motorista.documento;
            motoristaSenha.value = '';
            document.getElementById('senha-help').classList.remove('d-none');
        } else {
            // Modo cadastro
            formTitulo.textContent = 'Novo Motorista';
            motoristaForm.reset();
            motoristaId.value = '';
            document.getElementById('senha-help').classList.add('d-none');
        }
        
        formMotorista.classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Função para ocultar o formulário
    function ocultarFormulario() {
        formMotorista.classList.add('d-none');
        motoristaForm.reset();
    }

    // Função para salvar motorista (criar ou atualizar)
    async function salvarMotorista(e) {
        e.preventDefault();
        
        try {
            const id = motoristaId.value;
            const nome = motoristaNome.value;
            const documento = motoristaDocumento.value;
            const senha = motoristaSenha.value;
            
            const dadosMotorista = { nome, documento };
            if (senha) {
                dadosMotorista.senha = senha;
            }
            
            let response;
            
            if (id) {
                // Atualizar motorista existente
                response = await apiRequest(`/motoristas/${id}`, 'PUT', dadosMotorista);
                mostrarAlerta('Motorista atualizado com sucesso!', 'success');
            } else {
                // Criar novo motorista
                if (!senha) {
                    return mostrarAlerta('A senha é obrigatória para novos motoristas.', 'danger');
                }
                response = await apiRequest('/motoristas', 'POST', dadosMotorista);
                mostrarAlerta('Motorista cadastrado com sucesso!', 'success');
            }
            
            ocultarFormulario();
            await carregarMotoristas();
        } catch (error) {
            console.error('Erro ao salvar motorista:', error);
            mostrarAlerta('Erro ao salvar motorista: ' + error.message, 'danger');
        }
    }

    // Função para carregar a lista de motoristas
    async function carregarMotoristas() {
        try {
            const motoristas = await apiRequest('/motoristas');
            renderizarMotoristas(motoristas);
        } catch (error) {
            console.error('Erro ao carregar motoristas:', error);
            mostrarAlerta('Erro ao carregar motoristas: ' + error.message, 'danger');
        }
    }

    // Função para buscar motoristas
    async function buscarMotoristas(termo) {
        if (!termo.trim()) {
            return carregarMotoristas();
        }
        
        try {
            const motoristas = await apiRequest('/motoristas');
            const filtrados = motoristas.filter(m => 
                m.nome.toLowerCase().includes(termo.toLowerCase()) || 
                m.documento.toLowerCase().includes(termo.toLowerCase())
            );
            renderizarMotoristas(filtrados);
        } catch (error) {
            console.error('Erro ao buscar motoristas:', error);
            mostrarAlerta('Erro ao buscar motoristas: ' + error.message, 'danger');
        }
    }

    // Função para renderizar a lista de motoristas
    function renderizarMotoristas(motoristas) {
        const tbody = document.getElementById('lista-motoristas');
        tbody.innerHTML = '';
        
        if (motoristas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum motorista encontrado</td></tr>';
            return;
        }
        
        motoristas.forEach(motorista => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${motorista.nome}</td>
                <td>${motorista.documento}</td>
                <td>${formatarData(motorista.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-editar" data-id="${motorista.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${motorista.id}" data-nome="${motorista.nome}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
            
            // Adicionar event listeners aos botões
            tr.querySelector('.btn-editar').addEventListener('click', () => editarMotorista(motorista.id));
            tr.querySelector('.btn-excluir').addEventListener('click', () => prepararExclusao(motorista.id, motorista.nome));
        });
    }

    // Função para editar motorista
    async function editarMotorista(id) {
        try {
            const motorista = await apiRequest(`/motoristas/${id}`);
            mostrarFormulario(motorista);
        } catch (error) {
            console.error('Erro ao carregar dados do motorista:', error);
            mostrarAlerta('Erro ao carregar dados do motorista: ' + error.message, 'danger');
        }
    }

    // Função para preparar exclusão
    function prepararExclusao(id, nome) {
        motoristaExcluirId = id;
        nomeMotoristaExcluir.textContent = nome;
        modalExcluir.show();
    }

    // Função para confirmar exclusão
    async function confirmarExclusao() {
        if (!motoristaExcluirId) return;
        
        try {
            await apiRequest(`/motoristas/${motoristaExcluirId}`, 'DELETE');
            modalExcluir.hide();
            mostrarAlerta('Motorista excluído com sucesso!', 'success');
            await carregarMotoristas();
        } catch (error) {
            console.error('Erro ao excluir motorista:', error);
            mostrarAlerta('Erro ao excluir motorista: ' + error.message, 'danger');
        }
    }
});
