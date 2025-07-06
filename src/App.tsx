import React, { useEffect } from 'react';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import ResultsSection from './components/ResultsSection';
import TrendingProducts from './components/TrendingProducts';
import Footer from './components/Footer';
import ProactivePopup from './components/ProactivePopup';
import MonitoringControls from './components/MonitoringControls';
import { useProductDetection } from './hooks/useProductDetection';
import { useRealtimeDetection } from './hooks/useRealtimeDetection';

function App() {
  const { results, loading, error, detectProducts } = useProductDetection();
  const {
    isMonitoring,
    showPopup,
    detectedContent,
    detectionHistory,
    toggleMonitoring,
    closePopup,
    analyzeDetectedContent
  } = useRealtimeDetection();

  const handleImageUpload = (file: File) => {
    detectProducts(file);
  };

  const handleTextSubmit = (text: string) => {
    detectProducts(text);
  };

  // Listen for analyze content events from popup
  useEffect(() => {
    const handleAnalyzeContent = (event: CustomEvent) => {
      const content = event.detail;
      if (content.type === 'text') {
        detectProducts(content.content);
      } else if (content.type === 'url') {
        // For URLs, we can extract the domain and create a search query
        const domain = new URL(content.content).hostname;
        detectProducts(`Beauty products from ${domain}`);
      }
    };

    window.addEventListener('analyzeContent', handleAnalyzeContent as EventListener);
    return () => window.removeEventListener('analyzeContent', handleAnalyzeContent as EventListener);
  }, [detectProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Discover Beauty Products with AI
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload an image or describe any beauty product to get detailed analysis, 
            ingredient insights, and personalized recommendations powered by advanced AI.
          </p>
        </div>

        {/* Real-time monitoring controls */}
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <MonitoringControls 
            onToggleMonitoring={toggleMonitoring}
            isMonitoring={isMonitoring}
          />
        </div>

        <ImageUpload 
          onImageUpload={handleImageUpload}
          onTextSubmit={handleTextSubmit}
        />

        {error && (
          <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <ResultsSection results={results} loading={loading} />

        {!loading && !results && <TrendingProducts />}

        {/* Detection history */}
        {detectionHistory.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Detections</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detectionHistory.slice(0, 6).map((detection, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {new Date(detection.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {Math.round(detection.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {detection.type === 'url' 
                      ? `Beauty site: ${new URL(detection.content).hostname}`
                      : detection.content.substring(0, 100)
                    }
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    From: {detection.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Proactive popup */}
      <ProactivePopup
        isVisible={showPopup}
        onClose={closePopup}
        onAnalyze={analyzeDetectedContent}
        detectedContent={detectedContent}
      />
    </div>
  );
}

export default App;