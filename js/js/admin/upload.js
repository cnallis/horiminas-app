// Script para upload de planilha
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se o usuário é administrador
    if (!verificarAdmin()) {
        return;
    }

    // Referências aos elementos do DOM
    const uploadForm = document.getElementById('upload-form');
    const btnUpload = document.getElementById('btn-upload');
    const resultadoCard = document.getElementById('resultado-card');
    const resultadoProcessamento = document.getElementById('resultado-processamento');

    // Event listener para o formulário de upload
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Desabilitar o botão de upload e mostrar indicador de carregamento
            btnUpload.disabled = true;
            btnUpload.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processando...';
            
            // Obter o arquivo
            const planilhaInput = document.getElementById('planilha');
            const planilha = planilhaInput.files[0];
            
            if (!planilha) {
                throw new Error('Selecione uma planilha para upload.');
            }
            
            // Criar FormData para envio do arquivo
            const formData = new FormData();
            formData.append('planilha', planilha);
            
            // Obter o token
            const token = obterToken();
            
            // Enviar a planilha
            const response = await fetch(`${API_URL}/rendimentos/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao processar planilha');
            }
            
            const resultado = await response.json();
            
            // Exibir resultado do processamento
            mostrarResultadoProcessamento(resultado);
            mostrarAlerta('Planilha processada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao fazer upload da planilha:', error);
            mostrarAlerta('Erro ao processar planilha: ' + error.message, 'danger');
        } finally {
            // Restaurar o botão de upload
            btnUpload.disabled = false;
            btnUpload.innerHTML = '<i class="bi bi-upload"></i> Enviar Planilha';
        }
    });

    // Função para mostrar o resultado do processamento
    function mostrarResultadoProcessamento(resultado) {
        resultadoCard.classList.remove('d-none');
        
        let html = `
            <div class="alert alert-info">
                <h6>Resumo do Processamento</h6>
                <p>Mês/Ano: ${obterNomeMes(resultado.mes)}/${resultado.ano}</p>
                <p>Total de registros processados: ${resultado.resultados.sucesso + resultado.resultados.falhas}</p>
                <p>Registros processados com sucesso: ${resultado.resultados.sucesso}</p>
                <p>Registros com falha: ${resultado.resultados.falhas}</p>
                <p>Motoristas criados automaticamente: ${resultado.resultados.motoristasCriados}</p>
            </div>
        `;
        
        if (resultado.resultados.detalhes && resultado.resultados.detalhes.length > 0) {
            html += `
                <h6>Detalhes do Processamento</h6>
                <div class="table-responsive">
                    <table class="table table-sm table-striped">
                        <thead>
                            <tr>
                                <th>Documento</th>
                                <th>Status</th>
                                <th>Mensagem</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            resultado.resultados.detalhes.forEach(detalhe => {
                const statusClass = detalhe.status === 'sucesso' ? 'text-success' : 'text-danger';
                html += `
                    <tr>
                        <td>${detalhe.documento}</td>
                        <td class="${statusClass}">${detalhe.status}</td>
                        <td>${detalhe.mensagem}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        resultadoProcessamento.innerHTML = html;
        
        // Rolar para o resultado
        resultadoCard.scrollIntoView({ behavior: 'smooth' });
    }
});
