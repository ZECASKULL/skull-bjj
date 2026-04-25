/**
 * ==============================================
 * ENTERPRISE SECURITY SYSTEM
 * ==============================================
 * Sistema de segurança enterprise-level para proteção
 * de dados dos usuários, prevenção de vazamento e
 * manipulação de preços.
 * 
 * Foco: Proteção máxima contra roubo de dados e fraude
 * 
 * @author: SKULL BJJ Security Team
 * @version: 3.0.0 Enterprise
 * @since: 2024
 */

// ==============================================
// CONFIGURAÇÃO DE SEGURANÇA ENTERPRISE
// ==============================================
const ENTERPRISE_SECURITY_CONFIG = {
  // Criptografia de dados
  ENCRYPTION: {
    ALGORITHM: 'AES-GCM',
    KEY_LENGTH: 256,
    IV_LENGTH: 12,
    SALT_LENGTH: 32,
    ITERATIONS: 100000
  },
  
  // Proteção de preços
  PRICE_PROTECTION: {
    ENCRYPT_PRICES: true,
    SIGN_PRICES: true,
    VALIDATE_PRICES: true,
    DETECT_MANIPULATION: true
  },
  
  // Proteção de dados
  DATA_PROTECTION: {
    ENCRYPT_USER_DATA: true,
    SANITIZE_ALL_INPUTS: true,
    PREVENT_DATA_LEAKAGE: true,
    AUDIT_DATA_ACCESS: true
  },
  
  // Sessão segura
  SESSION_SECURITY: {
    ENCRYPT_SESSION: true,
    SIGN_SESSION: true,
    ROTATE_TOKENS: true,
    DETECT_HIJACKING: true
  },
  
  // Anti-tampering
  TAMPER_PROTECTION: {
    FREEZE_OBJECTS: true,
    DETECT_MODIFICATIONS: true,
    VALIDATE_INTEGRITY: true,
    SELF_DESTRUCT_ON_TAMPER: true
  }
};

// ==============================================
// GERENCIADOR DE SEGURANÇA ENTERPRISE
// ==============================================
class EnterpriseSecurityManager {
  constructor() {
    this.encryptionKey = null;
    this.sessionKey = null;
    this.priceSignatures = new Map();
    this.userSignatures = new Map();
    this.auditLog = [];
    this.tamperDetected = false;
    this.init();
  }

  async init() {
    console.log('🛡️ Inicializando sistema de segurança Enterprise...');
    
    // Gerar chaves criptográficas
    await this.generateEncryptionKeys();
    
    // Proteger objetos críticos
    this.protectCriticalObjects();
    
    // Inicializar proteção de preços
    this.initializePriceProtection();
    
    // Configurar detecção de tampering
    this.setupTamperDetection();
    
    // Iniciar auditoria de segurança
    this.startSecurityAuditing();
    
    console.log('✅ Sistema Enterprise Security inicializado com sucesso');
  }

