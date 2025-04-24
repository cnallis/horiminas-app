// Arquivo principal para iniciar o servidor
const app = require('./server');

// Iniciar o servidor na porta definida no .env ou na porta 3000 por padrão
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor HoroMinas rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
