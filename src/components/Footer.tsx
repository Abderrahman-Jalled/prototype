import React from 'react';
import { Sparkles, Heart, Shield, Zap } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-rose-500" />
              <span className="text-xl font-bold">BeautyAI</span>
            </div>
            <p className="text-gray-400 mb-4">
              Advanced AI-powered beauty product detection and analysis for the modern beauty enthusiast.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm text-gray-400">Made with love</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>AI-Powered Detection</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Real-time Analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Product Recommendations</span>
              </li>
              <li className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Trending Products</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Skincare</li>
              <li>Makeup</li>
              <li>Hair Care</li>
              <li>Wellness</li>
              <li>Beauty Tools</li>
              <li>Fragrance</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>How it Works</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Contact Us</li>
              <li>FAQ</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 BeautyAI. All rights reserved. Powered by advanced AI technology.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;