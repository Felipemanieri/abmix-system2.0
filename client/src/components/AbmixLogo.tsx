import React from 'react';

interface AbmixLogoProps {
  className?: string;
  size?: number;
}

const AbmixLogo: React.FC<AbmixLogoProps> = ({ className = "", size = 40 }) => {
  // Calcular tamanhos baseados no tamanho principal
  const fontSize = Math.max(Math.floor(size / 2), 18);
  const subFontSize = Math.max(Math.floor(size / 4), 12);
  const circleSize = size * 0.9;
  
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo circular */}
      <div className="relative mr-3" style={{ width: circleSize, height: circleSize }}>
        <svg width={circleSize} height={circleSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Seção teal superior esquerda com gradiente */}
          <path d="M50 0C22.4 0 0 22.4 0 50h50V0Z" fill="url(#paint0_linear)" />
          
          {/* Seção teal inferior direita com gradiente */}
          <path d="M50 100C77.6 100 100 77.6 100 50H50V100Z" fill="url(#paint1_linear)" />
          
          {/* Seção cinza superior direita com gradiente */}
          <path d="M50 0C77.6 0 100 22.4 100 50H50V0Z" fill="url(#paint2_linear)" />
          
          {/* Seta branca */}
          <path d="M50 15C30.67 15 15 30.67 15 50H50V15Z" fill="white" />
          <path d="M50 85C69.33 85 85 69.33 85 50H50V85Z" fill="white" />
          <path d="M50 15C69.33 15 85 30.67 85 50H50V15Z" fill="white" />
          
          {/* Definições de gradientes */}
          <defs>
            <linearGradient id="paint0_linear" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0AB3B8" />
              <stop offset="1" stopColor="#0ACFB8" />
            </linearGradient>
            <linearGradient id="paint1_linear" x1="50" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0AB3B8" />
              <stop offset="1" stopColor="#0ABFB8" />
            </linearGradient>
            <linearGradient id="paint2_linear" x1="50" y1="0" x2="100" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9CA3AF" />
              <stop offset="1" stopColor="#4B5563" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Texto */}
      <div className="flex flex-col">
        <span 
          className="font-bold leading-none" 
          style={{ 
            fontSize: `${fontSize}px`, 
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ color: '#0AB3B8', fontWeight: 800 }}>Ab</span><span style={{ color: '#6B7280', fontWeight: 700 }}>mix</span>
        </span>
        <span 
          className="leading-tight" 
          style={{ 
            fontSize: `${subFontSize}px`, 
            color: '#6B7280',
            letterSpacing: '0.3px',
            fontWeight: 500,
            opacity: 0.9
          }}
        >
          Consultoria em Benefícios
        </span>
      </div>
    </div>
  );
};

export default AbmixLogo;