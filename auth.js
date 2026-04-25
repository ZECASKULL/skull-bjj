/**
 * ==============================================
 * SISTEMA DE AUTENTICAÇÃO
 * ==============================================
 * Sistema de login e sessão para a aplicação Botão Muda Cor.
 * Implementa autenticação básica com armazenamento local.
 * 
 * @author: Seu Nome
 * @version: 1.0.0
 * @since: 2024
 */

// ==============================================
// CONFIGURAÇÃO DE AUTENTICAÇÃO SEGURA
// ==============================================
const AUTH_CONFIG = {
  // Usuários cadastrados com senhas hasheadas
  USERS: [
    { 
      username: 'admin', 
      passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // 'password'
      salt: 's1a2lt3e4d5',
      role: 'admin', 
      name: 'Administrador' 
    },
    { 
      username: 'usuario', 
      passwordHash: 'ef92b778ba7a6c8f218f0250ba221e1775874e9f552c57b8f43bd6a8e523c83e', // 'senha123'
      salt: 'u1s2u3a4r5i6o',
      role: 'user', 
      name: 'Usuário Comum' 
    }
  ],
  
  // Configurações de sessão segura
  SESSION: {
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'current_user',
    EXPIRY_HOURS: 24,
    REMEMBER_DAYS: 7,
    SECURE_STORAGE: true
  },
  
  // Configurações de segurança reforçadas
  SECURITY: {
    MAX_ATTEMPTS: 3,
    LOCKOUT_MINUTES: 15, // Aumentado para 15 minutos
    MIN_PASSWORD_LENGTH: 8, // Aumentado para 8 caracteres
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
    SESSION_TIMEOUT: 1800000, // 30 minutos
    CSRF_PROTECTION: true
  }
};

