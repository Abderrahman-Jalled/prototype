import { useState, useEffect, useCallback } from 'react';
import { contentMonitor } from '../services/contentMonitor';

interface DetectedContent {
  type: 'text' | 'image' | 'url';
  content: string;
  source: string;
  confidence: number;
  timestamp: number;
}

export const useRealtimeDetection = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [detectedContent, setDetectedContent] = useState<DetectedContent | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<DetectedContent[]>([]);

  const handleBeautyContentDetected = useCallback((event: CustomEvent) => {
    const content = event.detail as DetectedContent;
    
    // Add to history
    setDetectionHistory(prev => [content, ...prev.slice(0, 49)]); // Keep last 50
    
    // Show popup for high-confidence detections
    if (content.confidence > 0.6) {
      setDetectedContent(content);
      setShowPopup(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beautyContentDetected', handleBeautyContentDetected as EventListener);
    
    return () => {
      window.removeEventListener('beautyContentDetected', handleBeautyContentDetected as EventListener);
    };
  }, [handleBeautyContentDetected]);

  const startMonitoring = useCallback(async () => {
    try {
      await contentMonitor.startMonitoring();
      setIsMonitoring(true);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    contentMonitor.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  const toggleMonitoring = useCallback((enabled: boolean) => {
    if (enabled) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }, [startMonitoring, stopMonitoring]);

  const closePopup = useCallback(() => {
    setShowPopup(false);
    setDetectedContent(null);
  }, []);

  const analyzeDetectedContent = useCallback(() => {
    if (detectedContent) {
      // Trigger analysis with the detected content
      const event = new CustomEvent('analyzeContent', {
        detail: detectedContent
      });
      window.dispatchEvent(event);
    }
  }, [detectedContent]);

  return {
    isMonitoring,
    showPopup,
    detectedContent,
    detectionHistory,
    toggleMonitoring,
    closePopup,
    analyzeDetectedContent,
    startMonitoring,
    stopMonitoring
  };
};