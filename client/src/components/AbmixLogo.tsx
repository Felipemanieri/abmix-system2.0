import React from 'react';
import logoOficial from '@assets/Logo Abmix_1753662019626.jpg';

interface AbmixLogoProps {
  className?: string;
  size?: number;
}

const AbmixLogo: React.FC<AbmixLogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoOficial} 
        alt="Abmix Logo" 
        style={{ height: size }}
        className="w-auto object-contain"
      />
    </div>
  );
};

export default AbmixLogo;