const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const motoristasRoutes = require('./routes/motoristas.routes');
const rendimentosRoutes = require('./routes/rendimentos.routes');

// Carrega as variáveis de ambiente
dotenv.config();

// Inicializa o aplicativo Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Middleware para processar dados de formulário
app.use(express.urlencoded({ extended: true }));

// Configuração do CORS para permitir requisições do frontend
const allowedOrigins = ['https://cnallis.github.io'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/motoristas', motoristasRoutes);
app.use('/api/rendimentos', rendimentosRoutes);

// Rota raiz para verificar se a API está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API da Horiminas!' });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Ocorreu um erro no servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;
