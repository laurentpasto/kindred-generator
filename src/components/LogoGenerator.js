import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Shuffle, Download } from 'lucide-react';

const COLORS = [
  '#9EC6AA', '#FFE100', '#A5BB1A', '#2265C9',
  '#666565', '#FB5E00', '#F584B5', '#E40000', '#9774B4'
];

const LogoGenerator = () => {
  const [mainColor, setMainColor] = useState(COLORS[0]);
  const [topColor, setTopColor] = useState(COLORS[1]);
  const [currentTopShape, setCurrentTopShape] = useState(0);
  const [mainShapePath, setMainShapePath] = useState('');
  const [topShapePaths, setTopShapePaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the base URL for assets
  const getBaseUrl = () => {
    // If in development, use relative path
    if (process.env.NODE_ENV === 'development') {
      return '';
    }
    // In production, use the homepage path from package.json
    return '/kindred-generator';
  };

  const extractPathFromSVG = (svgContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const pathElement = doc.querySelector('path');
    return pathElement ? pathElement.getAttribute('d') : '';
  };

  useEffect(() => {
    const loadSVGs = async () => {
      try {
        const baseUrl = getBaseUrl();
        console.log('Loading SVGs from base URL:', baseUrl);

        // Load main shape
        const mainResponse = await fetch(`${baseUrl}/svg/main_shape.svg`);
        if (!mainResponse.ok) {
          throw new Error(`Failed to load main shape: ${mainResponse.status}`);
        }
        const mainShapeContent = await mainResponse.text();
        const mainPath = extractPathFromSVG(mainShapeContent);
        setMainShapePath(mainPath);

        // Load all variant shapes
        const paths = await Promise.all(
          Array.from({ length: 36 }, (_, i) => i + 1).map(async (num) => {
            const response = await fetch(`${baseUrl}/svg/Vectorshape--${num}.svg`);
            if (!response.ok) {
              throw new Error(`Failed to load shape ${num}: ${response.status}`);
            }
            const content = await response.text();
            return extractPathFromSVG(content);
          })
        );
        setTopShapePaths(paths);
        setLoading(false);
      } catch (error) {
        console.error('Error loading SVG files:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadSVGs();
  }, []);

  const handlePrevShape = () => {
    setCurrentTopShape(current => 
      current > 0 ? current - 1 : topShapePaths.length - 1
    );
  };

  const handleNextShape = () => {
    setCurrentTopShape(current => 
      current < topShapePaths.length - 1 ? current + 1 : 0
    );
  };

  const getRandomColor = (excludeColor) => {
    const availableColors = COLORS.filter(color => color !== excludeColor);
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  };

  const handleRandom = () => {
    const newMainColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newTopColor = getRandomColor(newMainColor);
    const newTopShape = Math.floor(Math.random() * topShapePaths.length);

    setMainColor(newMainColor);
    setTopColor(newTopColor);
    setCurrentTopShape(newTopShape);
  };

  const handleGenerate = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="${mainShapePath}" fill="${mainColor}"/>
  <path d="${topShapePaths[currentTopShape]}" fill="${topColor}"/>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logo-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8">Loading SVG files...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center gap-8 p-8 max-w-4xl mx-auto">
      <div className="flex gap-8 w-full">
        {/* Color Controls */}
        <div className="w-48 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Main Shape Color</label>
            <div className="grid grid-cols-3 gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: mainColor === color ? color : '#e5e7eb'
                  }}
                  onClick={() => {
                    setMainColor(color);
                    if (color === topColor) {
                      setTopColor(getRandomColor(color));
                    }
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Top Shape Color</label>
            <div className="grid grid-cols-3 gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: topColor === color ? color : '#e5e7eb',
                    opacity: color === mainColor ? 0.3 : 1,
                    cursor: color === mainColor ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    if (color !== mainColor) {
                      setTopColor(color);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Logo Preview */}
        <div className="flex-1 bg-gray-50 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
          {mainShapePath && topShapePaths[currentTopShape] ? (
            <svg width="200" height="200" viewBox="0 0 100 100">
              <path d={mainShapePath} fill={mainColor} />
              <path d={topShapePaths[currentTopShape]} fill={topColor} />
            </svg>
          ) : (
            <div className="text-gray-400">No shapes loaded</div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <button 
          onClick={handlePrevShape}
          className="p-2 rounded hover:bg-gray-100 border"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <span className="text-sm text-gray-600">
          Shape {currentTopShape + 1} of {topShapePaths.length}
        </span>
        
        <button 
          onClick={handleNextShape}
          className="p-2 rounded hover:bg-gray-100 border"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleRandom}
          className="flex items-center gap-2 px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
        >
          <Shuffle className="w-4 h-4" />
          Random
        </button>
        
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Download SVG
        </button>
      </div>
    </div>
  );
};

export default LogoGenerator;