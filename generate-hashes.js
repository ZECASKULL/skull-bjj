/**
 * GERADOR DE HASHES BCRYPT PARA USUÁRIOS
 * Este script gera os hashes corretos para as senhas
 */

const bcrypt = require('bcryptjs');

async function generateHashes() {
  console.log('🔐 Gerando hashes bcrypt...');
  
  const BCRYPT_ROUNDS = 12;
  
  // Gerar hash para senha "123456"
  const hash123456 = await bcrypt.hash('123456', BCRYPT_ROUNDS);
  console.log('Hash para "123456":', hash123456);
  
  // Gerar hash para senha "senha"
  const hashSenha = await bcrypt.hash('senha', BCRYPT_ROUNDS);
  console.log('Hash para "senha":', hashSenha);
  
  // Verificar hashes
  const isValid123456 = await bcrypt.compare('123456', hash123456);
  const isValidSenha = await bcrypt.compare('senha', hashSenha);
  
  console.log('\n✅ Verificação:');
  console.log('123456 válido:', isValid123456);
  console.log('senha válida:', isValidSenha);
  
  // Exibir configuração para copiar/colar
  console.log('\n📋 Configuração para server.js:');
  console.log('const USERS = [');
  console.log('  {');
  console.log('    id: 1,');
  console.log('    username: "admin",');
  console.log(`    password: '${hash123456}', // 123456`);
  console.log('    role: "admin",');
  console.log('    name: "Administrador"');
  console.log('  },');
  console.log('  {');
  console.log('    id: 2,');
  console.log('    username: "usuario",');
  console.log(`    password: '${hashSenha}', // senha`);
  console.log('    role: "user",');
  console.log('    name: "Usuário Comum"');
  console.log('  }');
  console.log('];');
}

generateHashes().catch(console.error);
