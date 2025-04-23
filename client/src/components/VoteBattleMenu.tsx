import React from 'react';
import { motion } from 'framer-motion';

interface VoteBattleMenuProps {
  onHeadToHeadClick: () => void;
  onMoreModesClick: () => void;
  onBigFightsClick: () => void;
}

const VoteBattleMenu: React.FC<VoteBattleMenuProps> = ({
  onHeadToHeadClick,
  onMoreModesClick,
  onBigFightsClick
}) => {
  return (
    <div className="flex flex-col p-4 pt-2 pb-16 w-full max-w-xl mx-auto">
      {/* Central Post/Card - increased height and now clickable */}
      <div 
        className="w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-3 cursor-pointer transform transition-transform hover:scale-[1.02]"
        onClick={onBigFightsClick}
      >
        {/* Title bar - Moved to the top */}
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Battle of the Day</h2>
          <div className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold text-white">
            LIVE
          </div>
        </div>
        
        {/* Images of two competing animals - adjusted height */}
        <div className="relative h-80 bg-blue-900">
          <div className="absolute inset-0 flex justify-center">
            <div className="relative overflow-hidden w-full">
              <img 
                src="/first_fight.png" 
                alt="Battle of the Day" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* VS Divider - removed */}
        </div>
      </div>

      {/* Action Buttons - placed right below the battle card with increased height */}
      <div className="w-full flex space-x-3 mb-2">
        {/* Large Vote button - further increased height */}
        <motion.button
          className="flex-1 bg-yellow-500 text-black font-bold text-xl py-6 rounded-lg shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onHeadToHeadClick}
        >
          <span className="mr-2">VOTE!</span>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">1v1</span>
        </motion.button>
        
        {/* Smaller Other Modes button - height increased to match */}
        <motion.button
          className="w-32 bg-blue-600 text-white font-bold py-6 rounded-lg shadow-lg"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onMoreModesClick}
        >
          Other Modes
        </motion.button>
      </div>
    </div>
  );
};

export default VoteBattleMenu; 