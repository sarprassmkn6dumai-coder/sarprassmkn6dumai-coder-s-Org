import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showShadow?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  showShadow = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${
        showShadow ? 'drop-shadow-lg' : ''
      } ${className}`}
    >
      <img
        src="/logo-smkn6.svg"
        alt="Logo SMKN 6 Kota Dumai"
        className="w-full h-full object-contain select-none"
        loading="eager"
      />
    </div>
  );
};
