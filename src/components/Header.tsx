import React from 'react';
import { Sparkles, Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white py-6 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">BeautyAI</h1>
              <p className="text-sm text-white/90">Smart Beauty Product Detection</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Search className="w-4 h-4" />
              <span className="text-sm">Advanced AI Detection</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;