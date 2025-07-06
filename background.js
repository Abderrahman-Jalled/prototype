// Background service worker for Chrome extension
class BeautyDetectionBackground {
  constructor() {
    this.isMonitoring = false;
    this.detectionHistory = [];
    this.config = {
      enabled: true,
      sensitivity: 'medium',
      sources: ['clipboard', 'dom', 'navigation'],
      keywords: [
        // Beauty brands
        'sephora', 'ulta', 'fenty beauty', 'rare beauty', 'glossier', 'drunk elephant',
        'the ordinary', 'cerave', 'neutrogena', 'olay', 'clinique', 'estee lauder',
        'mac', 'nars', 'urban decay', 'too faced', 'charlotte tilbury', 'dior beauty',
        
        // Product categories
        'serum', 'moisturizer', 'cleanser', 'foundation', 'concealer', 'lipstick',
        'mascara', 'eyeshadow', 'blush', 'bronzer', 'primer', 'toner', 'essence',
        'retinol', 'vitamin c', 'hyaluronic acid', 'niacinamide', 'salicylic acid',
        
        // Beauty contexts
        'skincare routine', 'makeup tutorial', 'beauty haul', 'product review',
        'grwm', 'get ready with me', 'beauty tips', 'skincare tips'
      ],
      beautyDomains: [
        'sephora.com', 'ulta.com', 'beautylish.com', 'dermstore.com',
        'spacenk.com', 'cultbeauty.com', 'lookfantastic.com', 'feelunique.com',
        'amazon.com', 'target.com', 'cvs.com', 'walgreens.com'
      ]
    };
    
    this.init();
  }

  init() {
    // Listen for tab updates (navigation)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.checkURL(tab.url, tabId);
      }
    });

    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Initialize storage
    this.loadConfig();
  }

  async loadConfig() {
    try {
      const stored = await chrome.storage.sync.get(['beautyConfig', 'isMonitoring']);
      if (stored.beautyConfig) {
        this.config = { ...this.config, ...stored.beautyConfig };
      }
      this.isMonitoring = stored.isMonitoring || false;
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  async saveConfig() {
    try {
      await chrome.storage.sync.set({
        beautyConfig: this.config,
        isMonitoring: this.isMonitoring
      });
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  checkURL(url, tabId) {
    if (!this.isMonitoring) return;

    const isBeautySite = this.config.beautyDomains.some(domain => 
      url.toLowerCase().includes(domain)
    );

    if (isBeautySite) {
      const detection = {
        type: 'url',
        content: url,
        source: 'navigation',
        timestamp: Date.now(),
        confidence: 0.8,
        tabId: tabId
      };

      this.processDetection(detection);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'CONTENT_DETECTED':
        if (this.isMonitoring) {
          this.processDetection({
            ...message.data,
            tabId: sender.tab?.id
          });
        }
        break;

      case 'GET_CONFIG':
        sendResponse({
          config: this.config,
          isMonitoring: this.isMonitoring
        });
        break;

      case 'UPDATE_CONFIG':
        this.config = { ...this.config, ...message.config };
        await this.saveConfig();
        sendResponse({ success: true });
        break;

      case 'TOGGLE_MONITORING':
        this.isMonitoring = message.enabled;
        await this.saveConfig();
        
        // Notify all content scripts
        const tabs = await chrome.tabs.query({});
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'MONITORING_TOGGLED',
            enabled: this.isMonitoring
          }).catch(() => {}); // Ignore errors for inactive tabs
        });
        
        sendResponse({ success: true });
        break;

      case 'GET_HISTORY':
        sendResponse({ history: this.detectionHistory.slice(0, 50) });
        break;

      case 'ANALYZE_CONTENT':
        // This would integrate with your Gemini API
        const analysis = await this.analyzeWithAI(message.content);
        sendResponse({ analysis });
        break;
    }
  }

  processDetection(detection) {
    const confidence = this.calculateConfidence(detection);
    
    if (confidence > this.getConfidenceThreshold()) {
      const enrichedDetection = {
        ...detection,
        confidence,
        id: Date.now() + Math.random()
      };

      // Add to history
      this.detectionHistory.unshift(enrichedDetection);
      this.detectionHistory = this.detectionHistory.slice(0, 100);

      // Trigger popup if confidence is high enough
      if (confidence > 0.6) {
        this.triggerPopup(enrichedDetection);
      }
    }
  }

  calculateConfidence(detection) {
    let confidence = 0;
    const text = detection.content.toLowerCase();
    
    // Brand mentions (high confidence)
    const brandMatches = this.config.keywords.filter(keyword => 
      ['sephora', 'ulta', 'fenty beauty', 'rare beauty', 'glossier'].includes(keyword) &&
      text.includes(keyword)
    ).length;
    confidence += brandMatches * 0.3;
    
    // Product type mentions
    const productKeywords = ['serum', 'moisturizer', 'foundation', 'lipstick', 'mascara'];
    const productMatches = productKeywords.filter(product => text.includes(product)).length;
    confidence += productMatches * 0.2;
    
    // Ingredient mentions
    const ingredientKeywords = ['retinol', 'vitamin c', 'hyaluronic acid', 'niacinamide'];
    const ingredientMatches = ingredientKeywords.filter(ingredient => text.includes(ingredient)).length;
    confidence += ingredientMatches * 0.15;
    
    // Source-based confidence
    if (detection.source === 'navigation') confidence += 0.2;
    if (detection.source === 'dom_image') confidence += 0.15;
    
    return Math.min(confidence, 1.0);
  }

  getConfidenceThreshold() {
    switch (this.config.sensitivity) {
      case 'high': return 0.3;
      case 'medium': return 0.5;
      case 'low': return 0.7;
      default: return 0.5;
    }
  }

  async triggerPopup(detection) {
    try {
      // Send message to content script to show popup
      await chrome.tabs.sendMessage(detection.tabId, {
        type: 'SHOW_POPUP',
        detection: detection
      });
    } catch (error) {
      console.error('Failed to trigger popup:', error);
    }
  }

  async analyzeWithAI(content) {
    // Mock analysis - replace with actual Gemini API call
    return {
      detection_triggered: true,
      products_found: [
        {
          product_name: "Detected Beauty Product",
          brand: "Unknown",
          category: "skincare",
          confidence_score: 0.8,
          key_ingredients: ["Unknown"],
          primary_benefits: ["Beauty enhancement"],
          price_range: "$10-50"
        }
      ],
      context_analysis: {
        source_type: content.type,
        detection_context: "real_time_monitoring",
        urgency_level: "medium"
      }
    };
  }
}

// Initialize background service
new BeautyDetectionBackground();