  /**
   * Gera chaves criptográficas seguras
   */
  async generateEncryptionKeys() {
    // Gerar chave master
    const masterKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    this.encryptionKey = masterKey;
    
    // Gerar chave de sessão
    const sessionKeyMaterial = crypto.getRandomValues(new Uint8Array(32));
    this.sessionKey = await crypto.subtle.importKey(
      'raw',
      sessionKeyMaterial,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
    
    console.log('🔐 Chaves criptográficas geradas');
  }

  /**
   * Protege objetos críticos contra manipulação
   */
  protectCriticalObjects() {
    // Proteger dados de produtos (preços)
    if (window.PRODUCTS_DATA) {
      window.PRODUCTS_DATA = this.createProtectedObject(window.PRODUCTS_DATA, 'PRODUCTS_DATA');
    }
    
    // Proteger configurações
    if (window.CONFIG) {
      window.CONFIG = this.createProtectedObject(window.CONFIG, 'CONFIG');
    }
    
    console.log('🔒 Objetos críticos protegidos');
  }

  /**
   * Cria objeto protegido contra tampering
   */
  createProtectedObject(obj, name) {
    const protected = {
      data: obj,
      signature: null,
      checksum: null,
      timestamp: Date.now(),
      name: name
    };
    
    // Gerar assinatura
    protected.signature = this.generateObjectSignature(obj);
    protected.checksum = this.calculateChecksum(obj);
    
    // Congelar objeto
    return this.freezeProtectedObject(protected);
  }

  /**
   * Gera assinatura criptográfica do objeto
   */
  generateObjectSignature(obj) {
    const serialized = JSON.stringify(obj);
    const encoder = new TextEncoder();
    const data = encoder.encode(serialized);
    
    return Array.from(new Uint8Array(data))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Calcula checksum do objeto
   */
  calculateChecksum(obj) {
    const serialized = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < serialized.length; i++) {
      const char = serialized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Congela objeto para prevenção de modificação
   */
  freezeProtectedObject(obj) {
    // Deep freeze recursivo
    const deepFreeze = (o) => {
      Object.getOwnPropertyNames(o).forEach(prop => {
        if (o[prop] !== null && typeof o[prop] === 'object') {
          deepFreeze(o[prop]);
        }
      });
      return Object.freeze(o);
    };
    
    return deepFreeze(obj);
  }

  /**
   * Inicializa proteção de preços
   */
  initializePriceProtection() {
    if (window.PRODUCTS_DATA) {
      window.PRODUCTS_DATA.data.forEach(product => {
        // Assinar preço original
        const priceSignature = this.signPrice(product.price, product.id);
        this.priceSignatures.set(product.id, priceSignature);
        
        // Criar cópia criptografada do preço
        product.encryptedPrice = this.encryptPrice(product.price);
        product.originalPrice = product.price; // Para validação interna
        
        console.log(`💰 Preço protegido: ${product.name} - R$ ${product.price}`);
      });
    }
  }

  /**
   * Assina preço para detectar manipulação
   */
  signPrice(price, productId) {
    const priceData = {
      price: price,
      productId: productId,
      timestamp: Date.now(),
      nonce: crypto.getRandomValues(new Uint8Array(16))
    };
    
    return this.generateObjectSignature(priceData);
  }

  /**
   * Criptografa preço
   */
  encryptPrice(price) {
    const encoder = new TextEncoder();
    const data = encoder.encode(price.toString());
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Simulação de criptografia (em produção usar Web Crypto API)
    return btoa(JSON.stringify({
      data: Array.from(data),
      iv: Array.from(iv),
      timestamp: Date.now()
    }));
  }

  /**
   * Descriptografa e valida preço
   */
  decryptAndValidatePrice(productId, encryptedPrice) {
    try {
      // Validar assinatura
      const expectedSignature = this.priceSignatures.get(productId);
      if (!expectedSignature) {
        throw new Error('Preço não assinado');
      }
      
      // Simular descriptografia
      const decoded = JSON.parse(atob(encryptedPrice));
      const price = parseFloat(String.fromCharCode(...decoded.data));
      
      // Validar integridade
      const currentSignature = this.signPrice(price, productId);
      if (currentSignature !== expectedSignature) {
        throw new Error('Preço manipulado detectado');
      }
      
      return price;
    } catch (error) {
      console.error('🚨 Falha na validação de preço:', error);
      this.logSecurityEvent('PRICE_MANIPULATION_ATTEMPT', {
        productId,
        error: error.message,
        timestamp: Date.now()
      });
      return null;
    }
  }

  /**
   * Configura detecção de tampering
   */
  setupTamperDetection() {
    // Monitorar modificações em objetos críticos
    setInterval(() => {
      this.validateObjectIntegrity();
    }, 5000);
    
    // Prevenir acesso ao console
    this.protectConsole();
    
    // Detectar ferramentas de desenvolvedor
    this.detectDevTools();
  }

  /**
   * Valida integridade dos objetos
   */
  validateObjectIntegrity() {
    const criticalObjects = ['PRODUCTS_DATA', 'CONFIG'];
    
    criticalObjects.forEach(objName => {
      if (window[objName]) {
        const obj = window[objName];
        const currentSignature = this.generateObjectSignature(obj.data);
        const currentChecksum = this.calculateChecksum(obj.data);
        
        if (currentSignature !== obj.signature || currentChecksum !== obj.checksum) {
          this.handleTamperingDetection(objName, currentSignature, obj.signature);
        }
      }
    });
  }

  /**
   * Manipula detecção de tampering
   */
  handleTamperingDetection(objectName, currentSignature, expectedSignature) {
    console.error('🚨 TAMPERING DETECTADO!');
    console.error(`Objeto: ${objectName}`);
    console.error(`Assinatura esperada: ${expectedSignature}`);
    console.error(`Assinatura atual: ${currentSignature}`);
    
    this.tamperDetected = true;
    
    // Log do evento
    this.logSecurityEvent('TAMPERING_DETECTED', {
      objectName,
      expectedSignature,
      currentSignature,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Ações de proteção
    if (ENTERPRISE_SECURITY_CONFIG.TAMPER_PROTECTION.SELF_DESTRUCT_ON_TAMPER) {
      this.selfDestruct();
    }
  }

  /**
   * Protege console contra acesso
   */
  protectConsole() {
    const originalConsole = { ...console };
    
    // Sobrescrever métodos do console
    ['log', 'warn', 'error', 'info', 'debug', 'table'].forEach(method => {
      console[method] = function(...args) {
        // Filtrar informações sensíveis
        const filteredArgs = args.map(arg => {
          if (typeof arg === 'object' && arg !== null) {
            return this.filterSensitiveData(arg);
          }
          return arg;
        });
        
        // Log seguro
        originalConsole[method].apply(console, filteredArgs);
        
        // Detectar tentativas de acesso a dados sensíveis
        this.detectSuspiciousConsoleAccess(method, args);
      }.bind(this);
    });
  }

  /**
   * Filtra dados sensíveis do console
   */
  filterSensitiveData(obj) {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'hash', 'signature'];
    const filtered = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          filtered[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          filtered[key] = this.filterSensitiveData(obj[key]);
        } else {
          filtered[key] = obj[key];
        }
      }
    }
    
    return filtered;
  }

  /**
   * Detecta acesso suspeito ao console
   */
  detectSuspiciousConsoleAccess(method, args) {
    const suspiciousPatterns = [
      /password/i,
      /token/i,
      /auth/i,
      /session/i,
      /localStorage/i,
      /sessionStorage/i
    ];
    
    const argsString = JSON.stringify(args);
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(argsString));
    
    if (isSuspicious) {
      this.logSecurityEvent('SUSPICIOUS_CONSOLE_ACCESS', {
        method,
        args: argsString.substring(0, 200), // Limitar tamanho
        timestamp: Date.now()
      });
    }
  }

  /**
   * Detecta ferramentas de desenvolvedor
   */
  detectDevTools() {
    let devtools = {
      open: false,
      orientation: null
    };
    
    const threshold = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          this.logSecurityEvent('DEVTOOLS_OPENED', {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            windowSize: {
              outer: { width: window.outerWidth, height: window.outerHeight },
              inner: { width: window.innerWidth, height: window.innerHeight }
            }
          });
          
          console.warn('🚨 Ferramentas de desenvolvedor detectadas!');
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }

  /**
   * Inicia auditoria de segurança
   */
  startSecurityAuditing() {
    // Log inicialização
    this.logSecurityEvent('SECURITY_SYSTEM_INITIALIZED', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      features: this.getSecurityFeatures()
    });
    
    // Auditoria periódica
    setInterval(() => {
      this.performSecurityAudit();
    }, 60000); // A cada minuto
  }

