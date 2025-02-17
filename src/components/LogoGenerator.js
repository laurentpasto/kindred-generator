import React, { useState } from 'react';
import shapes from '../data/shapes'; // Import your shapes data
import colors from '../data/colors'; // Import your colors data

const LogoGenerator = () => {
  const [mainShape, setMainShape] = useState(shapes[0]);
  const [topShape, setTopShape] = useState(shapes[1]);
  const [mainColor, setMainColor] = useState(colors[0]);
  const [topColor, setTopColor] = useState(colors[1]);

  const handleRandom = () => {
    let newMainShape = shapes[Math.floor(Math.random() * shapes.length)];
    let newTopShape = shapes[Math.floor(Math.random() * shapes.length)];
    let newMainColor = colors[Math.floor(Math.random() * colors.length)];
    let newTopColor = colors[Math.floor(Math.random() * colors.length)];

    // Ensure the top shape color is different from the main shape color
    while (newTopColor === newMainColor) {
      newTopColor = colors[Math.floor(Math.random() * colors.length)];
    }

    setMainShape(newMainShape);
    setTopShape(newTopShape);
    setMainColor(newMainColor);
    setTopColor(newTopColor);
  };

  return (
    <div>
      <div>
        <svg width="200" height="200">
          <rect width="200" height="200" fill={mainColor} />
          <use xlinkHref={`#${mainShape}`} fill={mainColor} />
          <use xlinkHref={`#${topShape}`} fill={topColor} />
        </svg>
      </div>
      <button onClick={handleRandom}>Random</button>
    </div>
  );
};

export default LogoGenerator;
