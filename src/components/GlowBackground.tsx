import React from 'react';

const GlowBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Primary Emerald Glow */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] animate-float-slow"
        style={{ willChange: 'transform' }}
      />
      
      {/* Indigo/Blue Glow */}
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-float-medium"
        style={{ willChange: 'transform' }}
      />
      
      {/* Violet/Purple Pulsing Glow */}
      <div 
        className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[100px] animate-float-fast"
        style={{ willChange: 'transform' }}
      />

      {/* Subtle Amber Accent */}
      <div 
        className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-amber-500/10 blur-[80px] animate-float-slow"
        style={{ animationDelay: '-5s', willChange: 'transform' }}
      />
    </div>
  );
};

export default GlowBackground;
