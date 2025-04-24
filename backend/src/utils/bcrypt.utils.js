const bcrypt = require('bcrypt');

// Função para verificar se o bcrypt está disponível
async function testBcrypt() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('test', salt);
    console.log('Bcrypt está funcionando corretamente');
    return true;
  } catch (error) {
    console.error('Erro ao testar bcrypt:', error);
    return false;
  }
}

module.exports = {
  testBcrypt
};
