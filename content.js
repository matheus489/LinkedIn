// Content Script para LinkedIn Automation Pro
// Executa automações diretamente no LinkedIn

// Verificar se já foi inicializado para evitar duplicação
if (typeof window.linkedInAutomation === 'undefined') {
  class LinkedInAutomation {
    constructor() {
      this.isRunning = false;
      this.currentCampaign = null;
      this.processedProfiles = new Set();
      this.connectionCount = 0;
      this.messageCount = 0;
      this.lastActionTime = 0;
      this.init();
    }

  async init() {
    // Aguardar carregamento da página
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }

    // Listener para mensagens do background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });

    // Observer para mudanças na página
    this.setupObserver();
  }

  setup() {
    // Injetar CSS personalizado
    this.injectStyles();
    
    // Criar interface da extensão
    this.createInterface();
    
    // Carregar dados salvos
    this.loadStoredData();
  }

  setupObserver() {
    // Observer para detectar mudanças na página
    const observer = new MutationObserver((mutations) => {
      if (this.isRunning) {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            this.handlePageChanges(mutation);
          }
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  handlePageChanges(mutation) {
    // Detectar novos perfis carregados
    const addedNodes = Array.from(mutation.addedNodes);
    
    addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const profileCards = node.querySelectorAll('[data-testid="entity-result"]');
        profileCards.forEach(card => this.processProfileCard(card));
      }
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'START_AUTOMATION':
          await this.startAutomation(request.campaign);
          sendResponse({ success: true });
          break;
        
        case 'STOP_AUTOMATION':
          await this.stopAutomation();
          sendResponse({ success: true });
          break;
        
        case 'GET_STATUS':
          sendResponse({
            isRunning: this.isRunning,
            connectionCount: this.connectionCount,
            messageCount: this.messageCount,
            currentPage: window.location.href
          });
          break;
        
        case 'SCRAPE_PROFILES':
          const profiles = await this.scrapeCurrentPage();
          sendResponse({ success: true, data: profiles });
          break;
        
        case 'PING':
          sendResponse({ success: true, message: 'pong' });
          break;
        
        default:
          sendResponse({ success: false, error: 'Ação não reconhecida' });
      }
    } catch (error) {
      console.error('Erro no handleMessage:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async startAutomation(campaign) {
    if (this.isRunning) {
      console.log('Automação já está em execução, parando primeiro...');
      await this.stopAutomation();
    }

    this.currentCampaign = campaign;
    this.isRunning = true;
    this.connectionCount = 0;
    this.messageCount = 0;

    // Verificar se estamos na página correta
    if (!this.isValidPage()) {
      throw new Error('Página não suportada para automação');
    }

    // Iniciar processo de automação
    this.updateInterface();
    await this.processCurrentPage();

    // Configurar intervalo para processamento contínuo
    this.automationInterval = setInterval(() => {
      if (this.isRunning) {
        this.processCurrentPage();
      }
    }, 5000); // Verificar a cada 5 segundos
  }

  async stopAutomation() {
    this.isRunning = false;
    this.currentCampaign = null;

    if (this.automationInterval) {
      clearInterval(this.automationInterval);
      this.automationInterval = null;
    }

    this.updateInterface();
    
    // Salvar estatísticas
    await this.saveStatistics();
  }

  isValidPage() {
    const url = window.location.href;
    
    // Verificar se é uma página de login
    if (url.includes('linkedin.com/login') || 
        url.includes('linkedin.com/signup') ||
        url.includes('linkedin.com/checkpoint') ||
        document.querySelector('.login__form') ||
        document.querySelector('[data-testid="login-form"]') ||
        document.querySelector('input[name="session_key"]') ||
        document.querySelector('input[name="email"]')) {
      console.log('Página de login detectada');
      return false;
    }
    
    // Verificar se é uma página válida para automação
    const isValid = url.includes('linkedin.com/search/results/people') ||
                   url.includes('linkedin.com/mynetwork/invite-connect') ||
                   url.includes('linkedin.com/feed') ||
                   url.includes('linkedin.com/search/results/') ||
                   url.includes('linkedin.com/in/');
    
    console.log('Página válida para automação:', isValid);
    return isValid;
  }

  async processCurrentPage() {
    if (!this.isRunning) return;

    // Verificar limites diários
    if (this.connectionCount >= this.currentCampaign.maxConnectionsPerDay) {
      console.log('Limite diário de conexões atingido');
      return;
    }

    // Processar perfis na página atual
    const profileCards = document.querySelectorAll('[data-testid="entity-result"]');
    
    for (const card of profileCards) {
      if (!this.isRunning) break;
      
      await this.processProfileCard(card);
      
      // Delay aleatório entre ações
      await this.randomDelay();
    }

    // Processar conexões pendentes
    await this.processPendingConnections();
  }

  async processProfileCard(card) {
    try {
      // Extrair informações do perfil
      const profileInfo = this.extractProfileInfo(card);
      
      if (!profileInfo || this.processedProfiles.has(profileInfo.id)) {
        return;
      }

      this.processedProfiles.add(profileInfo.id);

      // Verificar se deve conectar
      if (this.shouldConnect(profileInfo)) {
        await this.sendConnectionRequest(card, profileInfo);
      }

      // Salvar lead
      await this.saveLead(profileInfo);

    } catch (error) {
      console.error('Erro ao processar perfil:', error);
    }
  }

  extractProfileInfo(card) {
    try {
      console.log('Extraindo informações do card:', card);
      
      // Extrair nome - tentar múltiplos seletores
      let name = '';
      const nameSelectors = [
        '[data-testid="name"]',
        '.entity-result__title-text',
        '.search-result__title',
        '.result-card__title',
        '.artdeco-entity-lockup__title',
        'h3',
        'h2',
        '.name',
        '[data-testid="title"]'
      ];
      
      for (const selector of nameSelectors) {
        const nameElement = card.querySelector(selector);
        if (nameElement && nameElement.textContent.trim()) {
          name = nameElement.textContent.trim();
          console.log(`Nome encontrado com seletor "${selector}":`, name);
          break;
        }
      }

      // Extrair cargo - tentar múltiplos seletores
      let title = '';
      const titleSelectors = [
        '[data-testid="title"]',
        '.entity-result__primary-subtitle',
        '.search-result__subtitle',
        '.result-card__subtitle',
        '.artdeco-entity-lockup__subtitle',
        '.job-title',
        '.position',
        '.role',
        '[data-testid="job-title"]'
      ];
      
      for (const selector of titleSelectors) {
        const titleElement = card.querySelector(selector);
        if (titleElement && titleElement.textContent.trim()) {
          title = titleElement.textContent.trim();
          console.log(`Cargo encontrado com seletor "${selector}":`, title);
          break;
        }
      }

      // Extrair empresa - tentar múltiplos seletores
      let company = '';
      const companySelectors = [
        '[data-testid="company"]',
        '.entity-result__secondary-subtitle',
        '.search-result__company',
        '.result-card__company',
        '.artdeco-entity-lockup__company',
        '.company',
        '.organization',
        '[data-testid="organization"]'
      ];
      
      for (const selector of companySelectors) {
        const companyElement = card.querySelector(selector);
        if (companyElement && companyElement.textContent.trim()) {
          company = companyElement.textContent.trim();
          console.log(`Empresa encontrada com seletor "${selector}":`, company);
          break;
        }
      }

      // Extrair link do perfil
      let profileUrl = '';
      const linkElement = card.querySelector('a[href*="/in/"]') || 
                         card.querySelector('a[href*="linkedin.com/in/"]');
      
      if (linkElement) {
        profileUrl = linkElement.href;
        console.log('Link do perfil encontrado:', profileUrl);
      } else if (card.href && card.href.includes('/in/')) {
        profileUrl = card.href;
        console.log('Link do perfil encontrado no card:', profileUrl);
      }

      // Extrair ID do perfil
      const profileId = this.extractProfileId(profileUrl);

      // Se não conseguiu extrair nome, tentar do texto do card
      if (!name && card.textContent) {
        const text = card.textContent.trim();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          name = lines[0].trim();
          console.log('Nome extraído do texto do card:', name);
        }
      }

      // Se não conseguiu extrair cargo, tentar da segunda linha
      if (!title && card.textContent) {
        const text = card.textContent.trim();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 1) {
          title = lines[1].trim();
          console.log('Cargo extraído do texto do card:', title);
        }
      }

      // Se não conseguiu extrair empresa, tentar da terceira linha
      if (!company && card.textContent) {
        const text = card.textContent.trim();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 2) {
          company = lines[2].trim();
          console.log('Empresa extraída do texto do card:', company);
        }
      }

      const profileInfo = {
        id: profileId,
        name: name,
        firstName: name.split(' ')[0],
        title: title,
        company: company,
        profileUrl: profileUrl,
        date: new Date().toISOString()
      };

      console.log('Informações extraídas:', profileInfo);
      return profileInfo;
    } catch (error) {
      console.error('Erro ao extrair informações do perfil:', error);
      return null;
    }
  }

  extractProfileId(url) {
    const match = url.match(/\/in\/([^\/\?]+)/);
    return match ? match[1] : '';
  }

  createVirtualCard(link) {
    try {
      // Encontrar o container pai que pode conter informações do perfil
      let container = link.closest('[data-testid="entity-result"]') ||
                     link.closest('.entity-result') ||
                     link.closest('.search-result__info') ||
                     link.closest('.search-result') ||
                     link.closest('.result-card') ||
                     link.closest('.artdeco-entity-lockup') ||
                     link.closest('.search-result__wrapper') ||
                     link.closest('.entity-result__item') ||
                     link.closest('.search-result__item') ||
                     link.closest('.people-search-result') ||
                     link.closest('.search-result__card') ||
                     link.closest('.entity-result__card') ||
                     link.parentElement;

      // Se não encontrou container, usar o link como base
      if (!container) {
        container = link;
      }

      // Criar um card virtual com as informações disponíveis
      const virtualCard = {
        querySelector: (selector) => {
          // Tentar encontrar elementos dentro do container
          const element = container.querySelector(selector);
          if (element) return element;
          
          // Se não encontrou, tentar no link
          return link.querySelector(selector);
        },
        textContent: link.textContent || '',
        href: link.href || ''
      };

      return virtualCard;
    } catch (error) {
      console.error('Erro ao criar card virtual:', error);
      return null;
    }
  }

  shouldConnect(profileInfo) {
    // Verificar filtros da campanha
    if (this.currentCampaign.filters) {
      const filters = this.currentCampaign.filters;
      
      // Filtro por empresa
      if (filters.companies && filters.companies.length > 0) {
        const hasMatchingCompany = filters.companies.some(company => 
          profileInfo.company.toLowerCase().includes(company.toLowerCase())
        );
        if (!hasMatchingCompany) return false;
      }

      // Filtro por cargo
      if (filters.titles && filters.titles.length > 0) {
        const hasMatchingTitle = filters.titles.some(title => 
          profileInfo.title.toLowerCase().includes(title.toLowerCase())
        );
        if (!hasMatchingTitle) return false;
      }
    }

    return true;
  }

  async sendConnectionRequest(card, profileInfo) {
    try {
      // Encontrar botão de conectar
      const connectButton = card.querySelector('[aria-label*="Conectar"]') ||
                           card.querySelector('[aria-label*="Connect"]') ||
                           card.querySelector('button[aria-label*="Invite"]');

      if (!connectButton) {
        console.log('Botão de conectar não encontrado');
        return;
      }

      // Verificar se já está conectado
      if (connectButton.textContent.includes('Conectado') || 
          connectButton.textContent.includes('Connected')) {
        return;
      }

      // Clicar no botão
      connectButton.click();
      await this.randomDelay(1000, 2000);

      // Verificar se apareceu modal de personalização
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        await this.customizeConnectionMessage(modal, profileInfo);
      }

      // Registrar conexão
      this.connectionCount++;
      await this.saveConnection(profileInfo);

      console.log(`Conexão enviada para: ${profileInfo.name}`);

    } catch (error) {
      console.error('Erro ao enviar conexão:', error);
    }
  }

  async customizeConnectionMessage(modal, profileInfo) {
    try {
      // Encontrar campo de mensagem
      const messageField = modal.querySelector('textarea') ||
                          modal.querySelector('[contenteditable="true"]');

      if (messageField && this.currentCampaign.connectionTemplate) {
        // Personalizar mensagem
        const personalizedMessage = this.personalizeMessage(
          this.currentCampaign.connectionTemplate,
          profileInfo
        );

        // Inserir mensagem
        if (messageField.tagName === 'TEXTAREA') {
          messageField.value = personalizedMessage;
          messageField.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          messageField.textContent = personalizedMessage;
          messageField.dispatchEvent(new Event('input', { bubbles: true }));
        }

        await this.randomDelay(500, 1000);
      }

      // Enviar convite
      const sendButton = modal.querySelector('[aria-label*="Enviar"]') ||
                        modal.querySelector('[aria-label*="Send"]') ||
                        modal.querySelector('button[type="submit"]');

      if (sendButton) {
        sendButton.click();
        await this.randomDelay(2000, 4000);
      }

    } catch (error) {
      console.error('Erro ao personalizar mensagem:', error);
    }
  }

  personalizeMessage(template, profileInfo) {
    return template
      .replace(/\{\{first_name\}\}/g, profileInfo.firstName)
      .replace(/\{\{name\}\}/g, profileInfo.name)
      .replace(/\{\{empresa\}\}/g, profileInfo.company)
      .replace(/\{\{cargo\}\}/g, profileInfo.title);
  }

  async processPendingConnections() {
    // Verificar conexões aceitas e enviar mensagens
    const acceptedConnections = await this.getAcceptedConnections();
    
    for (const connection of acceptedConnections) {
      if (this.shouldSendFollowUp(connection)) {
        await this.sendFollowUpMessage(connection);
      }
    }
  }

  async getAcceptedConnections() {
    // Implementar verificação de conexões aceitas
    // Isso pode ser feito verificando a página de conexões ou notificações
    return [];
  }

  shouldSendFollowUp(connection) {
    // Verificar se já passou tempo suficiente desde a aceitação
    const now = new Date();
    const acceptedDate = new Date(connection.acceptedDate);
    const daysDiff = (now - acceptedDate) / (1000 * 60 * 60 * 24);
    
    return daysDiff >= this.currentCampaign.followUpDelay;
  }

  async sendFollowUpMessage(connection) {
    try {
      // Navegar para o perfil
      window.open(connection.profileUrl, '_blank');
      
      // Aguardar carregamento
      await this.randomDelay(3000, 5000);
      
      // Encontrar botão de mensagem
      const messageButton = document.querySelector('[aria-label*="Mensagem"]') ||
                           document.querySelector('[aria-label*="Message"]');
      
      if (messageButton) {
        messageButton.click();
        await this.randomDelay(1000, 2000);
        
        // Enviar mensagem personalizada
        const messageField = document.querySelector('[contenteditable="true"]');
        if (messageField && this.currentCampaign.followUpTemplate) {
          const personalizedMessage = this.personalizeMessage(
            this.currentCampaign.followUpTemplate,
            connection
          );
          
          messageField.textContent = personalizedMessage;
          messageField.dispatchEvent(new Event('input', { bubbles: true }));
          
          // Enviar
          const sendButton = document.querySelector('[aria-label*="Enviar"]');
          if (sendButton) {
            sendButton.click();
            this.messageCount++;
            await this.saveMessage(connection, personalizedMessage);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao enviar follow-up:', error);
    }
  }

  async scrapeCurrentPage() {
    const profiles = [];
    
    console.log('Iniciando extração de perfis...');
    console.log('URL atual:', window.location.href);
    
    // Verificar se estamos na página correta
    if (!this.isValidPage()) {
      console.log('Página não suportada para extração de perfis');
      return profiles;
    }
    
    // Aguardar um pouco para garantir que a página carregou completamente
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Tentar diferentes seletores para encontrar cards de perfis
    let profileCards = [];
    const selectors = [
      '[data-testid="entity-result"]',
      '.entity-result',
      '.search-result__info',
      '[data-testid="result-card"]',
      '.search-result',
      '.result-card',
      '[data-testid="search-result"]',
      '.artdeco-entity-lockup',
      '.search-result__wrapper',
      '.entity-result__item',
      '.search-result__item',
      '[data-testid="people-search-result"]',
      '.people-search-result',
      '.search-result__card',
      '.entity-result__card'
    ];
    
    console.log('Testando seletores...');
    for (const selector of selectors) {
      const cards = document.querySelectorAll(selector);
      console.log(`Seletor "${selector}": ${cards.length} encontrados`);
      
      if (cards.length > 0) {
        profileCards = Array.from(cards);
        console.log(`Usando seletor: ${selector}`);
        break;
      }
    }
    
    // Se ainda não encontrou, tentar buscar por links de perfil
    if (profileCards.length === 0) {
      console.log('Tentando buscar por links de perfil...');
      const profileLinks = document.querySelectorAll('a[href*="/in/"]');
      console.log(`Links de perfil encontrados: ${profileLinks.length}`);
      
      // Criar cards virtuais baseados nos links
      profileLinks.forEach((link, index) => {
        const card = this.createVirtualCard(link);
        if (card) {
          profileCards.push(card);
        }
      });
    }
    
    console.log(`Total de cards de perfis encontrados: ${profileCards.length}`);
    
    // Aguardar um pouco mais para garantir que o DOM está estável
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    profileCards.forEach((card, index) => {
      console.log(`Processando card ${index + 1}:`, card);
      const profileInfo = this.extractProfileInfo(card);
      if (profileInfo) {
        console.log('Perfil extraído:', profileInfo);
        profiles.push(profileInfo);
      } else {
        console.log('Falha ao extrair perfil do card');
      }
    });
    
    console.log(`Total de perfis extraídos: ${profiles.length}`);
    return profiles;
  }

  async saveLead(profileInfo) {
    try {
      const result = await chrome.storage.local.get('leads');
      const leads = result.leads || [];
      
      // Verificar se já existe
      const existingIndex = leads.findIndex(lead => lead.id === profileInfo.id);
      if (existingIndex >= 0) {
        leads[existingIndex] = { ...leads[existingIndex], ...profileInfo };
      } else {
        leads.push(profileInfo);
      }
      
      await chrome.storage.local.set({ leads });
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  }

  async saveConnection(profileInfo) {
    try {
      const result = await chrome.storage.local.get('connections');
      const connections = result.connections || [];
      
      connections.push({
        ...profileInfo,
        status: 'pending',
        date: new Date().toISOString()
      });
      
      await chrome.storage.local.set({ connections });
    } catch (error) {
      console.error('Erro ao salvar conexão:', error);
    }
  }

  async saveMessage(connection, message) {
    try {
      const result = await chrome.storage.local.get('messages');
      const messages = result.messages || [];
      
      messages.push({
        connectionId: connection.id,
        message: message,
        date: new Date().toISOString(),
        status: 'sent'
      });
      
      await chrome.storage.local.set({ messages });
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  }

  async saveStatistics() {
    try {
      const stats = {
        connectionCount: this.connectionCount,
        messageCount: this.messageCount,
        date: new Date().toISOString()
      };
      
      const result = await chrome.storage.local.get('statistics');
      const statistics = result.statistics || [];
      statistics.push(stats);
      
      await chrome.storage.local.set({ statistics });
    } catch (error) {
      console.error('Erro ao salvar estatísticas:', error);
    }
  }

  async loadStoredData() {
    try {
      const result = await chrome.storage.local.get(['leads', 'connections', 'messages']);
      // Carregar dados salvos se necessário
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
    }
  }

  async randomDelay(min = 2000, max = 5000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .linkedin-automation-overlay {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #0077b5;
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 250px;
      }
      
      .linkedin-automation-overlay h3 {
        margin: 0 0 10px 0;
        font-size: 16px;
      }
      
      .linkedin-automation-overlay .status {
        font-size: 14px;
        margin-bottom: 10px;
      }
      
      .linkedin-automation-overlay .stats {
        font-size: 12px;
        opacity: 0.9;
      }
      
      .linkedin-automation-overlay .controls {
        margin-top: 10px;
      }
      
      .linkedin-automation-overlay button {
        background: #fff;
        color: #0077b5;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-right: 5px;
      }
      
      .linkedin-automation-overlay button:hover {
        background: #f0f0f0;
      }
    `;
    document.head.appendChild(style);
  }

  createInterface() {
    const overlay = document.createElement('div');
    overlay.className = 'linkedin-automation-overlay';
    overlay.innerHTML = `
      <h3>LinkedIn Automation Pro</h3>
      <div class="status">Status: <span id="automation-status">Parado</span></div>
      <div class="stats">
        <div>Conexões: <span id="connection-count">0</span></div>
        <div>Mensagens: <span id="message-count">0</span></div>
      </div>
      <div class="controls">
        <button id="start-automation">Iniciar</button>
        <button id="stop-automation">Parar</button>
        <button id="open-dashboard">Dashboard</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Event listeners
    document.getElementById('start-automation').addEventListener('click', () => {
      this.startAutomation(this.currentCampaign);
    });
    
    document.getElementById('stop-automation').addEventListener('click', () => {
      this.stopAutomation();
    });
    
    document.getElementById('open-dashboard').addEventListener('click', () => {
      this.openDashboard();
    });
  }

  updateInterface() {
    const statusElement = document.getElementById('automation-status');
    const connectionElement = document.getElementById('connection-count');
    const messageElement = document.getElementById('message-count');
    
    if (statusElement) {
      statusElement.textContent = this.isRunning ? 'Executando' : 'Parado';
    }
    
    if (connectionElement) {
      connectionElement.textContent = this.connectionCount;
    }
    
    if (messageElement) {
      messageElement.textContent = this.messageCount;
    }
  }

  openDashboard() {
    chrome.runtime.sendMessage({ action: 'OPEN_DASHBOARD' });
  }
}

  // Inicializar automação
  window.linkedInAutomation = new LinkedInAutomation();
}
