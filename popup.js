// Popup script for Chrome extension
class BeautyPopup {
  constructor() {
    this.isMonitoring = false;
    this.detectionHistory = [];
    this.init();
  }

  async init() {
    await this.loadStatus();
    this.setupEventListeners();
    this.updateUI();
    this.loadRecentDetections();
  }

  async loadStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
      this.isMonitoring = response.isMonitoring;
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  }

  async loadRecentDetections() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_HISTORY' });
      this.detectionHistory = response.history || [];
      this.renderDetections();
    } catch (error) {
      console.error('Failed to load detections:', error);
    }
  }

  setupEventListeners() {
    // Monitoring toggle
    document.getElementById('monitoring-toggle').addEventListener('click', () => {
      this.toggleMonitoring();
    });

    // Open dashboard
    document.getElementById('open-dashboard').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    });

    // Settings
    document.getElementById('settings-btn').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    });
  }

  async toggleMonitoring() {
    this.isMonitoring = !this.isMonitoring;
    
    try {
      await chrome.runtime.sendMessage({
        type: 'TOGGLE_MONITORING',
        enabled: this.isMonitoring
      });
      this.updateUI();
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
      this.isMonitoring = !this.isMonitoring; // Revert on error
    }
  }

  updateUI() {
    const toggle = document.getElementById('monitoring-toggle');
    const statusText = document.getElementById('status-text');
    
    if (this.isMonitoring) {
      toggle.classList.add('active');
      statusText.textContent = 'Active';
      statusText.style.color = '#059669';
    } else {
      toggle.classList.remove('active');
      statusText.textContent = 'Inactive';
      statusText.style.color = '#6b7280';
    }

    // Update detection count
    const today = new Date().toDateString();
    const todayDetections = this.detectionHistory.filter(d => 
      new Date(d.timestamp).toDateString() === today
    ).length;
    
    document.getElementById('detection-count').textContent = todayDetections;
  }

  renderDetections() {
    const container = document.getElementById('recent-detections');
    
    if (this.detectionHistory.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <p>No recent detections</p>
          <p style="font-size: 12px; margin-top: 8px;">Enable monitoring to start detecting beauty products</p>
        </div>
      `;
      return;
    }

    const recentDetections = this.detectionHistory.slice(0, 5);
    container.innerHTML = recentDetections.map(detection => `
      <div class="detection-item">
        <div class="detection-header">
          <span class="detection-time">${this.formatTime(detection.timestamp)}</span>
          <span class="confidence-badge">${Math.round(detection.confidence * 100)}%</span>
        </div>
        <div class="detection-content">
          ${detection.type === 'url' 
            ? `Beauty site: ${new URL(detection.content).hostname}`
            : detection.content.length > 80 
              ? detection.content.substring(0, 80) + '...'
              : detection.content
          }
        </div>
      </div>
    `).join('');
  }

  formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  }
}

// Initialize popup
new BeautyPopup();