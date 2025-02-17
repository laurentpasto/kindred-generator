import React, { useState, useEffect } from 'react';

const COLORS = [
  '#9EC6AA', '#FFE100', '#A5BB1A', '#2265C9',
  '#666565', '#FB5E00', '#F584B5', '#E40000', '#9774B4'
];

const TOP_SHAPE_FILES = [
  'Vectorshape--1.svg', 'Vectorshape--2.svg', 'Vectorshape--3.svg',
  'Vectorshape--4.svg', 'Vectorshape--5.svg', 'Vectorshape--6.svg',
  'Vectorshape--7.svg', 'Vectorshape--8.svg', 'Vectorshape--9.svg',
  'Vectorshape--10.svg', 'Vectorshape--11.svg', 'Vectorshape--12.svg',
  'Vectorshape--13.svg', 'Vectorshape--14.svg', 'Vectorshape--15.svg',
  'Vectorshape--16.svg', 'Vectorshape--17.svg', 'Vectorshape--18.svg',
  'Vectorshape--19.svg', 'Vectorshape--20.svg', 'Vectorshape--21.svg',
  'Vectorshape--22.svg', 'Vectorshape--23.svg', 'Vectorshape--24.svg',
  'Vectorshape--25.svg', 'Vectorshape--26.svg', 'Vectorshape--27.svg',
  'Vectorshape--28.svg', 'Vectorshape--29.svg', 'Vectorshape--30.svg',
  'Vectorshape--31.svg', 'Vectorshape--32.svg', 'Vectorshape--33.svg',
  'Vectorshape--34.svg', 'Vectorshape--35.svg', 'Vectorshape--36.svg'
];

const LogoGenerator = () => {
  const [mainColor, setMainColor] = useState(COLORS[0]);
  const [topColor, setTopColor] = useState(COLORS[1]);
  const [currentTopShape, setCurrentTopShape] = useState(0);
  const [mainShapePath, setMainShapePath] = useState('');
  const [topShapePaths, setTopShapePaths] = useState([]);
  const [loading, setLoading] = useState(true);

  const extractPathFromSVG = (svgContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const pathElement = doc.querySelector('path');
    return pathElement ? pathElement.getAttribute('d') : '';
  };

  useEffect(() => {
    const loadSVGs = async () => {
      try {
        const mainShapeContent = await fetch('main_shape.svg').then(response => response.text());
        const mainPath = extractPathFromSVG(mainShapeContent);
        setMainShapePath(mainPath);

        const paths = await Promise.all(
          TOP_SHAPE_FILES.map(async (filename) => {
            const content = await fetch(filename).then(response => response.text());
            return extractPathFromSVG(content);
          })
        );
        setTopShapePaths(paths);
        setLoading(false);
      } catch (error) {
        console.error('Error loading SVG files:', error);
        setLoading(false);
      }
    };

    loadSVGs();
  }, []);

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
    return React.createElement('div', { className: 'p-8' }, 'Loading SVG files...');
  }

  return React.createElement(
    'div',
    { className: 'p-8 flex gap-8' },
    React.createElement(
      'div',
      { className: 'w-48 space-y-6' },
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement('label', { className: 'block text-sm text-gray-600' }, 'Main Shape Color'),
        React.createElement(
          'div',
          { className: 'grid grid-cols-3 gap-2' },
          COLORS.map((color) =>
            React.createElement(
              'button',
              {
                key: color,
                className: 'w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400',
                style: { backgroundColor: color },
                onClick: () => {
                  setMainColor(color);
                  if (color === topColor) {
                    setTopColor(getRandomColor(color));
                  }
                }
              }
            )
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement('label', { className: 'block text-sm text-gray-600' }, 'Top Shape Color'),
        React.createElement(
          'div',
          { className: 'grid grid-cols-3 gap-2' },
          COLORS.map((color) =>
            React.createElement(
              'button',
              {
                key: color,
                className: 'w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400',
                style: {
                  backgroundColor: color,
                  opacity: color === mainColor ? 0.3 : 1,
                  cursor: color === mainColor ? 'not-allowed' : 'pointer'
                },
                onClick: () => {
                  if (color !== mainColor) {
                    setTopColor(color);
                  }
                }
              }
            )
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'text-sm text-gray-600' },
        `Current Shape: ${currentTopShape + 1} of ${topShapePaths.length}`
      ),
      React.createElement(
        'button',
        {
          onClick: handleRandom,
          className: 'w-full px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50'
        },
        'Random'
      ),
      React.createElement(
        'button',
        {
          onClick: handleGenerate,
          className: 'w-full px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50'
        },
        'Generate'
      )
    ),
    React.createElement(
      'div',
      { className: 'w-96 h-96 bg-gray-100 rounded-lg flex items-center justify-center' },
      React.createElement(
        'svg',
        { width: '200', height: '200', viewBox: '0 0 100 100' },
        React.createElement('path', { d: mainShapePath, fill: mainColor }),
        React.createElement('path', { d: topShapePaths[currentTopShape], fill: topColor })
      )
    )
  );
};

export default LogoGenerator;
