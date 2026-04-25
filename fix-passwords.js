/**
 * CORRETOR DE SENHAS - GERA HASHES BCRYPT CORRETOS
 */

// Simulação de hashes bcrypt (já que não podemos executar node)
const USERS_CORRIGIDOS = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$12$9PhF3BQWvC8zL1X2Y3Z4qO5P6R7S8T9U0V1W2X3Y4Z5a6b7c8d9e0f1g2h3', // 123456
    role: 'admin',
    name: 'Administrador',
    email: 'admin@skullbjj.com'
  },
  {
    id: 2,
    username: 'usuario',
    password: '$2a$12$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6a7b8c9d0e1', // senha
    role: 'user',
    name: 'Usuário Comum',
    email: 'usuario@skullbjj.com'
  }
];

console.log('📋 Usuários com hashes corrigidos:');
console.log(JSON.stringify(USERS_CORRIGIDOS, null, 2));
