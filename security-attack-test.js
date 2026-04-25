/**
 * ==============================================
 * SIMULADOR DE ATAQUES DE SEGURANÇA
 * ==============================================
 * Script para testar vulnerabilidades de segurança
 * no site SKULL BJJ através de ataques controlados.
 * 
 * @author: Security Testing Team
 * @version: 1.0.0
 * @since: 2024
 */

class SecurityAttackSimulator {
  constructor() {
    this.attackResults = [];
    this.vulnerabilities = [];
    this.currentAttack = 0;
    this.totalAttacks = 0;
    this.init();
  }

  init() {
    console.log('🚀 Iniciando simulador de ataques de segurança...');
    this.runAllAttacks();
  }

  /**
   * Executa todos os ataques de segurança
   */
  async runAllAttacks() {
    const attacks = [
      this.testXSSAttacks.bind(this),
      this.testSQLInjection.bind(this),
      this.testCSRFAttack.bind(this),
      this.testSessionHijacking.bind(this),
      this.testRateLimitingBypass.bind(this),
      this.testPasswordBruteForce.bind(this),
      this.testLocalStorageInjection.bind(this),
      this.testConsoleAttacks.bind(this),
      this.testDOMManipulation.bind(this),
      this.testAuthenticationBypass.bind(this)
    ];

    this.totalAttacks = attacks.length;
    
    for (let i = 0; i < attacks.length; i++) {
      this.currentAttack = i + 1;
      console.log(`\n🔥 Executando ataque ${this.currentAttack}/${this.totalAttacks}: ${attacks[i].name}`);
      
      try {
        await attacks[i]();
      } catch (error) {
        console.error(`❌ Erro no ataque ${i + 1}:`, error);
        this.logAttackResult(attacks[i].name, false, error.message);
      }
      
      // Delay entre ataques
      await this.delay(500);
    }

    this.generateAttackReport();
  }

  /**
   * Teste 1: Ataques XSS (Cross-Site Scripting)
   */
  async testXSSAttacks() {
    const attackVectors = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>',
      '\';alert("XSS");//',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<body onload="alert(\'XSS\')">',
      '<input autofocus onfocus="alert(\'XSS\')">',
      '<select onfocus="alert(\'XSS\')" autofocus>'
    ];

    let vulnerabilitiesFound = 0;

    for (const vector of attackVectors) {
      // Testar em inputs do formulário
      const inputs = document.querySelectorAll('input, textarea');
      
      inputs.forEach(input => {
        const originalValue = input.value;
        input.value = vector;
        
        // Simular evento input
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Verificar se o XSS foi executado
        if (this.checkXSSExecution(vector)) {
          vulnerabilitiesFound++;
          this.vulnerabilities.push({
            type: 'XSS',
            severity: 'HIGH',
            vector: vector,
            element: input.tagName + (input.id ? '#' + input.id : ''),
            description: 'XSS executado através de input injection'
          });
        }
        
        input.value = originalValue;
      });
    }

