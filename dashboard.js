// Dashboard script
class BeautyDashboard {
  constructor() {
    this.detectionHistory = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.updateStats();
    this.renderHistory();
  }

  async loadData() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_HISTORY' });
      this.detectionHistory = response.history || [];
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  updateStats() {
    const total = this.detectionHistory.length;
    const today = new Date().toDateString();
    const todayDetections = this.detectionHistory.filter(d => 
      new Date(d.timestamp).toDateString() === today
    ).length;
    
    const avgConfidence = total > 0 
      ? Math.round(this.detectionHistory.reduce((sum, d) => sum + d.confidence, 0) / total * 100)
      : 0;
    
    const sourceCounts = this.detectionHistory.reduce((acc, d) => {
      acc[d.source] = (acc[d.source] || 0) + 1;
      return acc;
    }, {});
    
    const topSource = Object.keys(sourceCounts).reduce((a, b) => 
      sourceCounts[a] > sourceCounts[b] ? a : b, 'None'
    );

    document.getElementById('total-detections').textContent = total;
    document.getElementById('today-detections').textContent = todayDetections;
    document.getElementById('avg-confidence').textContent = `${avgConfidence}%`;
    document.getElementById('top-source').textContent = this.formatSourceName(topSource);
  }

  renderHistory() {
    const container = document.getElementById('detection-history');
    
    if (this.detectionHistory.length === 0) {
      container.innerHTML = `
        <p style="text-align: center; color: #6b7280; padding: 2rem;">
          No detections yet. Enable monitoring to start detecting beauty products.
        </p>
      `;
      return;
    }

    container.innerHTML = this.detectionHistory.map(detection => `
      <div class="detection-item">
        <div class="detection-header">
          <div class="detection-meta">
            <span>📍 ${this.formatSourceName(detection.source)}</span>
            <span>🕒 ${this.formatTimestamp(detection.timestamp)}</span>
            <span>📱 ${detection.type.toUpperCase()}</span>
          </div>
          <span class="confidence-badge ${this.getConfidenceClass(detection.confidence)}">
            ${Math.round(detection.confidence * 100)}% confidence
          </span>
        </div>
        <div style="color: #374151; margin-top: 0.5rem;">
          ${detection.type === 'url' 
            ? `Beauty shopping on ${new URL(detection.content).hostname}`
            : detection.content.length > 200 
              ? detection.content.substring(0, 200) + '...'
              : detection.content
          }
        </div>
      </div>
    `).join('');
  }

  formatSourceName(source) {
    const names = {
      'clipboard': 'Clipboard',
      'navigation': 'Website Navigation',
      'dom_mutation': 'Page Content',
      'dom_image': 'Product Images'
    };
    return names[source] || source;
  }

  formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  getConfidenceClass(confidence) {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.6) return 'confidence-medium';
    return 'confidence-low';
  }
}

// Initialize dashboard
new BeautyDashboard();