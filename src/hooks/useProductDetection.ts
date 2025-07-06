import { useState, useCallback } from 'react';

interface Product {
  product_name: string;
  brand: string;
  category: string;
  subcategory: string;
  confidence_score: number;
  key_ingredients: string[];
  primary_benefits: string[];
  skin_type: string;
  price_range: string;
  popularity_score: number;
  trending: boolean;
  similar_products: string[];
  where_to_buy: string[];
  rating_estimate: number;
  age_group: string;
  concern_addressed: string;
}

interface DetectionResult {
  detection_triggered: boolean;
  products_found: Product[];
  context_analysis: {
    source_type: string;
    detection_context: string;
    urgency_level: string;
    recommendation_type: string;
  };
  popup_trigger: {
    should_show: boolean;
    priority: string;
    message_tone: string;
    call_to_action: string;
  };
}

export const useProductDetection = () => {
  const [results, setResults] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMockResults = useCallback((input: string): DetectionResult => {
    // Mock detection logic - in real app, this would call Gemini API
    const mockProducts: Product[] = [
      {
        product_name: "Advanced Retinol Serum",
        brand: "The Ordinary",
        category: "skincare",
        subcategory: "anti-aging serum",
        confidence_score: 0.95,
        key_ingredients: ["Retinol", "Hyaluronic Acid", "Vitamin E"],
        primary_benefits: ["Anti-aging", "Reduces fine lines", "Improves texture"],
        skin_type: "all skin types",
        price_range: "$15-25",
        popularity_score: 0.9,
        trending: true,
        similar_products: ["CeraVe Retinol", "Neutrogena Rapid Wrinkle Repair"],
        where_to_buy: ["Sephora", "Ulta", "Amazon"],
        rating_estimate: 4.3,
        age_group: "adults",
        concern_addressed: "aging"
      },
      {
        product_name: "Hydrating Cleanser",
        brand: "CeraVe",
        category: "skincare",
        subcategory: "facial cleanser",
        confidence_score: 0.87,
        key_ingredients: ["Ceramides", "Niacinamide", "Hyaluronic Acid"],
        primary_benefits: ["Deep cleansing", "Hydration", "Barrier repair"],
        skin_type: "dry to normal",
        price_range: "$12-18",
        popularity_score: 0.85,
        trending: false,
        similar_products: ["Neutrogena Hydra Boost", "La Roche-Posay Toleriane"],
        where_to_buy: ["CVS", "Walgreens", "Target"],
        rating_estimate: 4.5,
        age_group: "all ages",
        concern_addressed: "dryness"
      },
      {
        product_name: "Vitamin C Brightening Serum",
        brand: "Mad Hippie",
        category: "skincare",
        subcategory: "vitamin c serum",
        confidence_score: 0.92,
        key_ingredients: ["Vitamin C", "Vitamin E", "Ferulic Acid"],
        primary_benefits: ["Brightening", "Antioxidant protection", "Even skin tone"],
        skin_type: "all skin types",
        price_range: "$25-35",
        popularity_score: 0.88,
        trending: true,
        similar_products: ["Skinceuticals CE Ferulic", "Drunk Elephant C-Firma"],
        where_to_buy: ["Sephora", "Dermstore", "Amazon"],
        rating_estimate: 4.4,
        age_group: "adults",
        concern_addressed: "dullness"
      }
    ];

    return {
      detection_triggered: true,
      products_found: mockProducts,
      context_analysis: {
        source_type: input.includes('image') ? 'product_image' : 'text',
        detection_context: 'user_search',
        urgency_level: 'medium',
        recommendation_type: 'direct_match'
      },
      popup_trigger: {
        should_show: true,
        priority: 'high',
        message_tone: 'informative',
        call_to_action: 'Shop Now'
      }
    };
  }, []);

  const detectProducts = useCallback(async (input: string | File) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const inputString = typeof input === 'string' ? input : 'uploaded image';
      const result = generateMockResults(inputString);
      
      setResults(result);
    } catch (err) {
      setError('Failed to analyze products. Please try again.');
      console.error('Detection error:', err);
    } finally {
      setLoading(false);
    }
  }, [generateMockResults]);

  return {
    results,
    loading,
    error,
    detectProducts
  };
};