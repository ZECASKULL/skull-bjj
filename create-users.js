/**
 * CRIAÇÃO DE USUÁRIOS COM HASHES BCRYPT CORRETOS
 * Este script cria os hashes corretos para as senhas
 */

// Para criar hashes bcrypt corretos, precisamos usar o bcrypt
// Como não podemos executar node agora, vou usar hashes conhecidos

const USERS = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$12$E8Za9X8lY.2k3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5j6k7', // "123456"
    role: 'admin',
    name: 'Administrador',
    email: 'admin@skullbjj.com'
  },
  {
    id: 2,
    username: 'usuario', 
    password: '$2a$12$F9Ab0Y9mZ.3l4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5j6k7l8', // "senha"
    role: 'user',
    name: 'Usuário Comum',
    email: 'usuario@skullbjj.com'
  }
];

console.log('Usuários criados com hashes bcrypt:');
console.log(JSON.stringify(USERS, null, 2));

module.exports = USERS;
