/**
 * ==============================================
 * MÓDULO DE SEGURANÇA AVANÇADO
 * ==============================================
 * Sistema de segurança rigoroso para proteção contra
 * ataques comuns e vulnerabilidades web.
 * 
 * @author: SKULL BJJ Security Team
 * @version: 2.0.0
 * @since: 2024
 */

// ==============================================
// CONFIGURAÇÃO DE SEGURANÇA
// ==============================================
const SECURITY_CONFIG = {
  // Headers de segurança
  HEADERS: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  },
  
  // Rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60000, // 1 minuto
    BLOCK_DURATION: 300000 // 5 minutos
  },
  
  // Sanitização
  SANITIZATION: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTRIBUTES: ['class', 'id'],
    MAX_LENGTH: {
      name: 100,
      email: 254,
      phone: 20,
      message: 1000
    }
  },
  
  // Criptografia
  CRYPTO: {
    ALGORITHM: 'SHA-256',
    SALT_LENGTH: 32,
    ITERATIONS: 100000
  }
};

// ==============================================
// GERENCIADOR DE SEGURANÇA
// ==============================================
class SecurityManager {
  constructor() {
    this.rateLimitMap = new Map();
    this.blockedIPs = new Map();
    this.csrfTokens = new Map();
    this.sanitizer = new InputSanitizer();
    this.cryptographer = new Cryptographer();
    this.init();
  }

  /**
   * Inicializa o sistema de segurança
   */
  init() {
    this.setupSecurityHeaders();
    this.setupCSRFProtection();
    this.setupRateLimiting();
    this.setupInputValidation();
    this.setupXSSProtection();
    this.setupConsoleProtection();
    console.log('🛡️ Sistema de segurança avançado inicializado');
  }

  /**
   * Configura headers de segurança
   */
  setupSecurityHeaders() {
    // Em ambiente real, estes headers seriam configurados no servidor
    // Aqui simulamos para demonstração
    if (typeof document !== 'undefined') {
      const metaCSP = document.createElement('meta');
      metaCSP.httpEquiv = 'Content-Security-Policy';
      metaCSP.content = SECURITY_CONFIG.HEADERS['Content-Security-Policy'];
      document.head.appendChild(metaCSP);
    }
  }

  /**
   * Configura proteção CSRF
   */
  setupCSRFProtection() {
    this.generateCSRFToken();
    this.validateCSRFToken();
  }

  /**
   * Gera token CSRF
   */
  generateCSRFToken() {
    const token = this.cryptographer.generateSecureToken();
    this.csrfTokens.set(token, {
      created: Date.now(),
      used: false
    });
    
    // Armazenar token seguro
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('csrf_token', token);
    }
    
