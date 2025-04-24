// Arquivo principal para iniciar o servidor
const app = require('./server');

// Iniciar o servidor na porta definida no render, o troço que deu erro.
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor HoriMinas rodando na porta ${port}`);
  
});
