const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { documento, senha } = req.body;
    
    // Validar dados
    if (!documento || !senha) {
      return res.status(400).json({ message: 'Documento e senha são obrigatórios' });
    }
    
    // Buscar usuário pelo documento
    const result = await db.query('SELECT * FROM motoristas WHERE documento = $1', [documento]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const usuario = result.rows[0];
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    console.log('Login recebido:', { documento, senha });
    console.log('Usuário do banco:', usuario);
    console.log('Senha do banco (hash):', usuario.senha);
    console.log('Senha válida?', senhaValida);


    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        documento: usuario.documento, 
        is_admin: usuario.is_admin 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Retornar dados do usuário e token
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      documento: usuario.documento,
      is_admin: usuario.is_admin,
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor durante o login' });
  }
});

// Rota para verificar token
router.get('/verificar', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, usuario: decoded });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

// Rota para alterar senha
router.post('/alterar-senha', async (req, res) => {
  try {
    const { documento, senhaAtual, novaSenha } = req.body;
    
    // Validar dados
    if (!documento || !senhaAtual || !novaSenha) {
      return res.status(400).json({ message: 'Documento, senha atual e nova senha são obrigatórios' });
    }
    
    // Buscar usuário pelo documento
    const result = await db.query('SELECT * FROM motoristas WHERE documento = $1', [documento]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    const usuario = result.rows[0];
    
    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }
    
    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(novaSenha, salt);
    
    // Atualizar senha
    await db.query('UPDATE motoristas SET senha = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [senhaHash, usuario.id]);
    
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro no servidor ao alterar senha' });
  }
});

module.exports = router;