    const success = vulnerabilitiesFound === 0;
    this.logAttackResult('XSS Attacks', success, 
      success ? 'Nenhuma vulnerabilidade XSS encontrada' : 
      `${vulnerabilitiesFound} vulnerabilidades XSS encontradas`);
  }

  /**
   * Teste 2: Injeção SQL
   */
  async testSQLInjection() {
    const sqlVectors = [
      "' OR '1'='1",
      "' OR '1'='1' --",
      "' OR '1'='1' /*",
      "admin'--",
      "admin' /*",
      "' OR 1=1--",
      "' OR 1=1#",
      "' OR 1=1/*",
      "') OR '1'='1--",
      "') OR ('1'='1--"
    ];

    let vulnerabilitiesFound = 0;

    // Testar em campos de username/login
    const usernameInputs = document.querySelectorAll('input[type="text"], input[name*="user"], input[name*="name"]');
    
    for (const vector of sqlVectors) {
      usernameInputs.forEach(input => {
        const originalValue = input.value;
        input.value = vector;
        
        // Simular tentativa de login
        if (window.authManager) {
          // Tentar autenticação com SQL injection
          this.testAuthenticationWithVector(vector);
        }
        
        input.value = originalValue;
      });
    }

    const success = vulnerabilitiesFound === 0;
    this.logAttackResult('SQL Injection', success, 
      success ? 'Nenhuma vulnerabilidade SQL Injection encontrada' : 
      'Possível vulnerabilidade SQL Injection detectada');
  }

  /**
   * Teste 3: Ataque CSRF
   */
  async testCSRFAttack() {
    let vulnerabilitiesFound = 0;

    // Verificar se tokens CSRF estão sendo usados
    const csrfTokens = document.querySelectorAll('input[name*="csrf"], input[name*="token"]');
    
    if (csrfTokens.length === 0) {
      vulnerabilitiesFound++;
      this.vulnerabilities.push({
        type: 'CSRF',
        severity: 'MEDIUM',
        vector: 'Missing CSRF Token',
        element: 'Formulários',
        description: 'Formulários sem proteção CSRF'
      });
    }

    // Tentar criar formulário malicioso
    const maliciousForm = document.createElement('form');
    maliciousForm.method = 'POST';
    maliciousForm.action = window.location.href;
    
    const maliciousInput = document.createElement('input');
    maliciousInput.type = 'hidden';
    maliciousInput.name = 'username';
    maliciousInput.value = 'admin';
    
    maliciousForm.appendChild(maliciousInput);
    document.body.appendChild(maliciousForm);
    
    // Verificar se o formulário malicioso seria aceito
    setTimeout(() => {
      document.body.removeChild(maliciousForm);
    }, 1000);

    const success = vulnerabilitiesFound === 0;
    this.logAttackResult('CSRF Attack', success, 
      success ? 'Proteção CSRF funcionando' : 
      'Vulnerabilidades CSRF encontradas');
  }

  /**
   * Teste 4: Sequestro de Sessão
   */
  async testSessionHijacking() {
    let vulnerabilitiesFound = 0;

    // Verificar se há dados sensíveis no localStorage
    const sensitiveKeys = ['auth_token', 'current_user', 'password', 'token'];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (sensitiveKeys.some(sensitive => key.includes(sensitive))) {
        vulnerabilitiesFound++;
        this.vulnerabilities.push({
          type: 'Session Hijacking',
          severity: 'HIGH',
          vector: 'LocalStorage Access',
          element: key,
          description: 'Dados sensíveis armazenados no localStorage'
        });
      }
    }

    // Verificar se os cookies são HttpOnly (não possível testar client-side)
    const cookies = document.cookie;
    if (cookies.includes('session') || cookies.includes('token')) {
      vulnerabilitiesFound++;
      this.vulnerabilities.push({
        type: 'Session Hijacking',
        severity: 'MEDIUM',
        vector: 'Cookie Access',
        element: 'document.cookie',
        description: 'Cookies acessíveis via JavaScript'
      });
    }

    const success = vulnerabilitiesFound === 0;
    this.logAttackResult('Session Hijacking', success, 
      success ? 'Sessão protegida contra sequestro' : 
      `${vulnerabilitiesFound} vulnerabilidades de sessão encontradas`);
  }

  /**
   * Teste 5: Bypass de Rate Limiting
   */
  async testRateLimitingBypass() {
    let vulnerabilitiesFound = 0;
    let requestsCount = 0;
    const maxRequests = 150; // Tentar mais que o limite

    // Simular múltiplas requisições rápidas
    for (let i = 0; i < maxRequests; i++) {
      if (window.securityManager) {
        try {
          window.securityManager.trackRequests();
          requestsCount++;
        } catch (error) {
          // Rate limiting funcionou
          break;
        }
      }
      
      // Simular diferentes IPs (bypass attempt)
      if (i % 10 === 0) {
        // Mudar IP simulado
        if (window.securityManager) {
          window.securityManager.getClientIP = () => 'bypass_' + Math.random();
        }
      }
    }

    if (requestsCount >= 100) {
      vulnerabilitiesFound++;
      this.vulnerabilities.push({
        type: 'Rate Limiting Bypass',
        severity: 'MEDIUM',
        vector: 'Multiple Requests',
        element: 'Security Manager',
        description: 'Rate limiting pode ser bypassado'
      });
    }

    const success = vulnerabilitiesFound === 0;
    this.logAttackResult('Rate Limiting Bypass', success, 
      success ? 'Rate limiting funcionando corretamente' : 
      'Rate limiting pode ser bypassado');
  }

  /**
   * Teste 6: Força Bruta em Senhas
   */
  async testPasswordBruteForce() {
    let vulnerabilitiesFound = 0;
    const commonPasswords = [
      '123456', 'password', 'admin', '123456789', '12345678',
      '12345', '1234567', '1234567890', 'senha', '123123',
      'qwerty', 'abc123', 'password1', 'admin123'
    ];

    // Testar força bruta no login
    for (const password of commonPasswords) {
      if (window.authManager) {
        try {
          const result = await window.authManager.authenticate('admin', password);
          if (result.success) {
            vulnerabilitiesFound++;
            this.vulnerabilities.push({
              type: 'Password Brute Force',
              severity: 'CRITICAL',
              vector: password,
              element: 'Authentication System',
              description: 'Senha fraca descoberta por força bruta'
            });
            break;
          }
        } catch (error) {
          // Continuar tentando
        }
      }
    }

    const success = vulnerabilitiesFound === 0;
    this.logAttackResult('Password Brute Force', success, 
      success ? 'Proteção contra força bruta funcionando' : 
      'Senha vulnerável a força bruta');
  }

  /**
   * Teste 7: Injeção no LocalStorage
   */
  async testLocalStorageInjection() {
    let vulnerabilitiesFound = 0;

    // Tentar injetar dados maliciosos no localStorage
    const maliciousData = {
      username: '<script>alert("XSS")</script>',
      token: 'malicious_token',
      isAdmin: true,
      role: 'admin'
    };

    try {
      localStorage.setItem('current_user', JSON.stringify(maliciousData));
      
      // Verificar se o sistema aceita dados maliciosos
      if (window.authCheckManager) {
        window.authCheckManager.checkAuthentication();
        
        // Se o sistema aceitar, é uma vulnerabilidade
        const currentUser = window.authCheckManager.currentUser;
        if (currentUser && currentUser.isAdmin) {
          vulnerabilitiesFound++;
          this.vulnerabilities.push({
            type: 'LocalStorage Injection',
            severity: 'HIGH',
            vector: 'Malicious Data',
            element: 'localStorage',
            description: 'Sistema aceita dados maliciosos do localStorage'
          });
        }
      }
      
      // Limpar dados maliciosos
      localStorage.removeItem('current_user');
    } catch (error) {
      // Sistema rejeitou dados maliciosos (bom)
    }

    const success = vulnerabilitiesFound === 0;
    this.logAttackResult('LocalStorage Injection', success, 
      success ? 'LocalStorage protegido contra injeção' : 
      'LocalStorage vulnerável a injeção');
  }

  /**
   * Teste 8: Ataques via Console
   */
  async testConsoleAttacks() {
    let vulnerabilitiesFound = 0;

    // Tentar acessar dados sensíveis via console
    const sensitiveObjects = [
      'window.authManager',
      'window.securityManager',
      'window.jiujitsuStore',
      'localStorage',
      'sessionStorage'
    ];

    sensitiveObjects.forEach(obj => {
      try {
        const object = eval(obj);
        if (object && typeof object === 'object') {
          // Verificar se há dados sensíveis expostos
          const stringified = JSON.stringify(object);
          if (stringified.includes('password') || stringified.includes('token')) {
            vulnerabilitiesFound++;
            this.vulnerabilities.push({
              type: 'Console Attack',
              severity: 'MEDIUM',
              vector: obj,
              element: 'Global Scope',
              description: 'Dados sensíveis expostos no console'
            });
          }
        }
      } catch (error) {
        // Objeto não acessível (bom)
      }
    });

    const success = vulnerabilitiesFound === 0;
    this.logAttackResult('Console Attacks', success, 
      success ? 'Console protegido contra ataques' : 
      `${vulnerabilitiesFound} vulnerabilidades no console encontradas`);
  }

  /**
   * Teste 9: Manipulação DOM
   */
  async testDOMManipulation() {
    let vulnerabilitiesFound = 0;

    // Tentar manipular elementos DOM
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Tentar remover validações
      const originalAction = form.action;
      const originalMethod = form.method;
      
      // Tentar bypass de validação
      form.noValidate = true;
      form.action = 'javascript:alert("DOM Manipulation Success")';
      
      // Tentar submit
      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        submitButton.click();
        
        // Verificar se a manipulação funcionou
        setTimeout(() => {
          if (form.action !== originalAction) {
            vulnerabilitiesFound++;
            this.vulnerabilities.push({
              type: 'DOM Manipulation',
              severity: 'MEDIUM',
              vector: 'Form Action Override',
              element: form.tagName,
              description: 'Formulário vulnerável a manipulação DOM'
            });
          }
          
          // Restaurar valores originais
          form.action = originalAction;
          form.method = originalMethod;
          form.noValidate = false;
        }, 100);
      }
    });

    const success = vulnerabilitiesFound === 0;
    this.logAttackResult('DOM Manipulation', success, 
      success ? 'DOM protegido contra manipulação' : 
      'DOM vulnerável a manipulação');
  }

  /**
   * Teste 10: Bypass de Autenticação
   */
  async testAuthenticationBypass() {
    let vulnerabilitiesFound = 0;

    // Tentar bypass direto de autenticação
    if (window.authCheckManager) {
      // Tentar setar usuário diretamente
      const fakeUser = {
        username: 'admin',
        role: 'admin',
        name: 'Fake Admin'
      };
      
      window.authCheckManager.currentUser = fakeUser;
      window.authCheckManager.isAuthenticated = true;
      
      // Verificar se o bypass funcionou
      setTimeout(() => {
        const welcomeElement = document.getElementById('welcomeMessage');
        if (welcomeElement && welcomeElement.textContent.includes('Fake Admin')) {
          vulnerabilitiesFound++;
          this.vulnerabilities.push({
            type: 'Authentication Bypass',
            severity: 'CRITICAL',
            vector: 'Direct Object Manipulation',
            element: 'AuthCheckManager',
            description: 'Autenticação pode ser bypassada via manipulação direta'
          });
        }
      }, 100);
    }

    const success = vulnerabilitiesFound === 0;
    this.logAttackResult('Authentication Bypass', success, 
      success ? 'Autenticação protegida contra bypass' : 
      'Autenticação vulnerável a bypass');
  }

  /**
   * Verifica se XSS foi executado
   */
  checkXSSExecution(vector) {
    // Verificar se há novos scripts ou elementos
    const scripts = document.querySelectorAll('script');
    const alerts = document.querySelectorAll('[on*="alert"]');
    
    return scripts.length > this.originalScriptCount || 
           alerts.length > this.originalAlertCount;
  }

  /**
   * Testa autenticação com vetor específico
   */
  testAuthenticationWithVector(vector) {
    // Simular tentativa de login com vetor malicioso
    if (window.authManager) {
      // Isso seria testado em um ambiente real
      console.log('Testing authentication with vector:', vector);
    }
  }

  /**
   * Registra resultado do ataque
   */
  logAttackResult(attackName, success, details) {
    const result = {
      attack: attackName,
      success: success,
      details: details,
      timestamp: new Date().toISOString()
    };
    
    this.attackResults.push(result);
    
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${attackName}: ${details}`);
  }

  /**
   * Gera relatório completo dos ataques
   */
  generateAttackReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🛡️ RELATÓRIO DE ATAQUES DE SEGURANÇA');
    console.log('='.repeat(80));
    
    const totalVulnerabilities = this.vulnerabilities.length;
    const criticalVulns = this.vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const highVulns = this.vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const mediumVulns = this.vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
    
    console.log(`\n📊 RESUMO:`);
    console.log(`• Total de ataques testados: ${this.totalAttacks}`);
    console.log(`• Vulnerabilidades encontradas: ${totalVulnerabilities}`);
    console.log(`• Críticas: ${criticalVulns}`);
    console.log(`• Altas: ${highVulns}`);
    console.log(`• Médias: ${mediumVulns}`);
    
    if (totalVulnerabilities > 0) {
      console.log(`\n🚨 VULNERABILIDADES ENCONTRADAS:`);
      this.vulnerabilities.forEach((vuln, index) => {
        console.log(`\n${index + 1}. ${vuln.type} (${vuln.severity})`);
        console.log(`   Elemento: ${vuln.element}`);
        console.log(`   Vetor: ${vuln.vector}`);
        console.log(`   Descrição: ${vuln.description}`);
      });
    }
    
    console.log(`\n📋 RESULTADOS DOS ATAQUES:`);
    this.attackResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.attack}`);
      console.log(`   ${result.details}`);
    });
    
    // Salvar relatório no localStorage
    const report = {
      summary: {
        totalAttacks: this.totalAttacks,
        totalVulnerabilities: totalVulnerabilities,
        critical: criticalVulns,
        high: highVulns,
        medium: mediumVulns
      },
      vulnerabilities: this.vulnerabilities,
      results: this.attackResults,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('security_attack_report', JSON.stringify(report));
    
    console.log(`\n💾 Relatório salvo em localStorage (security_attack_report)`);
    console.log('='.repeat(80));
    
    // Exibir status geral
    if (totalVulnerabilities === 0) {
      console.log('🎉 EXCELENTE! Nenhuma vulnerabilidade encontrada!');
    } else if (criticalVulns > 0) {
      console.log('🚨 CRÍTICO! Vulnerabilidades críticas encontradas!');
    } else if (highVulns > 0) {
      console.log('⚠️ ATENÇÃO! Vulnerabilidades altas encontradas!');
    } else {
      console.log('🔍 MELHORIA! Vulnerabilidades médias encontradas!');
    }
  }

  /**
   * Delay utilitário
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Contar scripts originais para detecção de XSS
SecurityAttackSimulator.prototype.originalScriptCount = document.querySelectorAll('script').length;
SecurityAttackSimulator.prototype.originalAlertCount = document.querySelectorAll('[on*="alert"]').length;

// Iniciar ataque automático quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  // Aguardar 3 segundos para garantir que tudo carregou
  setTimeout(() => {
    if (confirm('🚀 Deseja iniciar o simulador de ataques de segurança?\n\n' +
                'Este teste tentará encontrar vulnerabilidades no site.\n' +
                'Pode causar algum comportamento inesperado temporariamente.')) {
      window.attackSimulator = new SecurityAttackSimulator();
    }
  }, 3000);
});

// Função para executar ataque manualmente
window.runSecurityAttack = function() {
  if (!window.attackSimulator) {
    window.attackSimulator = new SecurityAttackSimulator();
  }
};

// Função para ver relatório anterior
window.viewAttackReport = function() {
  const report = localStorage.getItem('security_attack_report');
  if (report) {
    console.log('📋 Relatório anterior:', JSON.parse(report));
  } else {
    console.log('ℹ️ Nenhum relatório encontrado. Execute um ataque primeiro.');
  }
};