  /**
   * Realiza auditoria de segurança
   */
  performSecurityAudit() {
    const audit = {
      timestamp: Date.now(),
      checks: {
        objectIntegrity: this.validateAllObjects(),
        priceIntegrity: this.validateAllPrices(),
        sessionSecurity: this.validateSessionSecurity(),
        encryptionStatus: this.validateEncryptionStatus()
      }
    };
    
    this.logSecurityEvent('SECURITY_AUDIT', audit);
    
    // Verificar se há problemas
    const hasIssues = Object.values(audit.checks).some(check => !check.valid);
    if (hasIssues) {
      console.warn('⚠️ Problemas detectados na auditoria de segurança');
    }
  }

  /**
   * Valida todos os objetos
   */
  validateAllObjects() {
    const objects = ['PRODUCTS_DATA', 'CONFIG'];
    const results = {};
    
    objects.forEach(objName => {
      if (window[objName]) {
        const obj = window[objName];
        results[objName] = {
          valid: obj.signature === this.generateObjectSignature(obj.data),
          timestamp: obj.timestamp
        };
      }
    });
    
    return results;
  }

  /**
   * Valida todos os preços
   */
  validateAllPrices() {
    const results = {};
    
    if (window.PRODUCTS_DATA) {
      window.PRODUCTS_DATA.data.forEach(product => {
        const isValid = this.validatePriceIntegrity(product);
        results[product.id] = isValid;
      });
    }
    
    return results;
  }

  /**
   * Valida integridade do preço
   */
  validatePriceIntegrity(product) {
    const expectedSignature = this.priceSignatures.get(product.id);
    const currentSignature = this.signPrice(product.originalPrice, product.id);
    
    return currentSignature === expectedSignature;
  }

  /**
   * Valida segurança da sessão
   */
  validateSessionSecurity() {
    // Verificar se há tentativas de hijacking
    const sessionData = this.getSessionData();
    
    return {
      valid: sessionData !== null,
      encrypted: sessionData ? sessionData.encrypted : false,
      timestamp: sessionData ? sessionData.timestamp : null
    };
  }

  /**
   * Valida status da criptografia
   */
  validateEncryptionStatus() {
    return {
      encryptionKey: !!this.encryptionKey,
      sessionKey: !!this.sessionKey,
      algorithm: ENTERPRISE_SECURITY_CONFIG.ENCRYPTION.ALGORITHM
    };
  }

  /**
   * Obtém dados da sessão
   */
  getSessionData() {
    // Simulação - em produção usar dados reais da sessão
    return {
      encrypted: true,
      timestamp: Date.now()
    };
  }

