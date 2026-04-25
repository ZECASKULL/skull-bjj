/**
 * ==============================================
 * APLICAÇÃO: JIUJITSU STORE
 * ==============================================
 * Loja virtual de kimonos de jiu-jitsu com sistema
 * de produtos, filtros e interações.
 * 
 * @author: Jiujitsu Store
 * @version: 1.0.0
 * @since: 2024
 */

// ==============================================
// MÓDULO: CONFIGURAÇÃO
// ==============================================
const CONFIG = {
  // Configurações da loja
  STORE: {
    NAME: 'Jiujitsu Store',
    CURRENCY: 'R$',
    SHIPPING_COST: 0,
    FREE_SHIPPING_THRESHOLD: 1500
  },
  
  // Configurações de animação
  ANIMATION: {
    FADE_DURATION: 300,
    SLIDE_DURATION: 400,
    TRANSITION_DELAY: 50
  },
  
  // Configurações de acessibilidade
  ACCESSIBILITY: {
    KEYBOARD_NAVIGATION: true,
    FOCUS_OUTLINE_WIDTH: '2px'
  }
};

// ==============================================
// DADOS DOS PRODUTOS
// ==============================================
const PRODUCTS_DATA = [
  {
    id: 1,
    name: 'Kimono Masculino MIK Roots Jiu Jitsu Gi Azul',
    color: 'azul',
    price: 1299.95,
    discountPrice: 1234.95,
    installmentCount: 4,
    installmentValue: 340.49,
    badge: 'Novidade',
    reviews: 0,
    featured: true,
    emoji: '🥋',
    description: 'Kimono premium para competidores'
  },
  {
    id: 2,
    name: 'Kimono Masculino Ultralight 2.0 Jiu Jitsu Gi Branco',
    color: 'branco',
    price: 1199.95,
    discountPrice: 1139.95,
    installmentCount: 4,
    installmentValue: 314.29,
    badge: null,
    reviews: 3,
    featured: true,
    emoji: '⚪',
    description: 'Leve e resistente para treinos diários'
  },
  {
    id: 3,
    name: 'Kimono Masculino Balistico 4.0 Jiu Jitsu Gi',
    color: 'preto',
    price: 1249.95,
    discountPrice: 1187.45,
    installmentCount: 4,
    installmentValue: 327.39,
    badge: null,
    reviews: 2,
    featured: false,
    emoji: '⚫',
    description: 'Proteção máxima para competição'
  },
  {
    id: 4,
    name: 'Kimono Masculino MIK Roots Jiu Jitsu Gi Branco',
    color: 'branco',
    price: 1299.95,
    discountPrice: 1234.95,
    installmentCount: 4,
    installmentValue: 340.49,
    badge: null,
    reviews: 0,
    featured: false,
    emoji: '🤍',
    description: 'Tradição e qualidade em um kimono'
  },
  {
    id: 5,
    name: 'Kimono Masculino Tainan Players Special Jiu Jitsu Gi Preto Edição Limitada',
    color: 'preto',
    price: 1499.95,
    discountPrice: 1424.95,
    installmentCount: 4,
    installmentValue: 392.87,
    badge: 'Edição Limitada',
    reviews: 0,
    featured: true,
    emoji: '🏆',
    description: 'Exclusivo para jogadores avançados'
  },
  {
    id: 6,
    name: 'Kimono Masculino Tainan Players Special Jiu Jitsu Gi Branco Edição Limitada',
    color: 'branco',
    price: 1499.95,
    discountPrice: 1424.95,
    installmentCount: 4,
    installmentValue: 392.87,
    badge: 'Edição Limitada',
    reviews: 0,
    featured: false,
    emoji: '🌟',
    description: 'Design exclusivo edição limitada'
  }
];

// ==============================================
// MÓDULO: ESTADO DA APLICAÇÃO
// ==============================================
class JiujitsuStore {
  constructor() {
    this.products = [...PRODUCTS_DATA];
    this.filteredProducts = [...PRODUCTS_DATA];
    this.elements = {};
    this.filters = {
      color: '',
      price: '',
      sort: 'featured'
    };
    this.init();
  }

  /**
   * Inicializa a aplicação
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.renderProducts();
    this.setupInitialState();
    console.log('🥋 Jiujitsu Store inicializada com sucesso!');
  }

  /**
   * Cache dos elementos DOM para melhor performance
   */
  cacheElements() {
    this.elements = {
      productsGrid: document.getElementById('productsGrid'),
      colorFilter: document.getElementById('colorFilter'),
      priceFilter: document.getElementById('priceFilter'),
      sortFilter: document.getElementById('sortFilter'),
      welcomeMessage: document.getElementById('welcomeMessage')
    };

    // Validação de elementos essenciais
    Object.entries(this.elements).forEach(([key, element]) => {
      if (!element) {
        console.warn(`⚠️ Elemento não encontrado: ${key}`);
      }
    });
  }

