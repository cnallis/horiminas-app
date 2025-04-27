if (!process.env.DB_NAME) {
  console.error('Variável de ambiente DB_NAME não configurada!');
  process.exit(1);
}

const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

// Teste de conexão
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.stack);
  } else {
    console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
    release();
  }
});

// Função para executar consultas SQL
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool
};
