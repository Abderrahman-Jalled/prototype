// Content script for real-time monitoring
class BeautyContentMonitor {
  constructor() {
    this.isMonitoring = false;
    this.observers = [];
    this.lastProcessedContent = new Set();
    this.popupContainer = null;
    
    this.init();
  }

  async init() {
    // Get initial config
    const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
    this.isMonitoring = response.isMonitoring;
    
    if (this.isMonitoring) {
      this.startMonitoring();
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'MONITORING_TOGGLED':
        this.isMonitoring = message.enabled;
        if (this.isMonitoring) {
          this.startMonitoring();
        } else {
          this.stopMonitoring();
        }
        break;

      case 'SHOW_POPUP':
        this.showProactivePopup(message.detection);
        break;
    }
  }

  startMonitoring() {
    if (this.observers.length > 0) return; // Already monitoring

    // Monitor DOM changes
    this.startDOMMonitoring();
    
    // Monitor clipboard (limited by browser security)
    this.startClipboardMonitoring();
    
    // Scan existing content
    this.scanExistingContent();
    
    console.log('🔍 BeautyAI monitoring started on', window.location.hostname);
  }

  stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    console.log('⏹️ BeautyAI monitoring stopped');
  }

  startDOMMonitoring() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scanElementForBeautyContent(node);
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

  startClipboardMonitoring() {
    // Note: Clipboard access is limited in content scripts
    // This is a simplified version - full implementation would need different approach
    document.addEventListener('paste', async (event) => {
      try {
        const clipboardText = event.clipboardData?.getData('text');
        if (clipboardText && clipboardText.length > 10) {
          await this.processContent({
            type: 'text',
            content: clipboardText,
            source: 'clipboard',
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.debug('Clipboard access limited');
      }
    });
  }

  scanExistingContent() {
    // Scan for beauty-related content already on the page
    const textElements = document.querySelectorAll('h1, h2, h3, p, span, div[class*="product"], div[class*="title"]');
    textElements.forEach(element => {
      this.scanElementForBeautyContent(element);
    });

    // Scan for product images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (this.isBeautyRelatedImage(img)) {
        this.processContent({
          type: 'image',
          content: img.src,
          source: 'dom_image',
          timestamp: Date.now()
        });
      }
    });
  }

  scanElementForBeautyContent(element) {
    const textContent = element.textContent?.toLowerCase() || '';
    
    if (textContent.length < 10) return;

    const beautyKeywords = [
      'serum', 'moisturizer', 'cleanser', 'foundation', 'concealer', 'lipstick',
      'mascara', 'eyeshadow', 'skincare', 'makeup', 'beauty', 'cosmetic',
      'retinol', 'vitamin c', 'hyaluronic acid', 'niacinamide'
    ];

    const hasBeautyKeywords = beautyKeywords.some(keyword => 
      textContent.includes(keyword)
    );

    if (hasBeautyKeywords) {
      this.processContent({
        type: 'text',
        content: textContent,
        source: 'dom_mutation',
        timestamp: Date.now()
      });
    }
  }

  isBeautyRelatedImage(img) {
    const src = img.src?.toLowerCase() || '';
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

  async processContent(content) {
    // Avoid processing the same content multiple times
    const contentHash = this.hashContent(content.content);
    if (this.lastProcessedContent.has(contentHash)) return;
    
    this.lastProcessedContent.add(contentHash);
    
    // Send to background script for processing
    chrome.runtime.sendMessage({
      type: 'CONTENT_DETECTED',
      data: content
    });
  }

  hashContent(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  showProactivePopup(detection) {
    // Remove existing popup
    if (this.popupContainer) {
      this.popupContainer.remove();
    }

    // Create popup container
    this.popupContainer = document.createElement('div');
    this.popupContainer.id = 'beautyai-popup-container';
    this.popupContainer.innerHTML = this.createPopupHTML(detection);
    
    // Add to page
    document.body.appendChild(this.popupContainer);
    
    // Add event listeners
    this.setupPopupEventListeners(detection);
    
    // Auto-close after 10 seconds
    setTimeout(() => {
      this.closePopup();
    }, 10000);
  }

  createPopupHTML(detection) {
    const confidenceColor = detection.confidence >= 0.8 ? 'green' : 
                           detection.confidence >= 0.6 ? 'yellow' : 'blue';
    
    return `
      <div id="beautyai-popup-backdrop" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(4px);
        z-index: 999999;
        opacity: 0;
        transition: opacity 0.3s ease;
      "></div>
      
      <div id="beautyai-popup" style="
        position: fixed;
        top: 20px;
        right: 20px;
        width: 380px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid #e5e7eb;
        z-index: 1000000;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(to right, #f43f5e, #ec4899);
          color: white;
          padding: 16px;
          border-radius: 16px 16px 0 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              background: rgba(255, 255, 255, 0.2);
              backdrop-filter: blur(8px);
              border-radius: 50%;
              padding: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              ✨
            </div>
            <div>
              <h3 style="margin: 0; font-size: 14px; font-weight: 600;">BeautyAI Detection</h3>
              <p style="margin: 0; font-size: 12px; opacity: 0.9;">Beauty products detected!</p>
            </div>
          </div>
          <button id="beautyai-close" style="
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.8);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: color 0.2s;
          ">✕</button>
        </div>

        <!-- Content -->
        <div style="padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #6b7280;">
              <span>📍</span>
              <span>From ${this.getSourceLabel(detection.source)}</span>
            </div>
            <span style="
              font-size: 12px;
              padding: 4px 8px;
              border-radius: 12px;
              background: ${confidenceColor === 'green' ? '#dcfce7' : confidenceColor === 'yellow' ? '#fef3c7' : '#dbeafe'};
              color: ${confidenceColor === 'green' ? '#166534' : confidenceColor === 'yellow' ? '#92400e' : '#1e40af'};
            ">
              ${Math.round(detection.confidence * 100)}% confidence
            </span>
          </div>

          <div style="
            background: #f9fafb;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
          ">
            <p style="
              margin: 0;
              font-size: 14px;
              color: #374151;
              line-height: 1.4;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            ">
              ${detection.type === 'url' 
                ? `Beauty shopping detected on ${new URL(detection.content).hostname}`
                : detection.content.length > 100 
                  ? detection.content.substring(0, 100) + '...'
                  : detection.content
              }
            </p>
          </div>

          <div style="
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
          ">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="
                background: #f43f5e;
                border-radius: 50%;
                padding: 4px;
                margin-top: 2px;
              ">
                🛍️
              </div>
              <div style="flex: 1;">
                <h4 style="
                  margin: 0 0 4px 0;
                  font-size: 14px;
                  font-weight: 600;
                  color: #991b1b;
                ">Get AI-Powered Analysis</h4>
                <p style="
                  margin: 0;
                  font-size: 12px;
                  color: #dc2626;
                  line-height: 1.3;
                ">
                  Discover detailed product information, ingredients, reviews, and personalized recommendations.
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 8px;">
            <button id="beautyai-analyze" style="
              flex: 1;
              background: linear-gradient(to right, #f43f5e, #ec4899);
              color: white;
              border: none;
              padding: 10px 16px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            ">
              ✨ Analyze Now
            </button>
            <button id="beautyai-dismiss" style="
              padding: 10px 16px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              background: white;
              color: #6b7280;
              cursor: pointer;
              transition: background-color 0.2s;
            ">
              Dismiss
            </button>
          </div>

          <!-- Progress bar -->
          <div style="
            margin-top: 12px;
            background: #f3f4f6;
            border-radius: 4px;
            height: 4px;
            overflow: hidden;
          ">
            <div id="beautyai-progress" style="
              height: 100%;
              background: linear-gradient(to right, #f43f5e, #ec4899);
              width: 100%;
              transition: width 10s linear;
            "></div>
          </div>
          <p style="
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
          ">Auto-closes in 10 seconds</p>
        </div>
      </div>
    `;
  }

  setupPopupEventListeners(detection) {
    // Show popup with animation
    setTimeout(() => {
      const backdrop = document.getElementById('beautyai-popup-backdrop');
      const popup = document.getElementById('beautyai-popup');
      const progress = document.getElementById('beautyai-progress');
      
      if (backdrop) backdrop.style.opacity = '1';
      if (popup) {
        popup.style.transform = 'translateX(0)';
        popup.style.opacity = '1';
      }
      if (progress) progress.style.width = '0%';
    }, 100);

    // Close button
    document.getElementById('beautyai-close')?.addEventListener('click', () => {
      this.closePopup();
    });

    // Dismiss button
    document.getElementById('beautyai-dismiss')?.addEventListener('click', () => {
      this.closePopup();
    });

    // Analyze button
    document.getElementById('beautyai-analyze')?.addEventListener('click', async () => {
      this.closePopup();
      
      // Send content for analysis
      const analysis = await chrome.runtime.sendMessage({
        type: 'ANALYZE_CONTENT',
        content: detection
      });
      
      // Open extension popup or redirect to analysis page
      chrome.runtime.sendMessage({
        type: 'OPEN_ANALYSIS',
        analysis: analysis
      });
    });

    // Close on backdrop click
    document.getElementById('beautyai-popup-backdrop')?.addEventListener('click', () => {
      this.closePopup();
    });
  }

  closePopup() {
    if (this.popupContainer) {
      const backdrop = document.getElementById('beautyai-popup-backdrop');
      const popup = document.getElementById('beautyai-popup');
      
      if (backdrop) backdrop.style.opacity = '0';
      if (popup) {
        popup.style.transform = 'translateX(100%)';
        popup.style.opacity = '0';
      }
      
      setTimeout(() => {
        this.popupContainer?.remove();
        this.popupContainer = null;
      }, 300);
    }
  }

  getSourceLabel(source) {
    switch (source) {
      case 'clipboard': return 'Clipboard';
      case 'navigation': return 'Website';
      case 'dom_mutation': return 'Page Content';
      case 'dom_image': return 'Product Image';
      default: return 'Detected';
    }
  }
}

// Initialize content monitor
new BeautyContentMonitor();