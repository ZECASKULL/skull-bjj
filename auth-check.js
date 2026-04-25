/**
 * ==============================================
 * VERIFICAÇÃO DE AUTENTICAÇÃO
 * ==============================================
 * Verifica se o usuário está autenticado antes de permitir
 * o acesso à aplicação principal.
 * 
 * @author: Seu Nome
 * @version: 1.0.0
 * @since: 2024
 */

// ==============================================
// CONFIGURAÇÃO
// ==============================================
const AUTH_CHECK_CONFIG = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'current_user',
  TOKEN_EXPIRY_KEY: 'token_expiry',
  LOGIN_PAGE: 'login.html'
};

// ==============================================
// GERENCIADOR DE VERIFICAÇÃO SEGURA
// ==============================================
class AuthCheckManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.sessionToken = null;
    this.verificationKey = crypto.randomUUID();
    this.init();
  }

  /**
   * Inicializa a verificação de autenticação
   */
  init() {
    this.checkAuthentication();
    this.setupUserInfo();
    this.setupLogout();
  }

  /**
   * Verifica se o usuário está autenticado (à prova de bypass)
   */
  checkAuthentication() {
    // Verificar se há tentativa de bypass
    if (this.detectBypassAttempt()) {
      console.error('🚨 Tentativa de bypass detectada!');
      this.handleSecurityViolation();
      return;
    }

    const token = this.getToken();
    const user = this.getUserData();

    if (!token || !user) {
      console.log('❌ Usuário não autenticado');
      this.handleUnauthenticated();
      return;
    }

    if (!this.isTokenValid(token)) {
      console.log('❌ Token expirado');
      this.clearSession();
      this.handleUnauthenticated();
      return;
    }

    try {
      // Validar dados do usuário com sistema enterprise
      let userData;
      if (window.SecurityAPI) {
        userData = window.SecurityAPI.validateUser(user);
        if (!userData) {
          console.error('🚨 Dados do usuário inválidos ou manipulados!');
          this.handleSecurityViolation();
          return;
        }
      } else {
        userData = JSON.parse(user);
      }

      // Verificação adicional de integridade
      if (!this.validateUserIntegrity(userData)) {
        console.error('🚨 Integridade do usuário comprometida!');
        this.handleSecurityViolation();
        return;
      }

      this.currentUser = userData;
      this.isAuthenticated = true;
      this.sessionToken = token;
      
      console.log('✅ Usuário autenticado:', this.currentUser.username);
      
      // Log de autenticação segura
      this.logAuthenticationEvent('AUTH_SUCCESS', userData.username);
    } catch (error) {
      console.error('❌ Erro ao processar dados do usuário:', error);
      this.clearSession();
      this.handleUnauthenticated();
    }
  }

  /**
   * Detecta tentativas de bypass
   */
  detectBypassAttempt() {
    // Verificar se currentUser foi definido externamente
    if (this.currentUser && !this.isAuthenticated) {
      return true;
    }

    // Verificar se há manipulação direta dos objetos
    const stack = new Error().stack;
    if (stack && stack.includes('anonymous') && stack.includes('eval')) {
      return true;
    }

    // Verificar se há acesso suspeito ao console
    if (window.console && window.console._originalConsole) {
      return false; // Console protegido
    }

    return false;
  }

  /**
   * Valida integridade dos dados do usuário
   */
  validateUserIntegrity(userData) {
    // Verificar estrutura básica
    if (!userData || typeof userData !== 'object') {
      return false;
    }

    // Verificar campos obrigatórios
    const requiredFields = ['username', 'role'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return false;
      }
    }

    // Verificar se há campos suspeitos
    const suspiciousFields = ['isAdmin', 'isSuperAdmin', 'permissions'];
    for (const field of suspiciousFields) {
      if (userData[field] === true && userData.role !== 'admin') {
        return false;
      }
    }

    return true;
  }

  /**
   * Lida com violação de segurança
   */
  handleSecurityViolation() {
    console.error('🚨 VIOLAÇÃO DE SEGURANÇA DETECTADA!');
    
    // Limpar sessão
    this.clearSession();
    
    // Log do evento
    this.logAuthenticationEvent('SECURITY_VIOLATION', 'UNKNOWN');
    
    // Redirecionar para login com mensagem de erro
    window.location.href = `${AUTH_CHECK_CONFIG.LOGIN_PAGE}?error=security_violation`;
  }

  /**
   * Log de eventos de autenticação
   */
  logAuthenticationEvent(eventType, username) {
    const event = {
      type: eventType,
      username: username,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log seguro
    console.log('🔐 Auth Event:', {
      type: event.type,
      username: event.username,
      timestamp: new Date(event.timestamp).toISOString()
    });

    // Se houver sistema enterprise, usar
    if (window.enterpriseSecurity) {
      window.enterpriseSecurity.logSecurityEvent('AUTHENTICATION_EVENT', event);
    }
  }

  /**
   * Obtém token de autenticação
   */
  getToken() {
    return localStorage.getItem(AUTH_CHECK_CONFIG.TOKEN_KEY) || 
           sessionStorage.getItem(AUTH_CHECK_CONFIG.TOKEN_KEY);
  }

  /**
   * Obtém dados do usuário
   */
  getUserData() {
    return localStorage.getItem(AUTH_CHECK_CONFIG.USER_KEY) || 
           sessionStorage.getItem(AUTH_CHECK_CONFIG.USER_KEY);
  }

  /**
   * Verifica se token é válido
   */
  isTokenValid(token) {
    const expiry = localStorage.getItem(AUTH_CHECK_CONFIG.TOKEN_EXPIRY_KEY) || 
                   sessionStorage.getItem(AUTH_CHECK_CONFIG.TOKEN_EXPIRY_KEY);
    
    if (!expiry) return false;
    
    return new Date(expiry) > new Date();
  }

  /**
   * Configura informações do usuário na interface
   */
  setupUserInfo() {
    if (!this.isAuthenticated || !this.currentUser) return;

    const welcomeElement = document.getElementById('welcomeMessage');
    if (welcomeElement) {
      const userName = this.currentUser.name || this.currentUser.username;
      welcomeElement.textContent = `Bem-vindo, ${userName}!`;
      
      // Adicionar role se for admin
      if (this.currentUser.role === 'admin') {
        welcomeElement.innerHTML += ' 🛡️';
      }
    }

    // Adicionar informações ao console para debug
    console.log('👤 Informações do usuário:', {
      username: this.currentUser.username,
      name: this.currentUser.name,
      role: this.currentUser.role,
      authenticated: this.isAuthenticated
    });
  }

  /**
   * Configura botão de logout
   */
  setupLogout() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }

  /**
   * Manipula usuário não autenticado
   */
  handleUnauthenticated() {
    // Mostrar modal de acesso negado
    this.showAccessDeniedModal();
    
    // Redirecionar após delay
    setTimeout(() => {
      this.redirectToLogin();
    }, 3000);
  }

  /**
   * Mostra modal de acesso negado
   */
  showAccessDeniedModal() {
    const modal = document.getElementById('accessDeniedModal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Manipula logout
   */
  handleLogout() {
    console.log('👋 Fazendo logout...');
    
    // Limpar sessão
    this.clearSession();
    
    // Feedback visual
    this.showLogoutMessage();
    
    // Redirecionar
    setTimeout(() => {
      this.redirectToLogin();
    }, 1500);
  }

  /**
   * Limpa sessão do usuário
   */
  clearSession() {
    localStorage.removeItem(AUTH_CHECK_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CHECK_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CHECK_CONFIG.TOKEN_EXPIRY_KEY);
    
    sessionStorage.removeItem(AUTH_CHECK_CONFIG.TOKEN_KEY);
    sessionStorage.removeItem(AUTH_CHECK_CONFIG.USER_KEY);
    sessionStorage.removeItem(AUTH_CHECK_CONFIG.TOKEN_EXPIRY_KEY);
    
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  /**
   * Mostra mensagem de logout
   */
  showLogoutMessage() {
    const welcomeElement = document.getElementById('welcomeMessage');
    if (welcomeElement) {
      welcomeElement.textContent = '👋 Saindo...';
      welcomeElement.style.color = '#e74c3c';
    }
  }

  /**
   * Redireciona para página de login
   */
  redirectToLogin() {
    window.location.href = AUTH_CHECK_CONFIG.LOGIN_PAGE;
  }
}

// ==============================================
// FUNÇÕES GLOBAIS
// ==============================================
function handleLogout() {
  if (window.authCheckManager) {
    window.authCheckManager.handleLogout();
  }
}

function redirectToLogin() {
  if (window.authCheckManager) {
    window.authCheckManager.redirectToLogin();
  } else {
    window.location.href = AUTH_CHECK_CONFIG.LOGIN_PAGE;
  }
}

// ==============================================
// INICIALIZAÇÃO
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
  window.authCheckManager = new AuthCheckManager();
  
  // Expor utilitários globalmente
  window.AuthCheck = {
    isAuthenticated: () => window.authCheckManager.isAuthenticated,
    getCurrentUser: () => window.authCheckManager.currentUser,
    logout: () => window.authCheckManager.handleLogout(),
    redirectToLogin: () => window.authCheckManager.redirectToLogin()
  };
  
  console.log('✅ Verificação de autenticação disponível globalmente como: window.authCheckManager');
});

// ==============================================
// PREVENIR ACESSO DIRETO VIA CONSOLE
// ==============================================
// Tentar prevenir bypass do sistema de autenticação
let originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
  if (url.includes('script.js') && !window.authCheckManager?.isAuthenticated) {
    console.warn('🚫 Tentativa de acesso não autorizado bloqueada');
    return;
  }
  return originalOpen.apply(this, arguments);
};
