declare module 'react-confetti' {
  import * as React from 'react';
  
  interface ConfettiProps {
    width?: number;
    height?: number;
    numberOfPieces?: number;
    confettiSource?: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
    recycle?: boolean;
    wind?: number;
    gravity?: number;
    colors?: string[];
    opacity?: number;
    run?: boolean;
    [key: string]: any;
  }
  
  const Confetti: React.FC<ConfettiProps>;
  
  export default Confetti;
} 