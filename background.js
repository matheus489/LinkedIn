// Service Worker para LinkedIn Automation Pro
// Gerencia automações em segundo plano e agendamentos

class LinkedInAutomationManager {
  constructor() {
    this.isRunning = false;
    this.currentCampaign = null;
    this.delays = {
      min: 3000, // 3 segundos mínimo
      max: 8000  // 8 segundos máximo
    };
    this.init();
  }

  async init() {
    // Configurar alarmes para verificações periódicas
    chrome.alarms.create('checkConnections', { periodInMinutes: 30 });
    chrome.alarms.create('checkMessages', { periodInMinutes: 15 });
    
    // Listener para alarmes
    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });

    // Listener para mensagens do content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Mantém a conexão aberta para resposta assíncrona
    });

    // Carregar configurações salvas
    await this.loadSettings();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['settings', 'campaigns', 'templates']);
      this.settings = result.settings || this.getDefaultSettings();
      this.campaigns = result.campaigns || [];
      this.templates = result.templates || this.getDefaultTemplates();
      
      // Garantir que todas as propriedades existam
      if (!this.settings.maxConnectionsPerDay) {
        this.settings.maxConnectionsPerDay = 50;
      }
      if (!this.settings.maxMessagesPerDay) {
        this.settings.maxMessagesPerDay = 100;
      }
      if (!this.settings.connectionDelay) {
        this.settings.connectionDelay = { min: 3000, max: 8000 };
      }
      if (!this.settings.messageDelay) {
        this.settings.messageDelay = { min: 2000, max: 5000 };
      }
      if (!this.settings.autoPauseOnResponse) {
        this.settings.autoPauseOnResponse = true;
      }
      if (!this.settings.autoCancelAfterDays) {
        this.settings.autoCancelAfterDays = 7;
      }
      if (!this.settings.workingHours) {
        this.settings.workingHours = { start: 9, end: 18 };
      }
      if (!this.settings.workingDays) {
        this.settings.workingDays = [1, 2, 3, 4, 5];
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      this.settings = this.getDefaultSettings();
      this.campaigns = [];
      this.templates = this.getDefaultTemplates();
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
      workingDays: [1, 2, 3, 4, 5] // Segunda a Sexta
    };
  }

  getDefaultTemplates() {
    return {
      connection: [
        {
          name: "Template Padrão",
          subject: "Conexão profissional",
          message: "Olá {{first_name}}, vi seu perfil e gostaria de conectar para expandir nossa rede profissional. Obrigado!"
        },
        {
          name: "Template Personalizado",
          subject: "Interesse em {{empresa}}",
          message: "Oi {{first_name}}, vi que você trabalha na {{empresa}} e gostaria de conectar para trocar experiências sobre o setor."
        }
      ],
      followUp: [
        {
          name: "Follow-up 1",
          delay: 2, // dias
          message: "Oi {{first_name}}, obrigado por aceitar minha conexão! Gostaria de saber mais sobre seu trabalho na {{empresa}}."
        },
        {
          name: "Follow-up 2", 
          delay: 5, // dias
          message: "{{first_name}}, tudo bem? Espero que esteja bem! Gostaria de manter contato para futuras oportunidades."
        }
      ]
    };
  }

  async handleAlarm(alarm) {
    switch (alarm.name) {
      case 'checkConnections':
        await this.checkPendingConnections();
        break;
      case 'checkMessages':
        await this.checkPendingMessages();
        break;
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'START_CAMPAIGN':
          await this.startCampaign(request.campaign);
          sendResponse({ success: true });
          break;
        
        case 'STOP_CAMPAIGN':
          await this.stopCampaign();
          sendResponse({ success: true });
          break;
        
        case 'GET_STATUS':
          sendResponse({
            isRunning: this.isRunning,
            currentCampaign: this.currentCampaign,
            settings: this.settings
          });
          break;
        
        case 'UPDATE_SETTINGS':
          await this.updateSettings(request.settings);
          sendResponse({ success: true });
          break;
        
        case 'SAVE_TEMPLATE':
          await this.saveTemplate(request.template);
          sendResponse({ success: true });
          break;
        
        case 'EXPORT_LEADS':
          const leads = await this.exportLeads();
          sendResponse({ success: true, data: leads });
          break;
        
        default:
          sendResponse({ success: false, error: 'Ação não reconhecida' });
      }
    } catch (error) {
      console.error('Erro no handleMessage:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async startCampaign(campaign) {
    if (this.isRunning) {
      throw new Error('Campanha já está em execução');
    }

    this.currentCampaign = campaign;
    this.isRunning = true;

    // Notificar content script para iniciar automação
    const tabs = await chrome.tabs.query({ url: 'https://*.linkedin.com/*' });
    
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'START_AUTOMATION',
          campaign: campaign
        });
      } catch (error) {
        console.error(`Erro ao enviar mensagem para tab ${tab.id}:`, error);
      }
    }

    // Salvar campanha ativa
    await chrome.storage.local.set({ activeCampaign: campaign });
    
    // Notificação
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'LinkedIn Automation Pro',
      message: `Campanha "${campaign.name}" iniciada com sucesso!`
    });
  }

  async stopCampaign() {
    this.isRunning = false;
    this.currentCampaign = null;

    // Notificar content script para parar automação
    const tabs = await chrome.tabs.query({ url: 'https://*.linkedin.com/*' });
    
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'STOP_AUTOMATION' });
      } catch (error) {
        console.error(`Erro ao enviar mensagem para tab ${tab.id}:`, error);
      }
    }

    // Remover campanha ativa
    await chrome.storage.local.remove(['activeCampaign']);
    
    // Notificação
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'LinkedIn Automation Pro',
      message: 'Campanha parada com sucesso!'
    });
  }

  async checkPendingConnections() {
    if (!this.isRunning) return;

    // Verificar conexões pendentes e cancelar se necessário
    const now = new Date();
    const connections = await this.getStoredConnections();
    
    for (const connection of connections) {
      if (connection.status === 'pending' && connection.date) {
        const daysDiff = (now - new Date(connection.date)) / (1000 * 60 * 60 * 24);
        
        if (daysDiff >= this.settings.autoCancelAfterDays) {
          await this.cancelConnection(connection);
        }
      }
    }
  }

  async checkPendingMessages() {
    if (!this.isRunning) return;

    // Verificar mensagens pendentes e enviar follow-ups
    const messages = await this.getStoredMessages();
    
    for (const message of messages) {
      if (message.status === 'pending' && message.scheduledDate) {
        const now = new Date();
        const scheduledDate = new Date(message.scheduledDate);
        
        if (now >= scheduledDate) {
          await this.sendFollowUpMessage(message);
        }
      }
    }
  }

  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await chrome.storage.local.set({ settings: this.settings });
  }

  async saveTemplate(template) {
    if (!this.templates[template.type]) {
      this.templates[template.type] = [];
    }
    
    this.templates[template.type].push(template);
    await chrome.storage.local.set({ templates: this.templates });
  }

  async exportLeads() {
    const leads = await this.getStoredLeads();
    return this.convertToCSV(leads);
  }

  async getStoredConnections() {
    const result = await chrome.storage.local.get('connections');
    return result.connections || [];
  }

  async getStoredMessages() {
    const result = await chrome.storage.local.get('messages');
    return result.messages || [];
  }

  async getStoredLeads() {
    const result = await chrome.storage.local.get('leads');
    return result.leads || [];
  }

  async cancelConnection(connection) {
    // Implementar cancelamento de conexão
    console.log('Cancelando conexão:', connection);
  }

  async sendFollowUpMessage(message) {
    // Implementar envio de follow-up
    console.log('Enviando follow-up:', message);
  }

  convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }

  getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  isWorkingHours() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    return this.settings.workingDays.includes(day) && 
           hour >= this.settings.workingHours.start && 
           hour < this.settings.workingHours.end;
  }
}

// Inicializar o gerenciador quando o service worker carregar
const automationManager = new LinkedInAutomationManager();

// Listener para instalação da extensão
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Configuração inicial
    automationManager.loadSettings();
    
    // Abrir página de boas-vindas
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
});