  /**
   * Configura os event listeners
   */
  bindEvents() {
    // Event listeners para filtros
    if (this.elements.colorFilter) {
      this.elements.colorFilter.addEventListener('change', (e) => {
        this.handleFilterChange('color', e.target.value);
      });
    }

    if (this.elements.priceFilter) {
      this.elements.priceFilter.addEventListener('change', (e) => {
        this.handleFilterChange('price', e.target.value);
      });
    }

    if (this.elements.sortFilter) {
      this.elements.sortFilter.addEventListener('change', (e) => {
        this.handleFilterChange('sort', e.target.value);
      });
    }

    // Event listeners para navegação
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleNavigation(e.target.getAttribute('href'));
      });
    });
  }

  /**
   * Configura o estado inicial
   */
  setupInitialState() {
    this.updateWelcomeMessage();
    this.addAccessibilityAttributes();
  }

  /**
   * Adiciona atributos de acessibilidade
   */
  addAccessibilityAttributes() {
    // Adiciona atributos ARIA para melhor acessibilidade
    if (this.elements.productsGrid) {
      this.elements.productsGrid.setAttribute('role', 'region');
      this.elements.productsGrid.setAttribute('aria-label', 'Lista de produtos de kimonos');
    }

    // Adiciona navegação por teclado
    if (CONFIG.ACCESSIBILITY.KEYBOARD_NAVIGATION) {
      document.addEventListener('keydown', (e) => {
        this.handleKeyboardNavigation(e);
      });
    }
  }

  /**
   * Manipula mudanças nos filtros
   */
  handleFilterChange(filterType, value) {
    this.filters[filterType] = value;
    this.applyFilters();
    console.log(`🔍 Filtro ${filterType} alterado para: ${value}`);
  }

  /**
   * Aplica todos os filtros ativos
   */
  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      // Filtro de cor
      if (this.filters.color && product.color !== this.filters.color) {
        return false;
      }

      // Filtro de preço
      if (this.filters.price) {
        const price = product.discountPrice;
        switch (this.filters.price) {
          case 'low':
            if (price > 1200) return false;
            break;
          case 'medium':
            if (price < 1200 || price > 1400) return false;
            break;
          case 'high':
            if (price <= 1400) return false;
            break;
        }
      }

      return true;
    });

    // Aplica ordenação
    this.applySorting();
    
    // Renderiza produtos filtrados
    this.renderProducts();
  }

  /**
   * Aplica ordenação aos produtos
   */
  applySorting() {
    switch (this.filters.sort) {
      case 'featured':
        this.filteredProducts.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.discountPrice - b.discountPrice);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.discountPrice - a.discountPrice);
        break;
      case 'name':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
  }

  /**
   * Renderiza os produtos na grade
   */
  renderProducts() {
    if (!this.elements.productsGrid) return;

    // Mostra loading state
    this.showLoading();

    // Simula tempo de carregamento
    setTimeout(() => {
      if (this.filteredProducts.length === 0) {
        this.renderEmptyState();
        return;
      }

      const productsHTML = this.filteredProducts.map(product => 
        this.renderProduct(product)
      );

      this.elements.productsGrid.innerHTML = '';
      productsHTML.forEach(product => {
        this.elements.productsGrid.appendChild(product);
      });
      this.bindProductEvents();
      console.log(`📦 Renderizados ${this.filteredProducts.length} produtos`);
    }, 300);
  }

  /**
   * Renderiza um produto (com proteção de preços)
   * @param {Object} product - Dados do produto
   * @returns {HTMLElement} Elemento do produto
   */
  renderProduct(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.dataset.productId = product.id;
    
    // Obter preço seguro
    const securePrice = window.SecurityAPI ? 
      window.SecurityAPI.getSecurePrice(product.id) : 
      product.price;
    
    // Se não conseguir obter preço seguro, usar original
    const finalPrice = securePrice || product.price;
    const finalDiscountPrice = product.discountPrice ? 
      (securePrice * (product.discountPrice / product.price)) : 
      product.discountPrice;
    
    // Badge
    const badge = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
    
    // Emoji
    const emoji = product.emoji ? `<span class="product-emoji">${product.emoji}</span>` : '';
    
    // Preço com desconto (protegido)
    const priceDisplay = finalDiscountPrice 
      ? `<span class="price-original">R$ ${finalPrice.toFixed(2)}</span>
         <span class="price-discount">R$ ${finalDiscountPrice.toFixed(2)}</span>`
      : `<span class="price">R$ ${finalPrice.toFixed(2)}</span>`;
    
    // Parcelas
    const installments = product.installments 
      ? `<span class="installments">ou ${product.installments}x de R$ ${(finalDiscountPrice || finalPrice / product.installments).toFixed(2)}</span>`
      : '';
    
    // Avaliação
    const rating = product.rating 
      ? `<div class="product-rating">
           ${this.renderStars(product.rating)}
           <span class="rating-count">(${product.reviews})</span>
         </div>`
      : '';
    
    productCard.innerHTML = `
      <div class="product-image">
        ${emoji}
        ${badge}
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-meta">
          <div class="product-price">
            ${priceDisplay}
            ${installments}
          </div>
          ${rating}
        </div>
        <button class="add-to-cart" onclick="window.jiujitsuStore.addToCart('${product.id}')">
          Adicionar ao Carrinho
        </button>
      </div>
    `;
    
    // Adicionar atributo de segurança ao preço
    const priceElements = productCard.querySelectorAll('.price, .price-discount, .price-original');
    priceElements.forEach(el => {
      el.setAttribute('data-secure-price', 'true');
      el.setAttribute('data-product-id', product.id);
    });
    
    return productCard;
  }

  /**
   * Gera estrelas de avaliação
   */
  renderStars(rating) {
    const fullStars = Math.floor(rating / 5);
    const halfStar = rating % 5 >= 2.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return '★'.repeat(fullStars) + 
           (halfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  }

  /**
   * Mostra estado de carregamento
   */
  showLoading() {
    if (this.elements.productsGrid) {
      this.elements.productsGrid.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
        </div>
      `;
    }
  }

  /**
   * Renderiza estado vazio
   */
  renderEmptyState() {
    if (this.elements.productsGrid) {
      this.elements.productsGrid.innerHTML = `
        <div class="empty-state">
          <h3>Nenhum produto encontrado</h3>
          <p>Tente ajustar os filtros para encontrar o kimono perfeito para você.</p>
          <button class="product-button" onclick="window.jiujitsuStore.clearFilters()">
            Limpar Filtros
          </button>
        </div>
      `;
    }
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters() {
    this.filters = {
      color: '',
      price: '',
      sort: 'featured'
    };

    // Reseta os selects
    if (this.elements.colorFilter) this.elements.colorFilter.value = '';
    if (this.elements.priceFilter) this.elements.priceFilter.value = '';
    if (this.elements.sortFilter) this.elements.sortFilter.value = 'featured';

    this.applyFilters();
  }

  /**
   * Manipula clique em produto
   */
  handleProductClick(productId) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      console.log(`🛒 Produto selecionado: ${product.name}`);
      // Aqui poderia abrir um modal ou redirecionar para página de detalhes
      alert(`Produto: ${product.name}\nPreço: ${CONFIG.STORE.CURRENCY} ${product.discountPrice.toFixed(2)}\n\nEm uma loja real, isso abriria a página de detalhes do produto.`);
    }
  }

  /**
   * Manipula navegação
   */
  handleNavigation(href) {
    // Remove classe active de todos os links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Adiciona classe active ao link clicado
    const activeLink = document.querySelector(`[href="${href}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    // Scroll suave para a seção
    if (href === '#products') {
      scrollToProducts();
    }
  }

  /**
   * Manipula navegação por teclado
   */
  handleKeyboardNavigation(e) {
    // Implementa navegação por teclado para acessibilidade
    if (e.key === 'Tab') {
      // Deixa o comportamento padrão do Tab
      return;
    }
  }

  /**
   * Atualiza mensagem de boas-vindas
   */
  updateWelcomeMessage() {
    if (this.elements.welcomeMessage) {
      const hour = new Date().getHours();
      let greeting = 'Bem-vindo';
      
      if (hour < 12) greeting = 'Bom dia';
      else if (hour < 18) greeting = 'Boa tarde';
      else greeting = 'Boa noite';
      
      this.elements.welcomeMessage.textContent = `${greeting}!`;
    }
  }

  /**
   * Obtém produtos filtrados
   */
  getFilteredProducts() {
    return this.filteredProducts;
  }

  /**
   * Obtém estatísticas da loja
   */
  getStoreStats() {
    return {
      totalProducts: this.products.length,
      filteredProducts: this.filteredProducts.length,
      averagePrice: this.products.reduce((sum, p) => sum + p.discountPrice, 0) / this.products.length,
      colors: [...new Set(this.products.map(p => p.color))]
    };
  }
}

// ==============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
  // Verifica se o DOM está pronto
  if (document.readyState === 'loading') {
    console.log('⏳ Aguardando carregamento do DOM...');
  }

  // Cria instância da aplicação
  window.jiujitsuStore = new JiujitsuStore();
  
  // Expõe a instância globalmente para debug
  console.log('✅ Jiujitsu Store disponível globalmente como: window.jiujitsuStore');
});

