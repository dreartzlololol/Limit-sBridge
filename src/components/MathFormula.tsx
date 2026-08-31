import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ math, displayMode = true, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: displayMode,
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX render error:', err);
        containerRef.current.innerText = math;
      }
    }
  }, [math, displayMode]);

  return <div ref={containerRef} className={`math-formula ${className}`} />;
};
