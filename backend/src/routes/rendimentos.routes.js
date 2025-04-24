const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin, verificarAcessoMotorista } = require('../middlewares/auth.middleware');
const db = require('../config/db');
const xlsx = require('xlsx');
const multer = require('multer');
const path = require('path');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, 'planilha-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Aceitar apenas arquivos Excel
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel são permitidos!'), false);
    }
  }
});

// Obter rendimentos de um motorista específico
router.get('/motorista/:id', verificarToken, verificarAcessoMotorista, async (req, res) => {
  try {
    const { id } = req.params;
    const { mes, ano } = req.query;
    
    let query = 'SELECT * FROM rendimentos WHERE motorista_id = $1';
    const values = [id];
    let paramCount = 2;
    
    // Filtrar por mês se fornecido
    if (mes) {
      query += ` AND mes = $${paramCount}`;
      values.push(parseInt(mes));
      paramCount++;
    }
    
    // Filtrar por ano se fornecido
    if (ano) {
      query += ` AND ano = $${paramCount}`;
      values.push(parseInt(ano));
      paramCount++;
    }
    
    query += ' ORDER BY ano DESC, mes DESC';
    
    const result = await db.query(query, values);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar rendimentos:', error);
    res.status(500).json({ message: 'Erro ao buscar rendimentos' });
  }
});

// Obter todos os rendimentos (apenas para administradores)
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { mes, ano } = req.query;
    
    let query = `
      SELECT r.*, m.nome as motorista_nome, m.documento as motorista_documento
      FROM rendimentos r
      JOIN motoristas m ON r.motorista_id = m.id
    `;
    
    const values = [];
    let paramCount = 1;
    
    // Adicionar condições WHERE se houver filtros
    if (mes || ano) {
      query += ' WHERE';
      
      // Filtrar por mês se fornecido
      if (mes) {
        query += ` r.mes = $${paramCount}`;
        values.push(parseInt(mes));
        paramCount++;
        
        // Adicionar AND se também houver filtro de ano
        if (ano) {
          query += ' AND';
        }
      }
      
      // Filtrar por ano se fornecido
      if (ano) {
        query += ` r.ano = $${paramCount}`;
        values.push(parseInt(ano));
        paramCount++;
      }
    }
    
    query += ' ORDER BY r.ano DESC, r.mes DESC, m.nome ASC';
    
    const result = await db.query(query, values);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar rendimentos:', error);
    res.status(500).json({ message: 'Erro ao buscar rendimentos' });
  }
});

// Upload de planilha Excel (apenas para administradores)
router.post('/upload', verificarToken, verificarAdmin, upload.single('planilha'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    // Ler a planilha Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).json({ message: 'Planilha vazia ou sem dados válidos' });
    }
    
    // Validar se a planilha tem as colunas necessárias
    const primeiraLinha = data[0];
    const colunas = Object.keys(primeiraLinha);
    
    const colunasNecessarias = ['documento', 'mes', 'ano', 'total_entregas', 'toneladas', 'valor_bruto', 'descontos'];
    
    for (const coluna of colunasNecessarias) {
      if (!colunas.some(c => c.toLowerCase().includes(coluna.toLowerCase()))) {
        return res.status(400).json({ message: `Coluna ${coluna} não encontrada na planilha` });
      }
    }
    
    // Obter o mês e ano da planilha (assumindo que são os mesmos para todos os registros)
    const mes = parseInt(primeiraLinha.mes) || parseInt(primeiraLinha.Mes) || parseInt(primeiraLinha.MES);
    const ano = parseInt(primeiraLinha.ano) || parseInt(primeiraLinha.Ano) || parseInt(primeiraLinha.ANO);
    
    if (!mes || !ano) {
      return res.status(400).json({ message: 'Mês ou ano não encontrados ou inválidos na planilha' });
    }
    
    // Processar os dados da planilha
    const resultados = {
      sucesso: 0,
      falhas: 0,
      motoristasCriados: 0,
      detalhes: []
    };
    
    for (const linha of data) {
      try {
        // Extrair dados da linha
        const documento = linha.documento || linha.Documento || linha.DOCUMENTO;
        const totalEntregas = parseInt(linha.total_entregas || linha.Total_Entregas || linha.TOTAL_ENTREGAS);
        const toneladas = parseFloat(linha.toneladas || linha.Toneladas || linha.TONELADAS);
        const valorBruto = parseFloat(linha.valor_bruto || linha.Valor_Bruto || linha.VALOR_BRUTO);
        const descontos = parseFloat(linha.descontos || linha.Descontos || linha.DESCONTOS);
        const valorLiquido = valorBruto - descontos;
        
        // Validar dados
        if (!documento || isNaN(totalEntregas) || isNaN(toneladas) || isNaN(valorBruto) || isNaN(descontos)) {
          resultados.falhas++;
          resultados.detalhes.push({
            documento,
            status: 'falha',
            mensagem: 'Dados inválidos ou incompletos'
          });
          continue;
        }
        
        // Verificar se o motorista existe
        let motoristaResult = await db.query('SELECT id FROM motoristas WHERE documento = $1', [documento]);
        
        // Se o motorista não existir, criar um novo
        if (motoristaResult.rows.length === 0) {
          // Gerar uma senha padrão (primeiros 6 caracteres do documento + últimos 2 dígitos do ano)
          const senhaDefault = `${documento.substring(0, 6)}${ano.toString().substring(2)}`;
          const salt = await bcrypt.genSalt(10);
          const senhaHash = await bcrypt.hash(senhaDefault, salt);
          
          motoristaResult = await db.query(
            'INSERT INTO motoristas (nome, documento, senha) VALUES ($1, $2, $3) RETURNING id',
            [`Motorista ${documento}`, documento, senhaHash]
          );
          
          resultados.motoristasCriados++;
        }
        
        const motoristaId = motoristaResult.rows[0].id;
        
        // Verificar se já existe rendimento para este motorista neste mês/ano
        const rendimentoExistente = await db.query(
          'SELECT id FROM rendimentos WHERE motorista_id = $1 AND mes = $2 AND ano = $3',
          [motoristaId, mes, ano]
        );
        
        if (rendimentoExistente.rows.length > 0) {
          // Atualizar rendimento existente
          await db.query(
            `UPDATE rendimentos 
             SET total_entregas = $1, toneladas = $2, valor_bruto = $3, descontos = $4, valor_liquido = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6`,
            [totalEntregas, toneladas, valorBruto, descontos, valorLiquido, rendimentoExistente.rows[0].id]
          );
        } else {
          // Inserir novo rendimento
          await db.query(
            `INSERT INTO rendimentos 
             (motorista_id, mes, ano, total_entregas, toneladas, valor_bruto, descontos, valor_liquido)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [motoristaId, mes, ano, totalEntregas, toneladas, valorBruto, descontos, valorLiquido]
          );
        }
        
        resultados.sucesso++;
        resultados.detalhes.push({
          documento,
          status: 'sucesso',
          mensagem: rendimentoExistente.rows.length > 0 ? 'Rendimento atualizado' : 'Rendimento inserido'
        });
      } catch (error) {
        console.error('Erro ao processar linha da planilha:', error);
        resultados.falhas++;
        resultados.detalhes.push({
          documento: linha.documento || 'Desconhecido',
          status: 'falha',
          mensagem: 'Erro ao processar: ' + error.message
        });
      }
    }
    
    res.json({
      message: 'Processamento da planilha concluído',
      mes,
      ano,
      resultados
    });
  } catch (error) {
    console.error('Erro ao processar planilha:', error);
    res.status(500).json({ message: 'Erro ao processar planilha' });
  }
});

module.exports = router;