// ==============================================
// ESTADO DA APLICAÇÃO
// ==============================================
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.loginAttempts = 0;
    this.isLocked = false;
    this.lockoutEndTime = null;
    this.elements = {};
    this.init();
  }

  /**
   * Inicializa o sistema de autenticação
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.checkExistingSession();
    this.checkLockoutStatus();
    console.log('🔐 Sistema de autenticação inicializado');
  }

  /**
   * Cache dos elementos DOM
   */
  cacheElements() {
    this.elements = {
      form: document.getElementById('loginForm'),
      usernameInput: document.getElementById('username'),
      passwordInput: document.getElementById('password'),
      loginButton: document.getElementById('loginButton'),
      togglePassword: document.getElementById('togglePassword'),
      rememberCheckbox: document.getElementById('remember'),
      usernameError: document.getElementById('username-error'),
      passwordError: document.getElementById('password-error'),
      loginError: document.getElementById('login-error'),
      credentialsInfo: document.getElementById('credentialsInfo')
    };
  }

  /**
   * Configura os event listeners
   */
  bindEvents() {
    if (this.elements.form) {
      this.elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    if (this.elements.togglePassword) {
      this.elements.togglePassword.addEventListener('click', () => {
        this.togglePasswordVisibility();
      });
    }

    // Validação em tempo real
    if (this.elements.usernameInput) {
      this.elements.usernameInput.addEventListener('input', () => {
        this.clearFieldError('username');
        this.clearLoginError();
      });
    }

    if (this.elements.passwordInput) {
      this.elements.passwordInput.addEventListener('input', () => {
        this.clearFieldError('password');
        this.clearLoginError();
      });
    }

    // Limpar erros ao focar
    ['usernameInput', 'passwordInput'].forEach(field => {
      if (this.elements[field]) {
        this.elements[field].addEventListener('focus', () => {
          this.clearFieldError(field.replace('Input', ''));
          this.clearLoginError();
        });
      }
    });
  }

  /**
   * Verifica se existe uma sessão ativa
   */
  checkExistingSession() {
    const token = localStorage.getItem(AUTH_CONFIG.SESSION.TOKEN_KEY);
    const user = localStorage.getItem(AUTH_CONFIG.SESSION.USER_KEY);
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (this.isTokenValid(token)) {
          this.currentUser = userData;
          console.log('✅ Sessão restaurada:', userData.username);
          this.redirectToApp();
        } else {
          this.clearSession();
        }
      } catch (error) {
        console.error('❌ Erro ao restaurar sessão:', error);
        this.clearSession();
      }
    }
  }

  /**
   * Verifica status de bloqueio
   */
  checkLockoutStatus() {
    const lockoutEnd = localStorage.getItem('auth_lockout_end');
    if (lockoutEnd) {
      const endTime = new Date(lockoutEnd);
      if (endTime > new Date()) {
        this.isLocked = true;
        this.lockoutEndTime = endTime;
        this.showLockoutMessage();
        this.disableLoginForm();
      } else {
        localStorage.removeItem('auth_lockout_end');
        localStorage.removeItem('auth_attempts');
        this.loginAttempts = 0;
      }
    }
  }

  /**
   * Manipula o processo de login com segurança
   */
  async handleLogin() {
    if (this.isLocked) {
      this.showLockoutMessage();
      return;
    }

    const username = this.elements.usernameInput.value.trim();
    const password = this.elements.passwordInput.value;
    const remember = this.elements.rememberCheckbox.checked;

    // Validação básica
    if (!this.validateForm(username, password)) {
      return;
    }

    // Estado de carregamento
    this.setLoadingState(true);
    this.clearLoginError();

    // Verificar rate limiting
    if (window.securityManager && window.securityManager.isIPBlocked(this.getClientIP())) {
      this.showLoginError('Seu IP foi temporariamente bloqueado por segurança');
      this.setLoadingState(false);
      return;
    }

    // Simular delay de rede
    await this.delay(1000);

    // Autenticação segura
    const result = await this.authenticate(username, password);

    if (result.success) {
      this.handleSuccessfulLogin(result.user, remember);
    } else {
      this.handleFailedLogin(result.error);
    }

    this.setLoadingState(false);
  }

  /**
   * Obtém IP do cliente (simulado)
   */
  getClientIP() {
    if (window.securityManager) {
      return window.securityManager.getClientIP();
    }
    return 'client_' + Math.random().toString(36).substring(2);
  }

  /**
   * Valida o formulário
   */
  validateForm(username, password) {
    let isValid = true;

    // Validação de usuário
    if (!username) {
      this.showFieldError('username', 'O campo usuário é obrigatório');
      isValid = false;
    } else if (username.length < 3) {
      this.showFieldError('username', 'O usuário deve ter pelo menos 3 caracteres');
      isValid = false;
    }

    // Validação de senha
    if (!password) {
      this.showFieldError('password', 'O campo senha é obrigatório');
      isValid = false;
    } else if (password.length < AUTH_CONFIG.SECURITY.MIN_PASSWORD_LENGTH) {
      this.showFieldError('password', `A senha deve ter pelo menos ${AUTH_CONFIG.SECURITY.MIN_PASSWORD_LENGTH} caracteres`);
      isValid = false;
    }

    return isValid;
  }

  /**
   * Autentica o usuário com segurança
   */
  async authenticate(username, password) {
    // Sanitizar entrada
    if (window.securityManager) {
      username = window.securityManager.sanitizer.sanitize(username);
      password = window.securityManager.sanitizer.sanitize(password);
    }
    
    // Procurar usuário nos usuários padrão
    let user = AUTH_CONFIG.USERS.find(u => u.username === username);
    
    // Se não encontrar, procurar nos usuários registrados
    if (!user) {
      const registeredUsers = this.getRegisteredUsers();
      user = registeredUsers.find(u => u.username === username);
    }
    
    if (!user) {
      return { success: false, error: 'Usuário ou senha incorretos' };
    }
    
    // Verificar senha usando hash
    const isPasswordValid = await this.verifyPassword(password, user.passwordHash, user.salt);
    
    if (isPasswordValid) {
      return { success: true, user };
    }
    
    return { success: false, error: 'Usuário ou senha incorretos' };
  }

  /**
   * Obtém usuários registrados
   */
  getRegisteredUsers() {
    const usersJson = localStorage.getItem('registered_users');
    return usersJson ? JSON.parse(usersJson) : [];
  }

  /**
   * Verifica senha usando hash
   */
  async verifyPassword(password, hashedPassword, salt) {
    if (window.securityManager && window.securityManager.cryptographer) {
      return await window.securityManager.cryptographer.verifyPassword(password, hashedPassword, salt);
    }
    
    // Fallback para verificação simples (não recomendado para produção)
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex === hashedPassword;
  }

  /**
   * Manipula login bem-sucedido
   */
  handleSuccessfulLogin(user, remember) {
    // Resetar tentativas
    this.loginAttempts = 0;
    localStorage.removeItem('auth_attempts');
    localStorage.removeItem('auth_lockout_end');

    // Criar sessão
    const token = this.generateToken();
    const expiryTime = remember ? 
      new Date(Date.now() + AUTH_CONFIG.SESSION.REMEMBER_DAYS * 24 * 60 * 60 * 1000) :
      new Date(Date.now() + AUTH_CONFIG.SESSION.EXPIRY_HOURS * 60 * 60 * 1000);

    // Armazenar sessão
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_CONFIG.SESSION.TOKEN_KEY, token);
    storage.setItem(AUTH_CONFIG.SESSION.USER_KEY, JSON.stringify(user));
    storage.setItem('token_expiry', expiryTime.toISOString());

    this.currentUser = user;
    console.log('✅ Login realizado:', user.username);

    // Feedback visual
    this.showSuccessMessage();
    
    // Redirecionar
    setTimeout(() => {
      this.redirectToApp();
    }, 1500);
  }

  /**
   * Manipula login falhado
   */
  handleFailedLogin(error) {
    this.loginAttempts++;
    
    // Verificar bloqueio
    if (this.loginAttempts >= AUTH_CONFIG.SECURITY.MAX_ATTEMPTS) {
      this.lockAccount();
    } else {
      localStorage.setItem('auth_attempts', this.loginAttempts);
      const remaining = AUTH_CONFIG.SECURITY.MAX_ATTEMPTS - this.loginAttempts;
      this.showLoginError(`${error}. ${remaining} tentativa(s) restante(s)`);
    }

    // Efeito visual de erro
    this.shakeForm();
  }

  /**
   * Bloqueia a conta
   */
  lockAccount() {
    this.isLocked = true;
    this.lockoutEndTime = new Date(Date.now() + AUTH_CONFIG.SECURITY.LOCKOUT_MINUTES * 60 * 1000);
    
    localStorage.setItem('auth_lockout_end', this.lockoutEndTime.toISOString());
    
    this.showLockoutMessage();
    this.disableLoginForm();
    
    console.log('🔒 Conta bloqueada temporariamente');
  }

  /**
   * Mostra mensagem de bloqueio
   */
  showLockoutMessage() {
    const remainingMinutes = Math.ceil((this.lockoutEndTime - new Date()) / (1000 * 60));
    this.showLoginError(`Conta bloqueada. Tente novamente em ${remainingMinutes} minuto(s)`);
  }

  /**
   * Desabilita formulário de login
   */
  disableLoginForm() {
    if (this.elements.loginButton) {
      this.elements.loginButton.disabled = true;
    }
    if (this.elements.usernameInput) {
      this.elements.usernameInput.disabled = true;
    }
    if (this.elements.passwordInput) {
      this.elements.passwordInput.disabled = true;
    }
  }

  /**
   * Habilita formulário de login
   */
  enableLoginForm() {
    if (this.elements.loginButton) {
      this.elements.loginButton.disabled = false;
    }
    if (this.elements.usernameInput) {
      this.elements.usernameInput.disabled = false;
    }
    if (this.elements.passwordInput) {
      this.elements.passwordInput.disabled = false;
    }
  }

  /**
   * Mostra erro de campo específico
   */
  showFieldError(field, message) {
    const errorElement = this.elements[`${field}Error`];
    const inputElement = this.elements[`${field}Input`];
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
    
    if (inputElement) {
      inputElement.classList.add('error');
      inputElement.setAttribute('aria-invalid', 'true');
    }
  }

  /**
   * Limpa erro de campo
   */
  clearFieldError(field) {
    const errorElement = this.elements[`${field}Error`];
    const inputElement = this.elements[`${field}Input`];
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
    
    if (inputElement) {
      inputElement.classList.remove('error');
      inputElement.setAttribute('aria-invalid', 'false');
    }
  }

  /**
   * Mostra erro de login geral
   */
  showLoginError(message) {
    if (this.elements.loginError) {
      this.elements.loginError.textContent = message;
      this.elements.loginError.classList.add('show');
    }
  }

  /**
   * Limpa erro de login
   */
  clearLoginError() {
    if (this.elements.loginError) {
      this.elements.loginError.textContent = '';
      this.elements.loginError.classList.remove('show');
    }
  }

  /**
   * Mostra mensagem de sucesso
   */
  showSuccessMessage() {
    if (this.elements.loginError) {
      this.elements.loginError.textContent = '✅ Login realizado com sucesso!';
      this.elements.loginError.style.background = '#d4edda';
      this.elements.loginError.style.borderColor = '#28a745';
      this.elements.loginError.style.color = '#155724';
      this.elements.loginError.classList.add('show');
    }
  }

  /**
   * Alterna visibilidade da senha
   */
  togglePasswordVisibility() {
    const input = this.elements.passwordInput;
    const button = this.elements.togglePassword;
    
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = '🙈';
      button.setAttribute('aria-label', 'Ocultar senha');
    } else {
      input.type = 'password';
      button.textContent = '👁️';
      button.setAttribute('aria-label', 'Mostrar senha');
    }
  }

  /**
   * Define estado de carregamento
   */
  setLoadingState(isLoading) {
    const button = this.elements.loginButton;
    const buttonText = button.querySelector('.button-text');
    const loadingIcon = button.querySelector('.button-loading');
    
    if (isLoading) {
      button.disabled = true;
      buttonText.style.display = 'none';
      loadingIcon.style.display = 'inline';
    } else {
      button.disabled = false;
      buttonText.style.display = 'inline';
      loadingIcon.style.display = 'none';
    }
  }

  /**
   * Efeito de shake no formulário
   */
  shakeForm() {
    const form = this.elements.form;
    form.style.animation = 'shake 0.5s';
    setTimeout(() => {
      form.style.animation = '';
    }, 500);
  }

  /**
   * Gera token de sessão
   */
  generateToken() {
    return btoa(Date.now() + Math.random().toString(36).substring(2));
  }

  /**
   * Verifica se token é válido
   */
  isTokenValid(token) {
    const expiry = localStorage.getItem('token_expiry');
    if (!expiry) return false;
    
    return new Date(expiry) > new Date();
  }

  /**
   * Limpa sessão
   */
  clearSession() {
    localStorage.removeItem(AUTH_CONFIG.SESSION.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.SESSION.USER_KEY);
    localStorage.removeItem('token_expiry');
    sessionStorage.removeItem(AUTH_CONFIG.SESSION.TOKEN_KEY);
    sessionStorage.removeItem(AUTH_CONFIG.SESSION.USER_KEY);
    sessionStorage.removeItem('token_expiry');
  }

  /**
   * Redireciona para aplicação principal
   */
  redirectToApp() {
    window.location.href = 'index.html';
  }

  /**
   * Delay utilitário
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ==============================================
// FUNÇÕES GLOBAIS
// ==============================================
function showCredentials() {
  const modal = document.getElementById('credentialsInfo');
  if (modal) {
    modal.style.display = 'block';
  }
}

function hideCredentials() {
  const modal = document.getElementById('credentialsInfo');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Adicionar animação shake ao CSS
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);

// ==============================================
// INICIALIZAÇÃO
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
  console.log('✅ Sistema de autenticação disponível globalmente como: window.authManager');
});

// ==============================================
// EXPORT PARA DEBUG
// ==============================================
window.AuthUtils = {
  clearSession: () => window.authManager.clearSession(),
  getCurrentUser: () => window.authManager.currentUser,
  checkAuth: () => !!window.authManager.currentUser,
  lockoutStatus: () => ({
    isLocked: window.authManager.isLocked,
    endTime: window.authManager.lockoutEndTime,
    attempts: window.authManager.loginAttempts
  })
};