// ==============================================
// FUNÇÕES GLOBAIS
// ==============================================

/**
 * Scroll suave para seção específica
 */
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

/**
 * Scroll suave para seção de produtos (mantido para compatibilidade)
 */
function scrollToProducts() {
  scrollToSection('products');
}

/**
 * Manipula logout do usuário
 */
function handleLogout() {
  if (confirm('Tem certeza que deseja sair?')) {
    console.log('👋 Usuário fazendo logout...');
    // Aqui poderia limpar sessão, localStorage, etc.
    alert('Logout realizado com sucesso!');
    // Redirecionar para login ou página inicial
    window.location.reload();
  }
}

/**
 * Formata valor monetário
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// ==============================================
// UTILITÁRIOS E DEBUG
// ==============================================
const StoreUtils = {
  /**
   * Lista todos os produtos disponíveis
   */
  listProducts() {
    if (window.jiujitsuStore) {
      console.table(window.jiujitsuStore.products.map((product, index) => ({
        id: product.id,
        nome: product.name,
        cor: product.color,
        preco_original: formatCurrency(product.price),
        preco_desconto: formatCurrency(product.discountPrice),
        destaque: product.featured ? 'Sim' : 'Não'
      })));
    }
  },

  /**
   * Mostra estatísticas da loja
   */
  showStats() {
    if (window.jiujitsuStore) {
      const stats = window.jiujitsuStore.getStoreStats();
      console.table({
        'Total de Produtos': stats.totalProducts,
        'Produtos Filtrados': stats.filteredProducts,
        'Preço Médio': formatCurrency(stats.averagePrice),
        'Cores Disponíveis': stats.colors.join(', ')
      });
    }
  },

  /**
   * Mostra produtos filtrados atuais
   */
  showFilteredProducts() {
    if (window.jiujitsuStore) {
      const filtered = window.jiujitsuStore.getFilteredProducts();
      console.log(`📦 Produtos filtrados (${filtered.length}):`, filtered);
    }
  },

  /**
   * Simula busca de produto
   */
  searchProduct(query) {
    if (window.jiujitsuStore) {
      const results = window.jiujitsuStore.products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      console.log(`🔍 Busca por "${query}":`, results);
      return results;
    }
  },

  /**
   * Testa filtros
   */
  testFilters() {
    if (window.jiujitsuStore) {
      console.log('🧪 Testando filtros...');
      
      // Testa filtro por cor
      window.jiujitsuStore.handleFilterChange('color', 'azul');
      setTimeout(() => {
        window.jiujitsuStore.handleFilterChange('color', '');
        window.jiujitsuStore.handleFilterChange('price', 'low');
        setTimeout(() => {
          window.jiujitsuStore.clearFilters();
          console.log('✅ Testes de filtros concluídos');
        }, 1000);
      }, 1000);
    }
  },

  /**
   * Valida estrutura do site
   */
  validateSite() {
    const checks = {
      'Products Grid': !!document.getElementById('productsGrid'),
      'Color Filter': !!document.getElementById('colorFilter'),
      'Price Filter': !!document.getElementById('priceFilter'),
      'Sort Filter': !!document.getElementById('sortFilter'),
      'Store Header': !!document.querySelector('.store-header'),
      'Products Section': !!document.querySelector('.products-section'),
      'Footer': !!document.querySelector('.store-footer')
    };

    console.table(Object.entries(checks).map(([element, exists]) => ({
      Elemento: element,
      Status: exists ? '✅ OK' : '❌ Ausente'
    })));

    const allGood = Object.values(checks).every(Boolean);
    console.log(allGood ? '🎉 Estrutura do site válida!' : '⚠️ Problemas na estrutura encontrados');
    
    return allGood;
  }
};

// Expõe utilitários globalmente para debug
window.StoreUtils = StoreUtils;

// ==============================================
// EVENTOS ADICIONAIS
// ==============================================

// Melhora a experiência de navegação
document.addEventListener('DOMContentLoaded', () => {
  // Adiciona feedback visual aos links de navegação
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateY(-1px)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translateY(0)';
    });
  });

  // Adiciona smooth scroll para todos os links internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Lazy loading simulation para imagens
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          imageObserver.unobserve(entry.target);
        }
      });
    });

    document.querySelectorAll('.product-image').forEach(img => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      imageObserver.observe(img);
    });
  }

  console.log('🚀 Eventos adicionais configurados');
});
