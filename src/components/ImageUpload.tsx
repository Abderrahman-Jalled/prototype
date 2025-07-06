import React, { useState, useCallback } from 'react';
import { Upload, Camera, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onTextSubmit: (text: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, onTextSubmit }) => {
  const [dragActive, setDragActive] = useState(false);
  const [inputText, setInputText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleTextSubmit = () => {
    if (inputText.trim()) {
      onTextSubmit(inputText.trim());
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Camera className="w-5 h-5 inline-block mr-2" />
            Image Analysis
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
              activeTab === 'text'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-5 h-5 inline-block mr-2" />
            Text Analysis
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'image' ? (
            <div className="space-y-6">
              {uploadedImage && (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded product"
                    className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-300 hover:border-rose-400 hover:bg-rose-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Upload Beauty Product Image
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Drag and drop an image or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-200 cursor-pointer"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Choose Image
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Describe Your Beauty Products
                </h3>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe the beauty products you're looking for or paste product names, ingredients, or reviews..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                onClick={handleTextSubmit}
                disabled={!inputText.trim()}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;