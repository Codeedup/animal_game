import React from 'react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <header className="bg-black bg-opacity-50 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <motion.div 
          className="flex items-center" 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-accent text-3xl font-bold mr-2">🦁</span>
          <h1 className="text-white text-2xl font-bold">Who Will Win?</h1>
        </motion.div>
        
        <motion.div 
          className="flex space-x-4"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-primary px-3 py-1 rounded-full text-white text-sm font-semibold">
            ⏱️ 02:45
          </div>
          <div className="bg-accent px-3 py-1 rounded-full text-black text-sm font-semibold">
            👥 124 Players
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header; 