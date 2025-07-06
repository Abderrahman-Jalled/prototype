import React from 'react';
import { TrendingUp, Sparkles, Filter } from 'lucide-react';
import ProductCard from './ProductCard';

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

interface ResultsSectionProps {
  results: DetectionResult | null;
  loading: boolean;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ results, loading }) => {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full mb-4 animate-spin">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Products...</h3>
          <p className="text-gray-600">Our AI is detecting beauty products and gathering insights</p>
        </div>
      </div>
    );
  }

  if (!results || !results.detection_triggered) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center bg-gray-50 rounded-xl p-8">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Filter className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Beauty Products Detected</h3>
          <p className="text-gray-600">Try uploading an image of beauty products or describing specific cosmetics, skincare, or wellness items.</p>
        </div>
      </div>
    );
  }

  const { products_found, context_analysis, popup_trigger } = results;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-full p-2">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Detection Results</h2>
            <p className="text-gray-600">
              Found {products_found.length} product{products_found.length !== 1 ? 's' : ''} • 
              {context_analysis.source_type} • {popup_trigger.priority} priority
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Analysis Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-rose-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-rose-600 mb-1">
                {products_found.length}
              </div>
              <div className="text-sm text-gray-600">Products Found</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {products_found.filter(p => p.trending).length}
              </div>
              <div className="text-sm text-gray-600">Trending Items</div>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-pink-600 mb-1">
                {Math.round(products_found.reduce((acc, p) => acc + p.confidence_score, 0) / products_found.length * 100)}%
              </div>
              <div className="text-sm text-gray-600">Avg. Confidence</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products_found.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>

      {popup_trigger.should_show && (
        <div className="mt-8 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">{popup_trigger.call_to_action}</h3>
          <p className="text-white/90 mb-4">
            {popup_trigger.message_tone === 'promotional' && 'Special deals available on these products!'}
            {popup_trigger.message_tone === 'educational' && 'Learn more about these beauty products and their benefits.'}
            {popup_trigger.message_tone === 'informative' && 'Get detailed information about these products.'}
          </p>
          <button className="bg-white text-rose-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            {popup_trigger.call_to_action}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;