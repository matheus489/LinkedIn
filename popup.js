// LinkedIn Automation Pro - Popup Controller

class PopupController {
  constructor() {
    this.currentCampaign = null;
    this.isRunning = false;
    this.campaigns = [];
    this.settings = {};
    this.init();
  }

  async init() {
    // Aguardar DOM carregar
    document.addEventListener('DOMContentLoaded', () => {
      this.setupEventListeners();
      this.loadData();
      this.updateUI();
    });
  }

  setupEventListeners() {
    // Botões principais
    document.getElementById('start-btn').addEventListener('click', () => this.startAutomation());
    document.getElementById('stop-btn').addEventListener('click', () => this.stopAutomation());
    document.getElementById('pause-btn').addEventListener('click', () => this.pauseAutomation());

    // Botões de ação rápida
    document.getElementById('new-campaign-btn').addEventListener('click', () => this.showCampaignModal());
    document.getElementById('scrape-profiles-btn').addEventListener('click', () => this.scrapeProfiles());
    document.getElementById('export-leads-btn').addEventListener('click', () => this.exportLeads());
    document.getElementById('open-dashboard-btn').addEventListener('click', () => this.openDashboard());
    document.getElementById('settings-btn').addEventListener('click', () => this.showSettingsModal());

    // Seletores de campanha
    document.getElementById('campaign-select').addEventListener('change', (e) => {
      this.selectCampaign(e.target.value);
    });

    // Modais
    this.setupModalListeners();
    
    // Formulários
    this.setupFormListeners();

    // Atualização automática
    setInterval(() => this.updateStats(), 5000);
  }

