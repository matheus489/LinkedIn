// LinkedIn Automation Pro - Dashboard Controller

class DashboardController {
  constructor() {
    this.currentTab = 'overview';
    this.campaigns = [];
    this.leads = [];
    this.connections = [];
    this.messages = [];
    this.templates = [];
    this.settings = {};
    this.charts = {};
    this.init();
  }

  async init() {
    // Aguardar DOM carregar
    document.addEventListener('DOMContentLoaded', () => {
      this.setupEventListeners();
      this.loadData();
      this.initializeCharts();
      this.updateUI();
    });
  }

  setupEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Botões de ação
    document.getElementById('refresh-stats').addEventListener('click', () => this.refreshStats());
    document.getElementById('start-campaign').addEventListener('click', () => this.startCampaign());
    document.getElementById('stop-campaign').addEventListener('click', () => this.stopCampaign());
    
    // Ações rápidas
    document.getElementById('new-campaign-btn').addEventListener('click', () => this.showCampaignModal());
    document.getElementById('export-leads-btn').addEventListener('click', () => this.exportLeads());
    document.getElementById('scrape-profiles-btn').addEventListener('click', () => this.scrapeProfiles());
    document.getElementById('settings-btn').addEventListener('click', () => this.switchTab('settings'));

    // Modais
    document.getElementById('modal-close').addEventListener('click', () => this.hideModal());
    document.querySelector('.modal-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.hideModal();
      }
    });

    // Formulários
    document.getElementById('general-settings-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveGeneralSettings();
    });

    document.getElementById('working-hours-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveWorkingHours();
    });

    // Filtros
    document.getElementById('connection-status-filter').addEventListener('change', (e) => {
      this.filterConnections(e.target.value);
    });

    // Date range picker
    document.getElementById('apply-date-range').addEventListener('click', () => {
      this.updateAnalytics();
    });
  }

  async loadData() {
    try {
      // Carregar dados do storage
      const result = await chrome.storage.local.get([
        'campaigns', 'leads', 'connections', 'messages', 'templates', 'settings', 'statistics'
      ]);

      this.campaigns = result.campaigns || [];
      this.leads = result.leads || [];
      this.connections = result.connections || [];
      this.messages = result.messages || [];
      this.templates = result.templates || {};
      this.settings = result.settings || this.getDefaultSettings();

      // Carregar dados específicos da aba atual
      this.loadTabData();

      // Atualizar estatísticas
      this.updateStats();

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.showNotification('Erro ao carregar dados', 'error');
    }
  }

  getDefaultSettings() {
    return {
      maxConnectionsPerDay: 50,
      maxMessagesPerDay: 100,
      connectionDelay: { min: 3000, max: 8000 },
      messageDelay: { min: 2000, max: 5000 },
      autoPauseOnResponse: true,
      autoCancelAfterDays: 7,
      workingHours: { start: 9, end: 18 },
      workingDays: [1, 2, 3, 4, 5]
    };
  }

  loadTabData() {
    switch (this.currentTab) {
      case 'campaigns':
        this.loadCampaigns();
        break;
      case 'leads':
        this.loadLeads();
        break;
      case 'connections':
        this.loadConnections();
        break;
      case 'messages':
        this.loadMessages();
        break;
      case 'templates':
        this.loadTemplates();
        break;
      case 'analytics':
        this.loadAnalytics();
        break;
      case 'settings':
        this.loadSettings();
        break;
    }
  }

  switchTab(tab) {
    // Remover classe ativa de todos os itens
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // Adicionar classe ativa ao item selecionado
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Mostrar aba selecionada
    document.getElementById(tab).classList.add('active');

    // Atualizar título e descrição
    this.updatePageInfo(tab);

    // Carregar dados da aba
    this.currentTab = tab;
    this.loadTabData();
  }

  updatePageInfo(tab) {
    const pageInfo = {
      overview: {
        title: 'Visão Geral',
        description: 'Dashboard principal da automação do LinkedIn'
      },
      campaigns: {
        title: 'Campanhas',
        description: 'Gerencie suas campanhas de automação'
      },
      leads: {
        title: 'Leads',
        description: 'Visualize e gerencie seus leads capturados'
      },
      connections: {
        title: 'Conexões',
        description: 'Histórico de conexões enviadas e recebidas'
      },
      messages: {
        title: 'Mensagens',
        description: 'Histórico de mensagens enviadas'
      },
      templates: {
        title: 'Templates',
        description: 'Gerencie templates de mensagens'
      },
      analytics: {
        title: 'Analytics',
        description: 'Relatórios e análises de performance'
      },
      settings: {
        title: 'Configurações',
        description: 'Configure a automação do LinkedIn'
      }
    };

    const info = pageInfo[tab];
    document.getElementById('page-title').textContent = info.title;
    document.getElementById('page-description').textContent = info.description;
  }

  async refreshStats() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'GET_STATUS' });
      this.updateStats(response);
      this.showNotification('Estatísticas atualizadas', 'success');
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      this.showNotification('Erro ao atualizar estatísticas', 'error');
    }
  }

  updateStats(data = null) {
    if (data) {
      // Atualizar com dados do background
      document.getElementById('today-connections').textContent = data.connectionCount || 0;
      document.getElementById('today-messages').textContent = data.messageCount || 0;
      
      // Atualizar status
      const statusDot = document.querySelector('.status-dot');
      const statusText = document.querySelector('.status-text');
      
      if (data.isRunning) {
        statusDot.classList.add('running');
        statusText.textContent = 'Executando';
      } else {
        statusDot.classList.remove('running');
        statusText.textContent = 'Parado';
      }
    } else {
      // Calcular estatísticas dos dados locais
      const today = new Date().toDateString();
      
      const todayConnections = this.connections.filter(conn => 
        new Date(conn.date).toDateString() === today
      ).length;
      
      const todayMessages = this.messages.filter(msg => 
        new Date(msg.date).toDateString() === today
      ).length;
      
      const acceptanceRate = this.calculateAcceptanceRate();
      
      document.getElementById('today-connections').textContent = todayConnections;
      document.getElementById('today-messages').textContent = todayMessages;
      document.getElementById('acceptance-rate').textContent = `${acceptanceRate}%`;
      
      // Atualizar métricas gerais
      document.getElementById('total-connections').textContent = this.connections.length;
      document.getElementById('total-messages').textContent = this.messages.length;
      document.getElementById('response-rate').textContent = `${this.calculateResponseRate()}%`;
    }
  }

  calculateAcceptanceRate() {
    if (this.connections.length === 0) return 0;
    
    const accepted = this.connections.filter(conn => conn.status === 'accepted').length;
    return Math.round((accepted / this.connections.length) * 100);
  }

  calculateResponseRate() {
    if (this.messages.length === 0) return 0;
    
    const responded = this.messages.filter(msg => msg.hasResponse).length;
    return Math.round((responded / this.messages.length) * 100);
  }

  async startCampaign() {
    try {
      const activeCampaign = this.campaigns.find(c => c.isActive);
      if (!activeCampaign) {
        this.showNotification('Nenhuma campanha ativa', 'warning');
        return;
      }

      const response = await chrome.runtime.sendMessage({
        action: 'START_CAMPAIGN',
        campaign: activeCampaign
      });

      if (response.success) {
        this.showNotification('Campanha iniciada com sucesso!', 'success');
        this.updateUI();
      } else {
        this.showNotification('Erro ao iniciar campanha', 'error');
      }
    } catch (error) {
      console.error('Erro ao iniciar campanha:', error);
      this.showNotification('Erro ao iniciar campanha', 'error');
    }
  }

  async stopCampaign() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'STOP_CAMPAIGN'
      });

      if (response.success) {
        this.showNotification('Campanha parada com sucesso!', 'success');
        this.updateUI();
      } else {
        this.showNotification('Erro ao parar campanha', 'error');
      }
    } catch (error) {
      console.error('Erro ao parar campanha:', error);
      this.showNotification('Erro ao parar campanha', 'error');
    }
  }

  showCampaignModal() {
    this.showModal('Nova Campanha', this.getCampaignModalContent());
  }

  getCampaignModalContent() {
    return `
      <form id="campaign-form">
        <div class="form-group">
          <label for="campaign-name">Nome da Campanha</label>
          <input type="text" id="campaign-name" required>
        </div>
        
        <div class="form-group">
          <label for="campaign-description">Descrição</label>
          <textarea id="campaign-description" rows="3"></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="max-connections">Máx. Conexões/Dia</label>
            <input type="number" id="max-connections" min="1" max="100" value="50">
          </div>
          <div class="form-group">
            <label for="max-messages">Máx. Mensagens/Dia</label>
            <input type="number" id="max-messages" min="1" max="200" value="100">
          </div>
        </div>
        
        <div class="form-group">
          <label for="connection-template">Template de Conexão</label>
          <textarea id="connection-template" rows="4" placeholder="Olá {{first_name}}, vi seu perfil e gostaria de conectar..."></textarea>
        </div>
        
        <div class="form-group">
          <label for="follow-up-template">Template de Follow-up</label>
          <textarea id="follow-up-template" rows="4" placeholder="Oi {{first_name}}, obrigado por aceitar minha conexão..."></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="dashboardController.hideModal()">Cancelar</button>
          <button type="submit" class="btn-primary">Salvar Campanha</button>
        </div>
      </form>
    `;
  }

  showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-overlay').classList.remove('hidden');
    
    // Setup form listeners if needed
    const form = document.getElementById('campaign-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveCampaign();
      });
    }
  }

  hideModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  async saveCampaign() {
    const formData = this.getCampaignFormData();
    
    if (!formData.name) {
      this.showNotification('Nome da campanha é obrigatório', 'error');
      return;
    }

    const campaign = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      isActive: false
    };

    this.campaigns.push(campaign);
    await chrome.storage.local.set({ campaigns: this.campaigns });

    this.hideModal();
    this.showNotification('Campanha salva com sucesso!', 'success');
    this.loadCampaigns();
  }

  getCampaignFormData() {
    return {
      name: document.getElementById('campaign-name').value,
      description: document.getElementById('campaign-description').value,
      maxConnectionsPerDay: parseInt(document.getElementById('max-connections').value) || 50,
      maxMessagesPerDay: parseInt(document.getElementById('max-messages').value) || 100,
      connectionTemplate: document.getElementById('connection-template').value,
      followUpTemplate: document.getElementById('follow-up-template').value
    };
  }

  async exportLeads() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'EXPORT_LEADS'
      });

      if (response.success && response.data) {
        this.downloadCSV(response.data, 'leads-linkedin.csv');
        this.showNotification('Leads exportados com sucesso!', 'success');
      } else {
        this.showNotification('Nenhum lead para exportar', 'warning');
      }
    } catch (error) {
      console.error('Erro ao exportar leads:', error);
      this.showNotification('Erro ao exportar leads', 'error');
    }
  }

  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async scrapeProfiles() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];

      if (!tab.url.includes('linkedin.com')) {
        this.showNotification('Abra uma página do LinkedIn primeiro', 'warning');
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'SCRAPE_PROFILES'
      });

      if (response.success) {
        const profiles = response.data;
        this.showNotification(`${profiles.length} perfis extraídos!`, 'success');
      } else {
        this.showNotification('Erro ao extrair perfis', 'error');
      }
    } catch (error) {
      console.error('Erro ao extrair perfis:', error);
      this.showNotification('Erro ao extrair perfis', 'error');
    }
  }

  async saveGeneralSettings() {
    const formData = this.getGeneralSettingsFormData();
    
    this.settings = { ...this.settings, ...formData };
    await chrome.storage.local.set({ settings: this.settings });

    // Atualizar configurações no background
    await chrome.runtime.sendMessage({
      action: 'UPDATE_SETTINGS',
      settings: formData
    });

    this.showNotification('Configurações salvas com sucesso!', 'success');
  }

  getGeneralSettingsFormData() {
    return {
      maxConnectionsPerDay: parseInt(document.getElementById('max-connections-per-day').value) || 50,
      maxMessagesPerDay: parseInt(document.getElementById('max-messages-per-day').value) || 100,
      autoCancelAfterDays: parseInt(document.getElementById('auto-cancel-days').value) || 7
    };
  }

  async saveWorkingHours() {
    const formData = this.getWorkingHoursFormData();
    
    this.settings = { ...this.settings, ...formData };
    await chrome.storage.local.set({ settings: this.settings });

    // Atualizar configurações no background
    await chrome.runtime.sendMessage({
      action: 'UPDATE_SETTINGS',
      settings: formData
    });

    this.showNotification('Horários salvos com sucesso!', 'success');
  }

  getWorkingHoursFormData() {
    const workingDays = Array.from(document.querySelectorAll('.weekday-checkboxes input[type="checkbox"]:checked'))
      .map(cb => parseInt(cb.value));

    return {
      workingHours: {
        start: parseInt(document.getElementById('work-start-time').value.split(':')[0]),
        end: parseInt(document.getElementById('work-end-time').value.split(':')[0])
      },
      workingDays: workingDays
    };
  }

  loadCampaigns() {
    const grid = document.getElementById('campaigns-grid');
    grid.innerHTML = '';

    this.campaigns.forEach(campaign => {
      const card = this.createCampaignCard(campaign);
      grid.appendChild(card);
    });
  }

  createCampaignCard(campaign) {
    const card = document.createElement('div');
    card.className = 'campaign-card';
    card.innerHTML = `
      <div class="campaign-card-header">
        <div class="campaign-card-title">${campaign.name}</div>
        <div class="campaign-card-subtitle">${campaign.description || 'Sem descrição'}</div>
      </div>
      <div class="campaign-card-content">
        <div class="campaign-stats">
          <div class="campaign-stat">
            <div class="campaign-stat-value">${campaign.maxConnectionsPerDay}</div>
            <div class="campaign-stat-label">Conexões/Dia</div>
          </div>
          <div class="campaign-stat">
            <div class="campaign-stat-value">${campaign.maxMessagesPerDay}</div>
            <div class="campaign-stat-label">Mensagens/Dia</div>
          </div>
        </div>
        <div class="campaign-actions">
          <button class="btn-primary" onclick="dashboardController.startCampaign('${campaign.id}')">
            <i class="fas fa-play"></i> Iniciar
          </button>
          <button class="btn-secondary" onclick="dashboardController.editCampaign('${campaign.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-danger" onclick="dashboardController.deleteCampaign('${campaign.id}')">
            <i class="fas fa-trash"></i> Excluir
          </button>
        </div>
      </div>
    `;
    return card;
  }

  loadLeads() {
    const tbody = document.getElementById('leads-table-body');
    tbody.innerHTML = '';

    this.leads.forEach(lead => {
      const row = this.createLeadRow(lead);
      tbody.appendChild(row);
    });
  }

  createLeadRow(lead) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${lead.name}</td>
      <td>${lead.title}</td>
      <td>${lead.company}</td>
      <td><span class="status-badge pending">Novo</span></td>
      <td>${new Date(lead.date).toLocaleDateString('pt-BR')}</td>
      <td>
        <button class="btn-icon" onclick="dashboardController.viewLead('${lead.id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon" onclick="dashboardController.exportLead('${lead.id}')">
          <i class="fas fa-download"></i>
        </button>
      </td>
    `;
    return row;
  }

  loadConnections() {
    const tbody = document.getElementById('connections-table-body');
    tbody.innerHTML = '';

    this.connections.forEach(connection => {
      const row = this.createConnectionRow(connection);
      tbody.appendChild(row);
    });
  }

  createConnectionRow(connection) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${connection.name}</td>
      <td>${connection.title}</td>
      <td>${connection.company}</td>
      <td><span class="status-badge ${connection.status}">${connection.status}</span></td>
      <td>${new Date(connection.date).toLocaleDateString('pt-BR')}</td>
      <td>
        <button class="btn-icon" onclick="dashboardController.viewConnection('${connection.id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon" onclick="dashboardController.messageConnection('${connection.id}')">
          <i class="fas fa-envelope"></i>
        </button>
      </td>
    `;
    return row;
  }

  loadMessages() {
    const list = document.getElementById('messages-list');
    list.innerHTML = '';

    this.messages.forEach(message => {
      const item = this.createMessageItem(message);
      list.appendChild(item);
    });
  }

  createMessageItem(message) {
    const item = document.createElement('div');
    item.className = 'message-item';
    item.innerHTML = `
      <div class="message-header">
        <div class="message-recipient">${message.recipientName}</div>
        <div class="message-date">${new Date(message.date).toLocaleDateString('pt-BR')}</div>
      </div>
      <div class="message-content">${message.content}</div>
      <div class="message-status">
        <span class="status-badge ${message.status}">${message.status}</span>
      </div>
    `;
    return item;
  }

  loadTemplates() {
    const grid = document.getElementById('templates-grid');
    grid.innerHTML = '';

    Object.keys(this.templates).forEach(type => {
      this.templates[type].forEach(template => {
        const card = this.createTemplateCard(template, type);
        grid.appendChild(card);
      });
    });
  }

  createTemplateCard(template, type) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <div class="template-card-header">
        <div class="template-card-title">${template.name}</div>
        <div class="template-card-subtitle">${type}</div>
      </div>
      <div class="template-card-content">
        <div class="template-content">${template.message.substring(0, 100)}...</div>
        <div class="template-actions">
          <button class="btn-secondary" onclick="dashboardController.editTemplate('${template.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-danger" onclick="dashboardController.deleteTemplate('${template.id}')">
            <i class="fas fa-trash"></i> Excluir
          </button>
        </div>
      </div>
    `;
    return card;
  }

  loadAnalytics() {
    // Os gráficos serão inicializados automaticamente
    this.updateAnalytics();
  }

  loadSettings() {
    // Preencher formulários com configurações atuais
    document.getElementById('max-connections-per-day').value = this.settings.maxConnectionsPerDay || 50;
    document.getElementById('max-messages-per-day').value = this.settings.maxMessagesPerDay || 100;
    document.getElementById('auto-cancel-days').value = this.settings.autoCancelAfterDays || 7;
    
    document.getElementById('work-start-time').value = this.formatTime(this.settings.workingHours?.start || 9);
    document.getElementById('work-end-time').value = this.formatTime(this.settings.workingHours?.end || 18);

    // Dias de trabalho
    const checkboxes = document.querySelectorAll('.weekday-checkboxes input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = this.settings.workingDays?.includes(parseInt(checkbox.value)) || false;
    });
  }

  formatTime(hour) {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  initializeCharts() {
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
      console.log('Chart.js não disponível, criando gráficos simples...');
      this.createSimpleCharts();
      return;
    }

    // Gráfico de conexões
    const connectionsCtx = document.getElementById('connections-chart');
    if (connectionsCtx) {
      this.charts.connections = new Chart(connectionsCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Conexões',
            data: [],
            borderColor: '#0077b5',
            backgroundColor: 'rgba(0, 119, 181, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Gráfico de aceitação
    const acceptanceCtx = document.getElementById('acceptance-chart');
    if (acceptanceCtx) {
      this.charts.acceptance = new Chart(acceptanceCtx, {
        type: 'doughnut',
        data: {
          labels: ['Aceitas', 'Pendentes', 'Rejeitadas'],
          datasets: [{
            data: [0, 0, 0],
            backgroundColor: ['#28a745', '#ffc107', '#dc3545']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // Gráfico de horários
    const timingCtx = document.getElementById('timing-chart');
    if (timingCtx) {
      this.charts.timing = new Chart(timingCtx, {
        type: 'bar',
        data: {
          labels: ['9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'],
          datasets: [{
            label: 'Conexões por Hora',
            data: [],
            backgroundColor: '#0077b5'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  createSimpleCharts() {
    // Criar gráficos simples sem Chart.js
    const connectionsCtx = document.getElementById('connections-chart');
    if (connectionsCtx) {
      connectionsCtx.innerHTML = '<div style="text-align: center; padding: 20px; color: #666; background: #f8f9fa; border-radius: 8px;"><h4>Gráfico de Conexões</h4><p>Chart.js não disponível</p><div style="margin-top: 10px; padding: 10px; background: #0077b5; color: white; border-radius: 4px;">Total: 0 conexões</div></div>';
    }

    const acceptanceCtx = document.getElementById('acceptance-chart');
    if (acceptanceCtx) {
      acceptanceCtx.innerHTML = '<div style="text-align: center; padding: 20px; color: #666; background: #f8f9fa; border-radius: 8px;"><h4>Taxa de Aceitação</h4><p>Chart.js não disponível</p><div style="margin-top: 10px;"><div style="display: inline-block; margin: 5px; padding: 10px; background: #28a745; color: white; border-radius: 4px;">Aceitas: 0</div><div style="display: inline-block; margin: 5px; padding: 10px; background: #ffc107; color: #333; border-radius: 4px;">Pendentes: 0</div></div></div>';
    }

    const timingCtx = document.getElementById('timing-chart');
    if (timingCtx) {
      timingCtx.innerHTML = '<div style="text-align: center; padding: 20px; color: #666; background: #f8f9fa; border-radius: 8px;"><h4>Conexões por Hora</h4><p>Chart.js não disponível</p><div style="margin-top: 10px; padding: 10px; background: #0077b5; color: white; border-radius: 4px;">Melhor horário: 15h (0 conexões)</div></div>';
    }
  }

  updateAnalytics() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // Filtrar dados por período
    const filteredConnections = this.connections.filter(conn => {
      const connDate = new Date(conn.date);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      return connDate >= start && connDate <= end;
    });

    // Atualizar gráfico de conexões
    if (this.charts.connections) {
      const dailyData = this.groupByDate(filteredConnections);
      this.charts.connections.data.labels = Object.keys(dailyData);
      this.charts.connections.data.datasets[0].data = Object.values(dailyData);
      this.charts.connections.update();
    }

    // Atualizar gráfico de aceitação
    if (this.charts.acceptance) {
      const accepted = filteredConnections.filter(c => c.status === 'accepted').length;
      const pending = filteredConnections.filter(c => c.status === 'pending').length;
      const rejected = filteredConnections.filter(c => c.status === 'rejected').length;
      
      this.charts.acceptance.data.datasets[0].data = [accepted, pending, rejected];
      this.charts.acceptance.update();
    }

    // Atualizar gráfico de horários
    if (this.charts.timing) {
      const hourlyData = this.groupByHour(filteredConnections);
      this.charts.timing.data.datasets[0].data = hourlyData;
      this.charts.timing.update();
    }
  }

  groupByDate(data) {
    const grouped = {};
    data.forEach(item => {
      const date = new Date(item.date).toLocaleDateString('pt-BR');
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return grouped;
  }

  groupByHour(data) {
    const hourly = new Array(10).fill(0);
    data.forEach(item => {
      const hour = new Date(item.date).getHours();
      if (hour >= 9 && hour <= 18) {
        hourly[hour - 9]++;
      }
    });
    return hourly;
  }

  filterConnections(status) {
    const tbody = document.getElementById('connections-table-body');
    tbody.innerHTML = '';

    const filtered = status ? 
      this.connections.filter(conn => conn.status === status) : 
      this.connections;

    filtered.forEach(connection => {
      const row = this.createConnectionRow(connection);
      tbody.appendChild(row);
    });
  }

  updateUI() {
    // Atualizar interface baseada no estado atual
    this.updateStats();
    this.loadTabData();
  }

  showNotification(message, type = 'info') {
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '10000',
      animation: 'slideIn 0.3s ease',
      maxWidth: '300px'
    });

    // Cores por tipo
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#0077b5'
    };

    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Inicializar dashboard
const dashboardController = new DashboardController();

// Adicionar estilos para animações de notificação
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
  }
  
  .message-item {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .message-recipient {
    font-weight: 600;
    color: #333;
  }
  
  .message-date {
    font-size: 12px;
    color: #6c757d;
  }
  
  .message-content {
    color: #495057;
    margin-bottom: 8px;
  }
  
  .message-status {
    text-align: right;
  }
  
  .template-content {
    background: #f8f9fa;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #495057;
  }
`;
document.head.appendChild(style);
