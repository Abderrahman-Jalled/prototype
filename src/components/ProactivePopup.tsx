import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShoppingBag, Eye, Clock, TrendingUp } from 'lucide-react';

interface DetectedProduct {
  name: string;
  brand: string;
  confidence: number;
  source: string;
  timestamp: number;
}

interface ProactivePopupProps {
  isVisible: boolean;
  onClose: () => void;
  onAnalyze: () => void;
  detectedContent: {
    type: 'text' | 'image' | 'url';
    content: string;
    source: string;
    confidence: number;
  } | null;
}

const ProactivePopup: React.FC<ProactivePopupProps> = ({
  isVisible,
  onClose,
  onAnalyze,
  detectedContent
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoCloseTimer, setAutoCloseTimer] = useState<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto-close after 10 seconds if user doesn't interact
      const timer = window.setTimeout(() => {
        handleClose();
      }, 10000);
      
      setAutoCloseTimer(timer);
    } else {
      setIsAnimating(false);
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        setAutoCloseTimer(null);
      }
    }

    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleAnalyze = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
    onAnalyze();
    handleClose();
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'clipboard': return <Clock className="w-4 h-4" />;
      case 'navigation': return <TrendingUp className="w-4 h-4" />;
      case 'dom_mutation': return <Eye className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'clipboard': return 'Clipboard';
      case 'navigation': return 'Website';
      case 'dom_mutation': return 'Page Content';
      case 'dom_image': return 'Product Image';
      default: return 'Detected';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getPopupMessage = () => {
    if (!detectedContent) return 'Beauty products detected!';
    
    const confidence = detectedContent.confidence;
    if (confidence >= 0.8) {
      return 'High-confidence beauty product detection!';
    } else if (confidence >= 0.6) {
      return 'Beauty products found in your activity';
    } else {
      return 'Potential beauty products detected';
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div 
        className={`fixed top-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transform transition-all duration-300 ${
          isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">BeautyAI Detection</h3>
                <p className="text-xs text-white/90">{getPopupMessage()}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {detectedContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {getSourceIcon(detectedContent.source)}
                  <span>From {getSourceLabel(detectedContent.source)}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(detectedContent.confidence)}`}>
                  {Math.round(detectedContent.confidence * 100)}% confidence
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {detectedContent.type === 'url' 
                    ? `Beauty shopping detected on ${new URL(detectedContent.content).hostname}`
                    : detectedContent.content.length > 100 
                      ? `${detectedContent.content.substring(0, 100)}...`
                      : detectedContent.content
                  }
                </p>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="bg-rose-500 rounded-full p-1 mt-0.5">
                    <ShoppingBag className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-rose-800 mb-1">
                      Get AI-Powered Analysis
                    </h4>
                    <p className="text-xs text-rose-600">
                      Discover detailed product information, ingredients, reviews, and personalized recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAnalyze}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Analyze Now
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600"
            >
              Dismiss
            </button>
          </div>

          {/* Auto-close indicator */}
          <div className="mt-3 bg-gray-100 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-[10000ms] ease-linear"
              style={{ width: isVisible ? '0%' : '100%' }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">Auto-closes in 10 seconds</p>
        </div>
      </div>
    </>
  );
};

export default ProactivePopup;