  setupModalListeners() {
    // Modal de campanha
    document.getElementById('campaign-modal-close').addEventListener('click', () => this.hideCampaignModal());
    document.getElementById('cancel-campaign').addEventListener('click', () => this.hideCampaignModal());

    // Modal de configurações
    document.getElementById('settings-modal-close').addEventListener('click', () => this.hideSettingsModal());
    document.getElementById('cancel-settings').addEventListener('click', () => this.hideSettingsModal());

    // Fechar modais clicando fora
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.add('hidden');
        }
      });
    });
  }

  setupFormListeners() {
    // Formulário de campanha
    document.getElementById('campaign-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCampaign();
    });

    // Formulário de configurações
    document.getElementById('settings-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSettings();
    });
  }

  async loadData() {
    try {
      // Carregar campanhas
      const result = await chrome.storage.local.get(['campaigns', 'settings', 'statistics']);
      this.campaigns = result.campaigns || [];
      this.settings = result.settings || this.getDefaultSettings();
      
      // Carregar estatísticas do dia
      this.loadTodayStats(result.statistics || []);
      
      // Carregar campanha ativa
      const activeResult = await chrome.storage.local.get('activeCampaign');
      if (activeResult.activeCampaign) {
        this.currentCampaign = activeResult.activeCampaign;
        this.isRunning = true;
      }

      this.populateCampaignSelect();
      this.populateSettingsForm();
      
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

  loadTodayStats(statistics) {
    const today = new Date().toDateString();
    const todayStats = statistics.filter(stat => 
      new Date(stat.date).toDateString() === today
    );

    if (todayStats.length > 0) {
      const latest = todayStats[todayStats.length - 1];
      this.updateStatDisplay('total-connections', latest.connectionCount || 0);
      this.updateStatDisplay('total-messages', latest.messageCount || 0);
    }
  }

  populateCampaignSelect() {
    const select = document.getElementById('campaign-select');
    select.innerHTML = '<option value="">Selecione uma campanha</option>';
    
    this.campaigns.forEach(campaign => {
      const option = document.createElement('option');
      option.value = campaign.id;
      option.textContent = campaign.name;
      select.appendChild(option);
    });

    if (this.currentCampaign) {
      select.value = this.currentCampaign.id;
    }
  }

  populateSettingsForm() {
    document.getElementById('auto-cancel-days').value = this.settings.autoCancelAfterDays || 7;
    document.getElementById('working-hours-start').value = this.formatTime(this.settings.workingHours?.start || 9);
    document.getElementById('working-hours-end').value = this.formatTime(this.settings.workingHours?.end || 18);
    document.getElementById('auto-pause-response').checked = this.settings.autoPauseOnResponse !== false;

    // Dias de trabalho
    const checkboxes = document.querySelectorAll('.weekday-checkboxes input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = this.settings.workingDays?.includes(parseInt(checkbox.value)) || false;
    });
  }

  formatTime(hour) {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  async startAutomation() {
    if (!this.currentCampaign) {
      this.showNotification('Selecione uma campanha primeiro', 'warning');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'START_CAMPAIGN',
        campaign: this.currentCampaign
      });

      if (response && response.success) {
        this.isRunning = true;
        this.updateUI();
        this.showNotification('Automação iniciada com sucesso!', 'success');
        this.addActivity('Automação iniciada', 'success');
      } else {
        this.showNotification('Erro ao iniciar automação', 'error');
      }
    } catch (error) {
      console.error('Erro ao iniciar automação:', error);
      if (error.message.includes('Receiving end does not exist')) {
        this.showNotification('Extensão não está ativa. Recarregue a extensão.', 'error');
      } else {
        this.showNotification('Erro ao iniciar automação: ' + error.message, 'error');
      }
    }
  }

  async stopAutomation() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'STOP_CAMPAIGN'
      });

      if (response.success) {
        this.isRunning = false;
        this.updateUI();
        this.showNotification('Automação parada com sucesso!', 'success');
        this.addActivity('Automação parada', 'info');
      } else {
        this.showNotification('Erro ao parar automação', 'error');
      }
    } catch (error) {
      console.error('Erro ao parar automação:', error);
      this.showNotification('Erro ao parar automação', 'error');
    }
  }

  async pauseAutomation() {
    // Implementar pausa
    this.showNotification('Funcionalidade de pausa em desenvolvimento', 'info');
  }

  selectCampaign(campaignId) {
    if (!campaignId) {
      this.currentCampaign = null;
      return;
    }

    this.currentCampaign = this.campaigns.find(c => c.id === campaignId);
    this.updateUI();
  }

  showCampaignModal() {
    document.getElementById('campaign-modal').classList.remove('hidden');
  }

  hideCampaignModal() {
    document.getElementById('campaign-modal').classList.add('hidden');
    document.getElementById('campaign-form').reset();
  }

  showSettingsModal() {
    document.getElementById('settings-modal').classList.remove('hidden');
  }

  hideSettingsModal() {
    document.getElementById('settings-modal').classList.add('hidden');
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
      createdAt: new Date().toISOString()
    };

    this.campaigns.push(campaign);
    await chrome.storage.local.set({ campaigns: this.campaigns });

    this.populateCampaignSelect();
    this.hideCampaignModal();
    this.showNotification('Campanha salva com sucesso!', 'success');
    this.addActivity(`Campanha "${campaign.name}" criada`, 'info');
  }

  getCampaignFormData() {
    return {
      name: document.getElementById('campaign-name').value,
      description: document.getElementById('campaign-description').value,
      maxConnectionsPerDay: parseInt(document.getElementById('max-connections').value) || 50,
      maxMessagesPerDay: parseInt(document.getElementById('max-messages').value) || 100,
      connectionDelay: {
        min: parseInt(document.getElementById('min-connection-delay').value) * 1000 || 3000,
        max: parseInt(document.getElementById('max-connection-delay').value) * 1000 || 8000
      },
      followUpDelay: parseInt(document.getElementById('follow-up-delay').value) || 2,
      filters: {
        companies: document.getElementById('company-filter').value.split('\n').filter(c => c.trim()),
        titles: document.getElementById('title-filter').value.split('\n').filter(t => t.trim())
      },
      connectionTemplate: document.getElementById('connection-template').value,
      followUpTemplate: document.getElementById('follow-up-template').value
    };
  }

  async saveSettings() {
    const formData = this.getSettingsFormData();
    
    this.settings = { ...this.settings, ...formData };
    await chrome.storage.local.set({ settings: this.settings });

    // Atualizar configurações no background
    await chrome.runtime.sendMessage({
      action: 'UPDATE_SETTINGS',
      settings: formData
    });

    this.hideSettingsModal();
    this.showNotification('Configurações salvas com sucesso!', 'success');
    this.addActivity('Configurações atualizadas', 'info');
  }

  getSettingsFormData() {
    const workingDays = Array.from(document.querySelectorAll('.weekday-checkboxes input[type="checkbox"]:checked'))
      .map(cb => parseInt(cb.value));

    return {
      autoCancelAfterDays: parseInt(document.getElementById('auto-cancel-days').value) || 7,
      workingHours: {
        start: parseInt(document.getElementById('working-hours-start').value.split(':')[0]),
        end: parseInt(document.getElementById('working-hours-end').value.split(':')[0])
      },
      workingDays: workingDays,
      autoPauseOnResponse: document.getElementById('auto-pause-response').checked
    };
  }

              async scrapeProfiles() {
              try {
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                const tab = tabs[0];

                if (!tab.url.includes('linkedin.com')) {
                  this.showNotification('Abra uma página do LinkedIn primeiro', 'warning');
                  return;
                }

                // Verificar se é uma página de login
                if (tab.url.includes('linkedin.com/login') || 
                    tab.url.includes('linkedin.com/signup') ||
                    tab.url.includes('linkedin.com/checkpoint')) {
                  this.showNotification('Faça login no LinkedIn primeiro e navegue para uma página de resultados de busca', 'warning');
                  return;
                }

                // Verificar se o content script já está ativo
                try {
                  const checkResponse = await chrome.tabs.sendMessage(tab.id, {
                    action: 'PING'
                  });
                  console.log('Content script já está ativo');
                } catch (error) {
                  // Content script não está ativo, tentar injetar
                  try {
                    await chrome.scripting.executeScript({
                      target: { tabId: tab.id },
                      files: ['content.js']
                    });
                    console.log('Content script injetado com sucesso');
                  } catch (injectionError) {
                    console.log('Erro na injeção do content script:', injectionError);
                  }
                }

                // Aguardar um pouco para o content script carregar
                await new Promise(resolve => setTimeout(resolve, 1000));

                const response = await chrome.tabs.sendMessage(tab.id, {
                  action: 'SCRAPE_PROFILES'
                });

                if (response && response.success) {
                  const profiles = response.data;
                  if (profiles.length === 0) {
                    this.showNotification('Nenhum perfil encontrado. Certifique-se de estar em uma página de resultados de busca do LinkedIn', 'warning');
                  } else {
                    this.showNotification(`${profiles.length} perfis extraídos!`, 'success');
                    this.addActivity(`${profiles.length} perfis extraídos`, 'info');
                  }
                } else {
                  this.showNotification('Erro ao extrair perfis', 'error');
                }
              } catch (error) {
                console.error('Erro ao extrair perfis:', error);
                if (error.message.includes('Receiving end does not exist')) {
                  this.showNotification('Extensão não está ativa. Recarregue a extensão e certifique-se de estar logado no LinkedIn.', 'error');
                } else {
                  this.showNotification('Erro ao extrair perfis: ' + error.message, 'error');
                }
              }
            }

  async exportLeads() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'EXPORT_LEADS'
      });

      if (response.success && response.data) {
        this.downloadCSV(response.data, 'leads-linkedin.csv');
        this.showNotification('Leads exportados com sucesso!', 'success');
        this.addActivity('Leads exportados', 'info');
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

  openDashboard() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard.html')
    });
  }

  updateUI() {
    // Status
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const pauseBtn = document.getElementById('pause-btn');

    if (this.isRunning) {
      statusDot.classList.add('running');
      statusText.textContent = 'Executando';
      startBtn.disabled = true;
      stopBtn.disabled = false;
      pauseBtn.disabled = false;
    } else {
      statusDot.classList.remove('running');
      statusText.textContent = 'Parado';
      startBtn.disabled = !this.currentCampaign;
      stopBtn.disabled = true;
      pauseBtn.disabled = true;
    }

    // Campanha selecionada
    const campaignSelect = document.getElementById('campaign-select');
    if (this.currentCampaign) {
      campaignSelect.value = this.currentCampaign.id;
    }
  }

  async updateStats() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'GET_STATUS'
      });

      if (response.isRunning !== undefined) {
        this.isRunning = response.isRunning;
        this.updateUI();
      }

      // Atualizar estatísticas em tempo real
      if (response.connectionCount !== undefined) {
        this.updateStatDisplay('total-connections', response.connectionCount);
      }
      if (response.messageCount !== undefined) {
        this.updateStatDisplay('total-messages', response.messageCount);
      }

    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  }

  updateStatDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  addActivity(text, type = 'info') {
    const activityList = document.getElementById('activity-list');
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    const time = new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    activityItem.innerHTML = `
      <span class="activity-time">${time}</span>
      <span class="activity-text">${text}</span>
    `;

    // Adicionar no topo
    activityList.insertBefore(activityItem, activityList.firstChild);

    // Manter apenas os últimos 10 itens
    const items = activityList.querySelectorAll('.activity-item');
    if (items.length > 10) {
      items[items.length - 1].remove();
    }
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

// Inicializar controller
const popupController = new PopupController();

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
`;
document.head.appendChild(style);
