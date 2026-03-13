import React from 'react';
import { LOGO_MELI } from '../constants';

export const Header: React.FC = () => {
  return (
    <header 
      className="w-full h-16 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] sticky top-0 z-50 transition-all"
      style={{ backgroundColor: '#FFF159' }}
    >
      <div className="container max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-start">
            <img 
                src={LOGO_MELI} 
                alt="Mercado Libre" 
                className="h-[34px] w-auto object-contain hover:opacity-95 transition-opacity" 
            />
        </div>
      </div>
    </header>
  );
};