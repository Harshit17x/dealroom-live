import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

/**
 * Official FluidGradientText component (Chánh Đại / @ncdai)
 * Renders text inside an SVG with a fluid gradient that shifts with pointer movement.
 * Blends directly into the page background with transparent backdrop and sliced baseline.
 */
export function FluidGradientText({
  text = 'dealroom',
  svgViewBoxWidth,
  svgViewBoxHeight = 300,
  className = '',
  style = {}
}) {
  const calculatedWidth = svgViewBoxWidth || Math.max(1200, text.length * 170);

  const gradientX1Raw = useMotionValue(0.5);
  const gradientX1 = useSpring(
    useTransform(gradientX1Raw, [0, 1], [0, calculatedWidth]),
    {
      stiffness: 150,
      damping: 25,
    }
  );

  const handleMouseMove = (event) => {
    const containerRect = event.currentTarget.getBoundingClientRect();
    if (containerRect.width > 0) {
      gradientX1Raw.set(
        (event.clientX - containerRect.left) / containerRect.width
      );
    }
  };

  const handleTouchMove = (event) => {
    if (event.touches && event.touches[0]) {
      const touch = event.touches[0];
      const containerRect = event.currentTarget.getBoundingClientRect();
      if (containerRect.width > 0) {
        gradientX1Raw.set(
          (touch.clientX - containerRect.left) / containerRect.width
        );
      }
    }
  };

  const handleMouseLeave = () => {
    gradientX1Raw.set(0.5);
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: 'default',
        background: 'transparent',
        borderBottom: '1px solid var(--border-default)',
        ...style
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
    >
      <svg
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          userSelect: 'none',
          transform: 'translateY(37.5%)'
        }}
        viewBox={`0 0 ${calculatedWidth} ${svgViewBoxHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="2"
          fill="url(#fluid_gradient_text_linear)"
          style={{
            fontFamily: 'Helvetica, Arial, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: svgViewBoxHeight,
            fontWeight: 'bold',
            letterSpacing: '-0.02em'
          }}
        >
          {text}
        </text>
        <defs>
          <motion.linearGradient
            id="fluid_gradient_text_linear"
            x1={gradientX1}
            y1="0"
            x2={calculatedWidth / 2}
            y2={svgViewBoxHeight}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.625" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </motion.linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default FluidGradientText;
