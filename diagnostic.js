/**
 * ==============================================
 * SISTEMA DE DIAGNÓSTICO DE ERROS
 * ==============================================
 * Verifica automaticamente todos os possíveis erros
 * no site SKULL BJJ e gera um relatório completo.
 * 
 * @author: SKULL BJJ Development Team
 * @version: 1.0.0
 */

class SiteDiagnostic {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.startTime = Date.now();
    this.init();
  }

  init() {
    console.log('🔍 Iniciando diagnóstico do site...');
    this.runAllChecks();
  }

  async runAllChecks() {
    const checks = [
      this.checkJavaScriptErrors.bind(this),
      this.checkHTMLErrors.bind(this),
      this.checkCSSErrors.bind(this),
      this.checkScriptLoading.bind(this),
      this.checkFunctionality.bind(this),
      this.checkSecuritySystem.bind(this),
      this.checkPerformance.bind(this),
      this.checkAccessibility.bind(this)
    ];

    for (const check of checks) {
      try {
        await check();
        await this.delay(100); // Pequeno delay entre verificações
      } catch (error) {
        this.errors.push({
          type: 'DIAGNOSTIC_ERROR',
          message: `Erro na verificação: ${error.message}`,
          timestamp: Date.now()
        });
      }
    }

    this.generateReport();
  }

  /**
   * Verifica erros JavaScript
   */
  checkJavaScriptErrors() {
    console.log('📝 Verificando erros JavaScript...');
    
    // Verificar sintaxe básica
    try {
      // Testar funções globais
      if (typeof window.jiujitsuStore !== 'undefined') {
        this.info.push({
          type: 'JAVASCRIPT',
          message: 'JiujitsuStore carregado com sucesso',
          timestamp: Date.now()
        });
      } else {
        this.warnings.push({
          type: 'JAVASCRIPT',
          message: 'JiujitsuStore não encontrado',
          timestamp: Date.now()
        });
      }

      // Verificar SecurityAPI
      if (typeof window.SecurityAPI !== 'undefined') {
        this.info.push({
          type: 'JAVASCRIPT',
          message: 'SecurityAPI disponível',
          timestamp: Date.now()
        });
      } else {
        this.errors.push({
          type: 'JAVASCRIPT',
          message: 'SecurityAPI não encontrado - sistema de segurança comprometido',
          timestamp: Date.now()
        });
      }

      // Verificar CONFIG
      if (typeof window.CONFIG !== 'undefined') {
        this.info.push({
          type: 'JAVASCRIPT',
          message: 'CONFIG carregado',
          timestamp: Date.now()
        });
      } else {
        this.warnings.push({
          type: 'JAVASCRIPT',
          message: 'CONFIG não encontrado',
          timestamp: Date.now()
        });
      }

    } catch (error) {
      this.errors.push({
        type: 'JAVASCRIPT_ERROR',
        message: `Erro JavaScript: ${error.message}`,
        stack: error.stack,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Verifica erros HTML
   */
  checkHTMLErrors() {
    console.log('📄 Verificando estrutura HTML...');
    
    // Verificar elementos críticos
    const criticalElements = [
      { selector: '.store-header', name: 'Header' },
      { selector: '.hero-section', name: 'Hero Section' },
      { selector: '.products-section', name: 'Products Section' },
      { selector: '.products-grid', name: 'Products Grid' },
      { selector: '.academy-section', name: 'Academy Section' },
      { selector: '.testimonials-section', name: 'Testimonials Section' },
      { selector: '.contact-section', name: 'Contact Section' },
      { selector: '.store-footer', name: 'Footer' }
    ];

    criticalElements.forEach(element => {
      const el = document.querySelector(element.selector);
      if (!el) {
        this.errors.push({
          type: 'HTML_ERROR',
          message: `Elemento crítico não encontrado: ${element.name} (${element.selector})`,
          timestamp: Date.now()
        });
      } else {
        this.info.push({
          type: 'HTML',
          message: `${element.name} encontrado`,
          timestamp: Date.now()
        });
      }
    });

    // Verificar formulários
    const forms = document.querySelectorAll('form');
    if (forms.length === 0) {
      this.warnings.push({
        type: 'HTML',
        message: 'Nenhum formulário encontrado',
        timestamp: Date.now()
      });
    } else {
      this.info.push({
        type: 'HTML',
        message: `${forms.length} formulários encontrados`,
        timestamp: Date.now()
      });
    }

    // Verificar links
    const links = document.querySelectorAll('a[href]');
    const brokenLinks = Array.from(links).filter(link => {
      const href = link.getAttribute('href');
      return href && href.includes('#') && !document.querySelector(href);
    });

    if (brokenLinks.length > 0) {
      this.warnings.push({
        type: 'HTML',
        message: `${brokenLinks.length} links quebrados encontrados`,
        links: brokenLinks.map(link => link.getAttribute('href')),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Verifica erros CSS
   */
  checkCSSErrors() {
    console.log('🎨 Verificando CSS...');
    
    // Verificar se estilos críticos estão aplicados
    const criticalStyles = [
      { selector: '.store-header', property: 'display', expected: 'block' },
      { selector: '.product-card', property: 'display', expected: 'block' },
      { selector: '.hero-section', property: 'padding', expected: '8rem 2rem' }
    ];

    criticalStyles.forEach(style => {
      const element = document.querySelector(style.selector);
      if (element) {
        const computed = window.getComputedStyle(element);
        const actual = computed[style.property];
        
        if (actual !== style.expected) {
          this.warnings.push({
            type: 'CSS',
            message: `Estilo não aplicado corretamente: ${style.selector} ${style.property}`,
            expected: style.expected,
            actual: actual,
            timestamp: Date.now()
          });
        }
      }
    });

    // Verificar se há estilos inline problemáticos
    const inlineStyles = document.querySelectorAll('[style]');
    if (inlineStyles.length > 10) {
      this.warnings.push({
        type: 'CSS',
        message: `Muitos estilos inline encontrados: ${inlineStyles.length}`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Verifica carregamento de scripts
   */
  checkScriptLoading() {
    console.log('📜 Verificando carregamento de scripts...');
    
    const scripts = document.querySelectorAll('script[src]');
    const loadedScripts = [];
    const failedScripts = [];

    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        // Verificar se o script está acessível
        const scriptName = src.split('/').pop();
        
        // Verificar se há erros no console relacionados a este script
        if (window.performance && window.performance.getEntriesByType) {
          const entries = window.performance.getEntriesByType('resource');
          const scriptEntry = entries.find(entry => entry.name.includes(scriptName));
          
          if (scriptEntry) {
            if (scriptEntry.transferSize === 0) {
              failedScripts.push(scriptName);
            } else {
              loadedScripts.push(scriptName);
            }
          }
        }
      }
    });

    if (failedScripts.length > 0) {
      this.errors.push({
        type: 'SCRIPT_LOADING',
        message: `Scripts que falharam em carregar: ${failedScripts.join(', ')}`,
        failed: failedScripts,
        timestamp: Date.now()
      });
    }

    this.info.push({
      type: 'SCRIPT_LOADING',
      message: `${loadedScripts.length} scripts carregados com sucesso`,
      loaded: loadedScripts,
      timestamp: Date.now()
    });
  }

  /**
   * Verifica funcionalidade
   */
  checkFunctionality() {
    console.log('⚙️ Verificando funcionalidade...');
    
    // Verificar se os filtros funcionam
    const colorFilter = document.getElementById('colorFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (!colorFilter || !priceFilter || !sortFilter) {
      this.errors.push({
        type: 'FUNCTIONALITY',
        message: 'Filtros de produtos não encontrados',
        timestamp: Date.now()
      });
    } else {
      this.info.push({
        type: 'FUNCTIONALITY',
        message: 'Filtros de produtos encontrados',
        timestamp: Date.now()
      });
    }

    // Verificar se há produtos
    if (window.PRODUCTS_DATA && Array.isArray(window.PRODUCTS_DATA)) {
      this.info.push({
        type: 'FUNCTIONALITY',
        message: `${window.PRODUCTS_DATA.length} produtos encontrados`,
        timestamp: Date.now()
      });
    } else {
      this.errors.push({
        type: 'FUNCTIONALITY',
        message: 'Dados de produtos não encontrados',
        timestamp: Date.now()
      });
    }

    // Verificar navegação
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks.length === 0) {
      this.warnings.push({
        type: 'FUNCTIONALITY',
        message: 'Nenhum link de navegação encontrado',
        timestamp: Date.now()
      });
    } else {
      this.info.push({
        type: 'FUNCTIONALITY',
        message: `${navLinks.length} links de navegação encontrados`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Verifica sistema de segurança
   */
  checkSecuritySystem() {
    console.log('🔒 Verificando sistema de segurança...');
    
    // Verificar SecurityAPI
    if (window.SecurityAPI) {
      try {
        const isSecure = window.SecurityAPI.isSecure();
        if (isSecure) {
          this.info.push({
            type: 'SECURITY',
            message: 'Sistema de segurança funcionando',
            timestamp: Date.now()
          });
        } else {
          this.errors.push({
            type: 'SECURITY',
            message: 'Sistema de segurança reports inseguro',
            timestamp: Date.now()
          });
        }

        // Verificar relatório de segurança
        const report = window.SecurityAPI.getSecurityReport();
        if (report) {
          this.info.push({
            type: 'SECURITY',
            message: 'Relatório de segurança disponível',
            timestamp: Date.now()
          });
        }
      } catch (error) {
        this.errors.push({
          type: 'SECURITY',
          message: `Erro no sistema de segurança: ${error.message}`,
          timestamp: Date.now()
        });
      }
    } else {
      this.errors.push({
        type: 'SECURITY',
        message: 'SecurityAPI não disponível',
        timestamp: Date.now()
      });
    }

    // Verificar se há dados sensíveis expostos
    const sensitiveData = ['password', 'token', 'key', 'secret'];
    const localStorageData = Object.keys(localStorage);
    const sessionStorageData = Object.keys(sessionStorage);
    
    const sensitiveKeys = [...localStorageData, ...sessionStorageData].filter(key => 
      sensitiveData.some(sensitive => key.toLowerCase().includes(sensitive))
    );

    if (sensitiveKeys.length > 0) {
      this.warnings.push({
        type: 'SECURITY',
        message: `Dados sensíveis encontrados no storage: ${sensitiveKeys.join(', ')}`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Verifica performance
   */
  checkPerformance() {
    console.log('⚡ Verificando performance...');
    
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      
      if (loadTime > 3000) {
        this.warnings.push({
          type: 'PERFORMANCE',
          message: `Tempo de carregamento lento: ${loadTime}ms`,
          loadTime: loadTime,
          timestamp: Date.now()
        });
      } else {
        this.info.push({
          type: 'PERFORMANCE',
          message: `Tempo de carregamento bom: ${loadTime}ms`,
          loadTime: loadTime,
          timestamp: Date.now()
        });
      }
    }

    // Verificar tamanho do DOM
    const elements = document.querySelectorAll('*').length;
    if (elements > 2000) {
      this.warnings.push({
        type: 'PERFORMANCE',
        message: `DOM muito grande: ${elements} elementos`,
        elements: elements,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Verifica acessibilidade
   */
  checkAccessibility() {
    console.log('♿ Verificando acessibilidade...');
    
    // Verificar imagens com alt
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    
    if (imagesWithoutAlt.length > 0) {
      this.warnings.push({
        type: 'ACCESSIBILITY',
        message: `${imagesWithoutAlt.length} imagens sem atributo alt`,
        count: imagesWithoutAlt.length,
        timestamp: Date.now()
      });
    }

    // Verificar headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hasH1 = document.querySelector('h1');
    
    if (!hasH1) {
      this.warnings.push({
        type: 'ACCESSIBILITY',
        message: 'Nenhum H1 encontrado',
        timestamp: Date.now()
      });
    }

    // Verificar formulários com labels
    const inputs = document.querySelectorAll('input, textarea, select');
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.id;
      return id && !document.querySelector(`label[for="${id}"]`);
    });

    if (inputsWithoutLabels.length > 0) {
      this.warnings.push({
        type: 'ACCESSIBILITY',
        message: `${inputsWithoutLabels.length} inputs sem labels`,
        count: inputsWithoutLabels.length,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Gera relatório completo
   */
  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    console.log('\n' + '='.repeat(80));
    console.log('🔍 RELATÓRIO DE DIAGNÓSTICO DO SITE SKULL BJJ');
    console.log('='.repeat(80));
    
    console.log(`\n📊 RESUMO:`);
    console.log(`• Tempo de diagnóstico: ${duration}ms`);
    console.log(`• Erros críticos: ${this.errors.length}`);
    console.log(`• Avisos: ${this.warnings.length}`);
    console.log(`• Informações: ${this.info.length}`);

    if (this.errors.length > 0) {
      console.log(`\n🚨 ERROS CRÍTICOS:`);
      this.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.type}`);
        console.log(`   ${error.message}`);
        if (error.timestamp) {
          console.log(`   Timestamp: ${new Date(error.timestamp).toISOString()}`);
        }
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ AVISOS:`);
      this.warnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. ${warning.type}`);
        console.log(`   ${warning.message}`);
        if (warning.timestamp) {
          console.log(`   Timestamp: ${new Date(warning.timestamp).toISOString()}`);
        }
      });
    }

    if (this.info.length > 0) {
      console.log(`\n✅ INFORMAÇÕES:`);
      this.info.forEach((info, index) => {
        console.log(`\n${index + 1}. ${info.type}`);
        console.log(`   ${info.message}`);
      });
    }

    // Status geral
    let status = '✅ EXCELENTE';
    if (this.errors.length > 0) {
      status = '🚨 PROBLEMAS CRÍTICOS';
    } else if (this.warnings.length > 5) {
      status = '⚠️ PRECISA ATENÇÃO';
    } else if (this.warnings.length > 0) {
      status = '🔍 MELHORIAS POSSÍVEIS';
    }

    console.log(`\n📋 STATUS GERAL: ${status}`);
    console.log('='.repeat(80));

    // Salvar relatório no localStorage
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      summary: {
        errors: this.errors.length,
        warnings: this.warnings.length,
        info: this.info.length,
        status: status
      },
      errors: this.errors,
      warnings: this.warnings,
      info: this.info
    };

    localStorage.setItem('site_diagnostic_report', JSON.stringify(report));
    console.log(`💾 Relatório salvo em localStorage (site_diagnostic_report)`);
    
    // Exibir recomendações
    this.generateRecommendations();
  }

  /**
   * Gera recomendações baseadas nos problemas encontrados
   */
  generateRecommendations() {
    console.log(`\n💡 RECOMENDAÇÕES:`);
    
    if (this.errors.length > 0) {
      console.log(`\n🔧 CORRIGIR ERROS CRÍTICOS:`);
      
      this.errors.forEach(error => {
        switch(error.type) {
          case 'JAVASCRIPT_ERROR':
            console.log(`• Corrigir erro JavaScript: ${error.message}`);
            break;
          case 'HTML_ERROR':
            console.log(`• Adicionar elemento HTML: ${error.message}`);
            break;
          case 'FUNCTIONALITY':
            console.log(`• Implementar funcionalidade: ${error.message}`);
            break;
          case 'SECURITY':
            console.log(`• Corrigir sistema de segurança: ${error.message}`);
            break;
          default:
            console.log(`• Investigar: ${error.message}`);
        }
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n🔍 MELHORIAS SUGERIDAS:`);
      
      const uniqueWarnings = [...new Set(this.warnings.map(w => w.type))];
      uniqueWarnings.forEach(type => {
        switch(type) {
          case 'CSS':
            console.log(`• Otimizar CSS para melhor performance`);
            break;
          case 'PERFORMANCE':
            console.log(`• Otimizar tempo de carregamento`);
            break;
          case 'ACCESSIBILITY':
            console.log(`• Melhorar acessibilidade (alt, labels, etc.)`);
            break;
          case 'HTML':
            console.log(`• Revisar estrutura HTML`);
            break;
        }
      });
    }

    console.log(`\n🎯 PRÓXIMOS PASSOS:`);
    if (this.errors.length === 0) {
      console.log(`• Site está funcionando bem!`);
      console.log(`• Considere otimizar as melhorias sugeridas`);
    } else {
      console.log(`• Corrigir os ${this.errors.length} erros críticos primeiro`);
      console.log(`• Testar novamente após as correções`);
    }
  }

  /**
   * Delay utilitário
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Iniciar diagnóstico automaticamente
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.siteDiagnostic = new SiteDiagnostic();
  }, 2000); // Aguardar 2 segundos para carregar tudo
});

// Função para executar diagnóstico manualmente
window.runDiagnostic = function() {
  if (!window.siteDiagnostic) {
    window.siteDiagnostic = new SiteDiagnostic();
  } else {
    console.log('🔍 Diagnóstico já foi executado. Verifique o relatório acima.');
  }
};

// Função para ver relatório anterior
window.viewDiagnosticReport = function() {
  const report = localStorage.getItem('site_diagnostic_report');
  if (report) {
    console.log('📋 Relatório anterior:', JSON.parse(report));
  } else {
    console.log('ℹ️ Nenhum relatório encontrado. Execute um diagnóstico primeiro.');
  }
};
