import React from 'react';

interface AbmixLogoProps {
  className?: string;
  size?: number;
}

const AbmixLogo: React.FC<AbmixLogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo oficial da Abmix baseado nas imagens fornecidas */}
      <div className="relative mr-3" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Setor superior esquerdo - teal */}
          <path d="M50 15 C30.67 15 15 30.67 15 50 L50 50 Z" fill="#00B4A6"/>
          
          {/* Setor inferior direito - teal */}
          <path d="M50 85 C69.33 85 85 69.33 85 50 L50 50 Z" fill="#00B4A6"/>
          
          {/* Setor superior direito - cinza */}
          <path d="M50 15 C69.33 15 85 30.67 85 50 L50 50 Z" fill="#9CA3AF"/>
          
          {/* Setor inferior esquerdo - cinza */}
          <path d="M50 85 C30.67 85 15 69.33 15 50 L50 50 Z" fill="#9CA3AF"/>
          
          {/* Centro branco pequeno */}
          <circle cx="50" cy="50" r="5" fill="white"/>
        </svg>
      </div>
    </div>
  );
};

export default AbmixLogo;