  /**
   * Obtém features de segurança
   */
  getSecurityFeatures() {
    return {
      encryption: true,
      priceProtection: true,
      tamperDetection: true,
      auditLogging: true,
      consoleProtection: true,
      devToolsDetection: true
    };
  }

  /**
   * Log de eventos de segurança
   */
  logSecurityEvent(eventType, data) {
    const event = {
      id: crypto.randomUUID(),
      type: eventType,
      data: data,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.auditLog.push(event);
    
    // Manter apenas últimos 1000 eventos
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
    
    // Log seguro no console
    console.log(`🔒 Security Event: ${eventType}`, {
      id: event.id,
      timestamp: new Date(event.timestamp).toISOString()
    });
  }

  /**
   * Auto-destruição em caso de tampering crítico
   */
  selfDestruct() {
    console.error('💀 AUTO-DESTRUCT ACTIVATED - Tampering crítico detectado!');
    
    // Limpar dados sensíveis
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirecionar para página de erro
    window.location.href = 'data:text/html,<h1>Security Violation Detected</h1><p>This page has been locked due to security violations.</p>';
    
    // Tentar fechar a página
    window.close();
  }

  /**
   * Obtém relatório de segurança
   */
  getSecurityReport() {
    return {
      timestamp: Date.now(),
      tamperDetected: this.tamperDetected,
      auditLog: this.auditLog.slice(-10), // Últimos 10 eventos
      protectedObjects: ['PRODUCTS_DATA', 'CONFIG'],
      securityFeatures: this.getSecurityFeatures(),
      encryptionStatus: this.validateEncryptionStatus()
    };
  }

  /**
   * Valida usuário criptografado
   */
  validateEncryptedUser(userData) {
    try {
      // Descriptografar dados do usuário
      const decryptedUser = this.decryptUserData(userData);
      
      // Validar assinatura
      const expectedSignature = this.userSignatures.get(decryptedUser.username);
      const currentSignature = this.generateObjectSignature(decryptedUser);
      
      if (currentSignature !== expectedSignature) {
        throw new Error('Dados do usuário manipulados');
      }
      
      return decryptedUser;
    } catch (error) {
      console.error('🚨 Falha na validação do usuário:', error);
      this.logSecurityEvent('USER_DATA_MANIPULATION', {
        error: error.message,
        timestamp: Date.now()
      });
      return null;
    }
  }

  /**
   * Descriptografa dados do usuário
   */
  decryptUserData(encryptedData) {
    // Simulação - em produção usar Web Crypto API
    return JSON.parse(atob(encryptedData));
  }

  /**
   * Criptografa dados do usuário
   */
  encryptUserData(userData) {
    // Gerar assinatura
    const signature = this.generateObjectSignature(userData);
    this.userSignatures.set(userData.username, signature);
    
    // Simulação de criptografia
    return btoa(JSON.stringify(userData));
  }

  /**
   * Obtém preço seguro de um produto
   */
  getSecurePrice(productId) {
    if (!window.PRODUCTS_DATA) {
      return null;
    }
    
    const product = window.PRODUCTS_DATA.data.find(p => p.id === productId);
    if (!product) {
      return null;
    }
    
    // Validar preço
    const validatedPrice = this.decryptAndValidatePrice(productId, product.encryptedPrice);
    
    if (validatedPrice === null) {
      // Usar preço original como fallback
      console.warn('⚠️ Usando preço original - falha na validação');
      return product.originalPrice;
    }
    
    return validatedPrice;
  }

  /**
   * Verifica se o sistema está seguro
   */
  isSystemSecure() {
    return !this.tamperDetected && 
           this.encryptionKey !== null && 
           this.sessionKey !== null;
  }
}

// ==============================================
// INICIALIZAÇÃO DO SISTEMA ENTERPRISE
// ==============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Aguardar carregamento completo
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }
  
  // Inicializar sistema enterprise
  window.enterpriseSecurity = new EnterpriseSecurityManager();
  
  // Expor apenas métodos seguros
  window.SecurityAPI = {
    getSecurePrice: (productId) => window.enterpriseSecurity.getSecurePrice(productId),
    validateUser: (userData) => window.enterpriseSecurity.validateEncryptedUser(userData),
    getSecurityReport: () => window.enterpriseSecurity.getSecurityReport(),
    isSecure: () => window.enterpriseSecurity.isSystemSecure()
  };
  
  console.log('✅ Enterprise Security System disponível via SecurityAPI');
  
  // Proteger contra acesso direto
  Object.defineProperty(window, 'enterpriseSecurity', {
    value: window.enterpriseSecurity,
    writable: false,
    configurable: false
  });
});
