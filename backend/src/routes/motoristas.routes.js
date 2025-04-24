const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Obter todos os motoristas (apenas para administradores)
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT id, nome, documento, is_admin, created_at, updated_at FROM motoristas ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error);
    res.status(500).json({ message: 'Erro ao buscar motoristas' });
  }
});

// Obter um motorista específico
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário é admin ou está acessando seus próprios dados
    if (!req.usuario.is_admin && req.usuario.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode acessar seus próprios dados.' });
    }
    
    const result = await db.query('SELECT id, nome, documento, is_admin, created_at, updated_at FROM motoristas WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar motorista:', error);
    res.status(500).json({ message: 'Erro ao buscar motorista' });
  }
});

// Criar um novo motorista (apenas para administradores)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { nome, documento, senha } = req.body;
    
    // Validar dados
    if (!nome || !documento || !senha) {
      return res.status(400).json({ message: 'Nome, documento e senha são obrigatórios' });
    }
    
    // Verificar se o documento já existe
    const checkDoc = await db.query('SELECT * FROM motoristas WHERE documento = $1', [documento]);
    if (checkDoc.rows.length > 0) {
      return res.status(400).json({ message: 'Documento já cadastrado' });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);
    
    // Inserir novo motorista
    const result = await db.query(
      'INSERT INTO motoristas (nome, documento, senha) VALUES ($1, $2, $3) RETURNING id, nome, documento, is_admin, created_at, updated_at',
      [nome, documento, senhaHash]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar motorista:', error);
    res.status(500).json({ message: 'Erro ao criar motorista' });
  }
});

// Atualizar um motorista (apenas para administradores)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, documento, senha } = req.body;
    
    // Verificar se o motorista existe
    const checkMotorista = await db.query('SELECT * FROM motoristas WHERE id = $1', [id]);
    if (checkMotorista.rows.length === 0) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }
    
    // Se estiver atualizando o documento, verificar se já existe
    if (documento && documento !== checkMotorista.rows[0].documento) {
      const checkDoc = await db.query('SELECT * FROM motoristas WHERE documento = $1 AND id != $2', [documento, id]);
      if (checkDoc.rows.length > 0) {
        return res.status(400).json({ message: 'Documento já cadastrado para outro motorista' });
      }
    }
    
    // Preparar dados para atualização
    let query = 'UPDATE motoristas SET ';
    const values = [];
    let paramCount = 1;
    
    if (nome) {
      query += `nome = $${paramCount}, `;
      values.push(nome);
      paramCount++;
    }
    
    if (documento) {
      query += `documento = $${paramCount}, `;
      values.push(documento);
      paramCount++;
    }
    
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);
      query += `senha = $${paramCount}, `;
      values.push(senhaHash);
      paramCount++;
    }
    
    query += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, nome, documento, is_admin, created_at, updated_at`;
    values.push(id);
    
    // Executar atualização
    const result = await db.query(query, values);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar motorista:', error);
    res.status(500).json({ message: 'Erro ao atualizar motorista' });
  }
});

// Excluir um motorista (apenas para administradores)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o motorista existe
    const checkMotorista = await db.query('SELECT * FROM motoristas WHERE id = $1', [id]);
    if (checkMotorista.rows.length === 0) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }
    
    // Não permitir excluir o próprio administrador
    if (checkMotorista.rows[0].is_admin && checkMotorista.rows[0].id === req.usuario.id) {
      return res.status(400).json({ message: 'Não é possível excluir o próprio usuário administrador' });
    }
    
    // Excluir motorista
    await db.query('DELETE FROM motoristas WHERE id = $1', [id]);
    
    res.json({ message: 'Motorista excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir motorista:', error);
    res.status(500).json({ message: 'Erro ao excluir motorista' });
  }
});

module.exports = router;
