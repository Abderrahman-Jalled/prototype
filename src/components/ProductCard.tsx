import React from 'react';
import { Star, ShoppingCart, Heart, ExternalLink } from 'lucide-react';

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

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{product.product_name}</h3>
              {product.trending && (
                <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                  Trending
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">{product.category}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">{product.subcategory}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(product.confidence_score)}`}>
              {Math.round(product.confidence_score * 100)}% match
            </span>
            <Heart className="w-5 h-5 text-gray-400 hover:text-rose-500 cursor-pointer transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            {renderStars(product.rating_estimate)}
            <span className="text-sm text-gray-600 ml-1">({product.rating_estimate})</span>
          </div>
          <span className="text-lg font-bold text-gray-800">{product.price_range}</span>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Key Benefits</h4>
            <div className="flex flex-wrap gap-1">
              {product.primary_benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Key Ingredients</h4>
            <div className="flex flex-wrap gap-1">
              {product.key_ingredients.slice(0, 3).map((ingredient, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                >
                  {ingredient}
                </span>
              ))}
              {product.key_ingredients.length > 3 && (
                <span className="text-xs text-gray-500">+{product.key_ingredients.length - 3} more</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>For {product.skin_type}</span>
            <span>•</span>
            <span>{product.age_group}</span>
            <span>•</span>
            <span>{product.concern_addressed}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <button className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Shop Now
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;