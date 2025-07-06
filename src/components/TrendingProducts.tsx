import React from 'react';
import { TrendingUp, Star, ShoppingBag } from 'lucide-react';

const TrendingProducts: React.FC = () => {
  const trendingProducts = [
    {
      name: "Vitamin C Serum",
      brand: "The Ordinary",
      image: "https://images.pexels.com/photos/7755266/pexels-photo-7755266.jpeg?auto=compress&cs=tinysrgb&w=300",
      price: "$15-25",
      rating: 4.5,
      trend: "+15%"
    },
    {
      name: "Retinol Complex",
      brand: "CeraVe",
      image: "https://images.pexels.com/photos/7755267/pexels-photo-7755267.jpeg?auto=compress&cs=tinysrgb&w=300",
      price: "$20-35",
      rating: 4.3,
      trend: "+22%"
    },
    {
      name: "Hyaluronic Acid",
      brand: "Neutrogena",
      image: "https://images.pexels.com/photos/7755268/pexels-photo-7755268.jpeg?auto=compress&cs=tinysrgb&w=300",
      price: "$12-18",
      rating: 4.7,
      trend: "+18%"
    },
    {
      name: "Niacinamide Serum",
      brand: "Paula's Choice",
      image: "https://images.pexels.com/photos/7755269/pexels-photo-7755269.jpeg?auto=compress&cs=tinysrgb&w=300",
      price: "$25-40",
      rating: 4.4,
      trend: "+12%"
    }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-rose-500" />
            <h2 className="text-3xl font-bold text-gray-800">Trending Beauty Products</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the most popular beauty products that are trending right now based on AI analysis and user preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {product.trend}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">{product.price}</span>
                  <button className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingProducts;