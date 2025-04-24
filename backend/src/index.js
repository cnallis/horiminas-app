// Arquivo principal para iniciar o servidor
const app = require('./server');

// Iniciar o servidor na porta definida no render, o troço que deu erro.
const port = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Servidor HoriMinas rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
