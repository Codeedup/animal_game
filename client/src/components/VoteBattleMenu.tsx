import React from 'react';
import { motion } from 'framer-motion';

interface VoteBattleMenuProps {
  onHeadToHeadClick: () => void;
  onMoreModesClick: () => void;
}

const VoteBattleMenu: React.FC<VoteBattleMenuProps> = ({
  onHeadToHeadClick,
  onMoreModesClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Choose Battle Mode</h1>
      
      <div className="grid grid-cols-1 gap-6 w-full">
        {/* Head to Head Button */}
        <motion.button
          className="relative bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 h-36 flex flex-col justify-between overflow-hidden shadow-lg"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onHeadToHeadClick}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400 rounded-full -mr-6 -mt-6 opacity-30" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-700 rounded-full -ml-4 -mb-4 opacity-30" />
          
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-white">Head to Head</h2>
            <div className="bg-yellow-800 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <p className="text-white text-opacity-80 text-sm">
              Classic 1v1 animal showdown. <br />Vote for your favorite!
            </p>
            <span className="bg-yellow-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              Most Popular
            </span>
          </div>
        </motion.button>
        
        {/* More Modes Button */}
        <motion.button
          className="relative bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 h-36 flex flex-col justify-between overflow-hidden shadow-lg"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onMoreModesClick}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-400 rounded-full -mr-6 -mt-6 opacity-30" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-700 rounded-full -ml-4 -mb-4 opacity-30" />
          
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-white">More Modes</h2>
            <div className="bg-purple-800 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <p className="text-white text-opacity-80 text-sm">
              Explore tournament, team battles, <br />and special events.
            </p>
            <span className="bg-purple-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              New!
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default VoteBattleMenu; 