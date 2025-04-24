const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar o token JWT
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar se o usuário é administrador
const verificarAdmin = (req, res, next) => {
  if (!req.usuario.is_admin) {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' });
  }
  next();
};

// Middleware para verificar se o usuário tem acesso aos dados do motorista
const verificarAcessoMotorista = (req, res, next) => {
  // Administradores têm acesso a todos os dados
  if (req.usuario.is_admin) {
    return next();
  }
  
  // Motoristas só podem acessar seus próprios dados
  const motoristaId = parseInt(req.params.id);
  if (req.usuario.id !== motoristaId) {
    return res.status(403).json({ message: 'Acesso negado. Você só pode acessar seus próprios dados.' });
  }
  
  next();
};

module.exports = {
  verificarToken,
  verificarAdmin,
  verificarAcessoMotorista
};