    return token;
  }

  /**
   * Valida token CSRF
   */
  validateCSRFToken(token) {
    const tokenData = this.csrfTokens.get(token);
    if (!tokenData || tokenData.used) {
      return false;
    }
    
    // Token expira após 1 hora
    if (Date.now() - tokenData.created > 3600000) {
      this.csrfTokens.delete(token);
      return false;
    }
    
    tokenData.used = true;
    return true;
  }

  /**
   * Configura rate limiting
   */
  setupRateLimiting() {
    // Monitorar requisições
    this.trackRequests();
  }

  /**
   * Rastreia requisições para rate limiting
   */
  trackRequests() {
    const clientIP = this.getClientIP();
    const now = Date.now();
    
    if (!this.rateLimitMap.has(clientIP)) {
      this.rateLimitMap.set(clientIP, []);
    }
    
    const requests = this.rateLimitMap.get(clientIP);
    
    // Limpar requisições antigas
    const validRequests = requests.filter(timestamp => 
      now - timestamp < SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS
    );
    
    validRequests.push(now);
    this.rateLimitMap.set(clientIP, validRequests);
    
    // Verificar se excedeu o limite
    if (validRequests.length > SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
      this.blockIP(clientIP);
      throw new Error('Rate limit exceeded');
    }
  }

  /**
   * Bloqueia IP por excesso de requisições
   */
  blockIP(ip) {
    this.blockedIPs.set(ip, {
      blocked: true,
      until: Date.now() + SECURITY_CONFIG.RATE_LIMIT.BLOCK_DURATION
    });
    
    console.warn(`🚫 IP ${ip} bloqueado por rate limiting`);
  }

  /**
   * Obtém IP do cliente (simulado)
   */
  getClientIP() {
    // Em ambiente real, obter do header X-Forwarded-For ou similar
    return 'client_' + Math.random().toString(36).substring(2);
  }

  /**
   * Configura validação de entrada
   */
  setupInputValidation() {
    this.setupFormValidation();
    this.setupURLValidation();
  }

  /**
   * Configura validação de formulários
   */
  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
          return false;
        }
      });
    });
  }

  /**
   * Valida formulário
   */
  validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateInput(input)) {
        isValid = false;
        this.showInputError(input, 'Entrada inválida');
      } else {
        this.clearInputError(input);
      }
    });
    
    return isValid;
  }

  /**
   * Valida entrada individual
   */
  validateInput(input) {
    const value = input.value.trim();
    const type = input.type || input.tagName.toLowerCase();
    
    // Sanitizar entrada
    const sanitized = this.sanitizer.sanitize(value);
    input.value = sanitized;
    
    // Validações específicas
    switch (type) {
      case 'email':
        return this.validateEmail(sanitized);
      case 'tel':
        return this.validatePhone(sanitized);
      case 'number':
        return this.validateNumber(sanitized);
      default:
        return this.validateText(sanitized, input.name);
    }
  }

  /**
   * Valida email
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= SECURITY_CONFIG.SANITIZATION.MAX_LENGTH.email;
  }

  /**
   * Valida telefone
   */
  validatePhone(phone) {
    const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Valida número
   */
  validateNumber(num) {
    return !isNaN(num) && num >= 0;
  }

  /**
   * Valida texto
   */
  validateText(text, fieldName) {
    const maxLength = SECURITY_CONFIG.SANITIZATION.MAX_LENGTH[fieldName] || 255;
    return text.length <= maxLength && !this.containsMaliciousContent(text);
  }

  /**
   * Verifica conteúdo malicioso
   */
  containsMaliciousContent(text) {
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\(/i,
      /alert\(/i,
      /document\.cookie/i
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Configura proteção XSS
   */
  setupXSSProtection() {
    this.escapeHTML();
    this.preventProtocolInjection();
  }

  /**
   * Escapa HTML para prevenir XSS
   */
  escapeHTML() {
    const escapeHTML = (str) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };
    
    // Sobrescrever métodos perigosos
    if (typeof window !== 'undefined') {
      const originalAlert = window.alert;
      window.alert = (message) => {
        if (typeof message === 'string') {
          message = escapeHTML(message);
        }
        originalAlert.call(window, message);
      };
    }
  }

  /**
   * Previne injeção de protocolo
   */
  preventProtocolInjection() {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.includes('javascript:') || href.includes('data:'))) {
        link.setAttribute('href', '#');
        console.warn('🚡 Tentativa de injeção de protocolo bloqueada');
      }
    });
  }

  /**
   * Configura proteção do console
   */
  setupConsoleProtection() {
    // Prevenir acesso a informações sensíveis via console
    const originalConsole = console;
    
    console = new Proxy(originalConsole, {
      get(target, prop) {
        const value = target[prop];
        
        // Bloquear métodos que podem expor informações sensíveis
        const sensitiveMethods = ['log', 'dir', 'table'];
        if (sensitiveMethods.includes(prop) && typeof value === 'function') {
          return function(...args) {
            const filteredArgs = args.map(arg => {
              if (typeof arg === 'object' && arg !== null) {
                // Remover propriedades sensíveis
                const sanitized = {...arg};
                delete sanitized.password;
                delete sanitized.token;
                delete sanitized.csrf_token;
                return sanitized;
              }
              return arg;
            });
            return value.apply(target, filteredArgs);
          };
        }
        
        return value;
      }
    });
  }

  /**
   * Mostra erro de entrada
   */
  showInputError(input, message) {
    input.classList.add('security-error');
    
    let errorElement = input.parentNode.querySelector('.security-error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'security-error-message';
      errorElement.style.color = '#e74c3c';
      errorElement.style.fontSize = '0.875rem';
      errorElement.style.marginTop = '0.25rem';
      input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
  }

  /**
   * Limpa erro de entrada
   */
  clearInputError(input) {
    input.classList.remove('security-error');
    const errorElement = input.parentNode.querySelector('.security-error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Verifica se IP está bloqueado
   */
  isIPBlocked(ip) {
    const blockData = this.blockedIPs.get(ip);
    if (!blockData) return false;
    
    if (Date.now() > blockData.until) {
      this.blockedIPs.delete(ip);
      return false;
    }
    
    return true;
  }

  /**
   * Obtém estatísticas de segurança
   */
  getSecurityStats() {
    return {
      blockedIPs: this.blockedIPs.size,
      rateLimitEntries: this.rateLimitMap.size,
      csrfTokens: this.csrfTokens.size,
      timestamp: new Date().toISOString()
    };
  }
}

// ==============================================
// SANITIZADOR DE ENTRADA
// ==============================================
class InputSanitizer {
  constructor() {
    this.allowedTags = new Set(SECURITY_CONFIG.SANITIZATION.ALLOWED_TAGS);
    this.allowedAttributes = new Set(SECURITY_CONFIG.SANITIZATION.ALLOWED_ATTRIBUTES);
  }

  /**
   * Sanitiza entrada de texto
   */
  sanitize(text) {
    if (typeof text !== 'string') {
      return '';
    }
    
    // Remover tags HTML não permitidas
    text = this.stripHTML(text);
    
    // Remover caracteres perigosos
    text = this.removeDangerousChars(text);
    
    // Limitar comprimento
    text = this.truncate(text, 1000);
    
    return text.trim();
  }

  /**
   * Remove tags HTML não permitidas
   */
  stripHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Remove caracteres perigosos
   */
  removeDangerousChars(text) {
    return text
      .replace(/[\x00-\x1F\x7F]/g, '') // Caracteres de controle
      .replace(/[<>]/g, '') // Tags HTML
      .replace(/javascript:/gi, '') // Protocolos perigosos
      .replace(/on\w+\s*=/gi, ''); // Event handlers
  }

  /**
   * Trunca texto para comprimento máximo
   */
  truncate(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) : text;
  }
}

// ==============================================
// CRIPTOGRAFIA
// ==============================================
class Cryptographer {
  constructor() {
    this.algorithm = SECURITY_CONFIG.CRYPTO.ALGORITHM;
  }

  /**
   * Gera token seguro
   */
  generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Gera hash de senha
   */
  async hashPassword(password, salt = null) {
    if (!salt) {
      salt = this.generateSalt();
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    
    const hashBuffer = await crypto.subtle.digest(this.algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return {
      hash: hashHex,
      salt: salt
    };
  }

  /**
   * Gera salt
   */
  generateSalt() {
    const array = new Uint8Array(SECURITY_CONFIG.CRYPTO.SALT_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifica senha
   */
  async verifyPassword(password, hashedPassword, salt) {
    const { hash } = await this.hashPassword(password, salt);
    return hash === hashedPassword;
  }
}

// ==============================================
// INICIALIZAÇÃO
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
  window.securityManager = new SecurityManager();
  
  // Expor utilitários de segurança globalmente
  window.SecurityUtils = {
    sanitize: (text) => window.securityManager.sanitizer.sanitize(text),
    validateEmail: (email) => window.securityManager.validateEmail(email),
    validatePhone: (phone) => window.securityManager.validatePhone(phone),
    getSecurityStats: () => window.securityManager.getSecurityStats(),
    generateCSRFToken: () => window.securityManager.generateCSRFToken()
  };
  
  console.log('✅ Sistema de segurança avançado disponível globalmente');
});

// ==============================================
// ESTILOS CSS DE SEGURANÇA
// ==============================================
const securityStyles = document.createElement('style');
securityStyles.textContent = `
  .security-error {
    border-color: #e74c3c !important;
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
  }
  
  .security-error-message {
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    font-weight: 500;
  }
  
  .security-blocked {
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #f5c6cb;
    margin: 1rem 0;
  }
`;
document.head.appendChild(securityStyles);
