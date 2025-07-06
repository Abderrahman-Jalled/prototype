import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Settings, Shield, Zap, Clock } from 'lucide-react';
import { contentMonitor } from '../services/contentMonitor';

interface MonitoringControlsProps {
  onToggleMonitoring: (enabled: boolean) => void;
  isMonitoring: boolean;
}

const MonitoringControls: React.FC<MonitoringControlsProps> = ({
  onToggleMonitoring,
  isMonitoring
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState(contentMonitor.getConfig());
  const [detectionCount, setDetectionCount] = useState(0);

  useEffect(() => {
    const handleDetection = () => {
      setDetectionCount(prev => prev + 1);
    };

    window.addEventListener('beautyContentDetected', handleDetection);
    return () => window.removeEventListener('beautyContentDetected', handleDetection);
  }, []);

  const handleToggleMonitoring = () => {
    const newState = !isMonitoring;
    onToggleMonitoring(newState);
    
    if (newState) {
      contentMonitor.startMonitoring();
    } else {
      contentMonitor.stopMonitoring();
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    contentMonitor.updateConfig(newConfig);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isMonitoring ? 'bg-green-100' : 'bg-gray-100'}`}>
            {isMonitoring ? (
              <Eye className={`w-5 h-5 ${isMonitoring ? 'text-green-600' : 'text-gray-500'}`} />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Real-time Detection</h3>
            <p className="text-sm text-gray-600">
              {isMonitoring ? 'Actively monitoring for beauty products' : 'Detection paused'}
            </p>
          </div>
        </div>
        <button
          onClick={setShowSettings}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <div className="text-xs text-gray-600">Status</div>
          <div className="text-sm font-medium">{isMonitoring ? 'Active' : 'Inactive'}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <Clock className="w-4 h-4 mx-auto mb-2 text-blue-500" />
          <div className="text-xs text-gray-600">Detections</div>
          <div className="text-sm font-medium">{detectionCount}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <Zap className="w-4 h-4 mx-auto mb-2 text-yellow-500" />
          <div className="text-xs text-gray-600">Sensitivity</div>
          <div className="text-sm font-medium capitalize">{config.sensitivity}</div>
        </div>
      </div>

      {/* Main toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-500" />
          <div>
            <div className="font-medium text-gray-800">Smart Detection</div>
            <div className="text-sm text-gray-600">Monitor apps and websites for beauty products</div>
          </div>
        </div>
        <button
          onClick={handleToggleMonitoring}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isMonitoring ? 'bg-rose-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isMonitoring ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detection Sensitivity
            </label>
            <select
              value={config.sensitivity}
              onChange={(e) => handleConfigChange('sensitivity', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="high">High - Detect more potential matches</option>
              <option value="medium">Medium - Balanced detection</option>
              <option value="low">Low - Only high-confidence matches</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monitoring Sources
            </label>
            <div className="space-y-2">
              {['clipboard', 'dom', 'screenshots'].map((source) => (
                <label key={source} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.sources.includes(source)}
                    onChange={(e) => {
                      const newSources = e.target.checked
                        ? [...config.sources, source]
                        : config.sources.filter(s => s !== source);
                      handleConfigChange('sources', newSources);
                    }}
                    className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{source}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-1">Privacy Notice</div>
                <div>Content monitoring happens locally in your browser. No data is sent to external servers without your explicit action.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringControls;