interface DetectedContent {
  type: 'text' | 'image' | 'url';
  content: string;
  source: string;
  timestamp: number;
  confidence: number;
}

interface MonitoringConfig {
  enabled: boolean;
  sensitivity: 'high' | 'medium' | 'low';
  sources: string[];
  keywords: string[];
  excludedSites: string[];
}

class ContentMonitor {
  private config: MonitoringConfig;
  private observers: MutationObserver[] = [];
  private intervalId: number | null = null;
  private lastProcessedContent = new Set<string>();

  constructor() {
    this.config = {
      enabled: false,
      sensitivity: 'medium',
      sources: ['clipboard', 'dom', 'screenshots'],
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
      excludedSites: ['gmail.com', 'docs.google.com', 'slack.com']
    };
  }

  async startMonitoring(): Promise<void> {
    if (this.config.enabled) return;
    
    this.config.enabled = true;
    
    // Monitor clipboard changes
    this.startClipboardMonitoring();
    
    // Monitor DOM changes on beauty-related sites
    this.startDOMMonitoring();
    
    // Monitor for beauty-related URLs
    this.startURLMonitoring();
    
    console.log('🔍 Beauty product monitoring started');
  }

  stopMonitoring(): void {
    this.config.enabled = false;
    
    // Clear all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // Clear intervals
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('⏹️ Beauty product monitoring stopped');
  }

  private startClipboardMonitoring(): void {
    // Monitor clipboard for beauty product content
    this.intervalId = window.setInterval(async () => {
      try {
        if (!navigator.clipboard?.readText) return;
        
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText.length > 10 && clipboardText.length < 1000) {
          await this.processContent({
            type: 'text',
            content: clipboardText,
            source: 'clipboard',
            timestamp: Date.now(),
            confidence: 0
          });
        }
      } catch (error) {
        // Clipboard access might be restricted
        console.debug('Clipboard monitoring limited due to permissions');
      }
    }, 2000);
  }

  private startDOMMonitoring(): void {
    // Monitor for beauty-related content appearing on pages
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            this.scanElementForBeautyContent(element);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });

    this.observers.push(observer);
  }

  private startURLMonitoring(): void {
    // Monitor URL changes for beauty-related sites
    let currentURL = window.location.href;
    
    const checkURL = () => {
      if (window.location.href !== currentURL) {
        currentURL = window.location.href;
        this.processURL(currentURL);
      }
    };

    // Check URL changes
    this.intervalId = window.setInterval(checkURL, 1000);
    
    // Initial URL check
    this.processURL(currentURL);
  }

  private async scanElementForBeautyContent(element: Element): Promise<void> {
    const textContent = element.textContent?.toLowerCase() || '';
    const hasBeautyKeywords = this.config.keywords.some(keyword => 
      textContent.includes(keyword.toLowerCase())
    );

    if (hasBeautyKeywords && textContent.length > 20) {
      await this.processContent({
        type: 'text',
        content: textContent,
        source: 'dom_mutation',
        timestamp: Date.now(),
        confidence: 0
      });
    }

    // Check for product images
    const images = element.querySelectorAll('img');
    images.forEach(async (img) => {
      if (img.src && this.isBeautyRelatedImage(img)) {
        await this.processContent({
          type: 'image',
          content: img.src,
          source: 'dom_image',
          timestamp: Date.now(),
          confidence: 0
        });
      }
    });
  }

  private isBeautyRelatedImage(img: HTMLImageElement): boolean {
    const src = img.src.toLowerCase();
    const alt = img.alt?.toLowerCase() || '';
    const className = img.className?.toLowerCase() || '';
    
    const beautyIndicators = [
      'product', 'beauty', 'cosmetic', 'skincare', 'makeup',
      'serum', 'cream', 'foundation', 'lipstick', 'mascara'
    ];
    
    return beautyIndicators.some(indicator => 
      src.includes(indicator) || alt.includes(indicator) || className.includes(indicator)
    );
  }

  private async processURL(url: string): Promise<void> {
    const beautyDomains = [
      'sephora.com', 'ulta.com', 'beautylish.com', 'dermstore.com',
      'spacenk.com', 'cultbeauty.com', 'lookfantastic.com', 'feelunique.com'
    ];

    const isBeautySite = beautyDomains.some(domain => url.includes(domain));
    
    if (isBeautySite) {
      await this.processContent({
        type: 'url',
        content: url,
        source: 'navigation',
        timestamp: Date.now(),
        confidence: 0.8
      });
    }
  }

  private async processContent(content: DetectedContent): Promise<void> {
    if (!this.config.enabled) return;
    
    // Avoid processing the same content multiple times
    const contentHash = this.hashContent(content.content);
    if (this.lastProcessedContent.has(contentHash)) return;
    
    this.lastProcessedContent.add(contentHash);
    
    // Clean up old hashes (keep only last 100)
    if (this.lastProcessedContent.size > 100) {
      const entries = Array.from(this.lastProcessedContent);
      this.lastProcessedContent = new Set(entries.slice(-50));
    }

    // Calculate confidence score
    const confidence = this.calculateConfidence(content);
    
    if (confidence > this.getConfidenceThreshold()) {
      // Trigger beauty product detection
      const event = new CustomEvent('beautyContentDetected', {
        detail: { ...content, confidence }
      });
      window.dispatchEvent(event);
    }
  }

  private calculateConfidence(content: DetectedContent): number {
    let confidence = 0;
    const text = content.content.toLowerCase();
    
    // Brand mentions (high confidence)
    const brandKeywords = this.config.keywords.filter(k => 
      ['sephora', 'ulta', 'fenty beauty', 'rare beauty', 'glossier'].includes(k)
    );
    const brandMatches = brandKeywords.filter(brand => text.includes(brand)).length;
    confidence += brandMatches * 0.3;
    
    // Product type mentions (medium confidence)
    const productKeywords = this.config.keywords.filter(k => 
      ['serum', 'moisturizer', 'foundation', 'lipstick', 'mascara'].includes(k)
    );
    const productMatches = productKeywords.filter(product => text.includes(product)).length;
    confidence += productMatches * 0.2;
    
    // Ingredient mentions (medium confidence)
    const ingredientKeywords = ['retinol', 'vitamin c', 'hyaluronic acid', 'niacinamide'];
    const ingredientMatches = ingredientKeywords.filter(ingredient => text.includes(ingredient)).length;
    confidence += ingredientMatches * 0.15;
    
    // Context clues (low confidence)
    const contextKeywords = ['routine', 'review', 'tutorial', 'haul'];
    const contextMatches = contextKeywords.filter(context => text.includes(context)).length;
    confidence += contextMatches * 0.1;
    
    // Source-based confidence boost
    if (content.source === 'navigation') confidence += 0.2;
    if (content.source === 'dom_image') confidence += 0.15;
    
    return Math.min(confidence, 1.0);
  }

  private getConfidenceThreshold(): number {
    switch (this.config.sensitivity) {
      case 'high': return 0.3;
      case 'medium': return 0.5;
      case 'low': return 0.7;
      default: return 0.5;
    }
  }

  private hashContent(content: string): string {
    // Simple hash function for content deduplication
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): MonitoringConfig {
    return { ...this.config };
  }
}

export const contentMonitor = new ContentMonitor();