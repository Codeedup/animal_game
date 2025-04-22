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
    <div className="flex flex-col p-4 pt-2 pb-16 w-full max-w-xl mx-auto">
      {/* Central Post/Card - increased height */}
      <div className="w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-3">
        {/* Images of two competing animals - increased height */}
        <div className="relative h-96 bg-blue-900">
          <div className="absolute inset-0 flex">
            <div className="w-1/2 relative overflow-hidden">
              <img 
                src="https://placehold.co/300x400/8A2BE2/FFFFFF?text=Lion+Team" 
                alt="Lion Team" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-blue-600 bg-opacity-80 p-2">
                <h3 className="text-white font-bold text-center">Lion Pride</h3>
              </div>
            </div>
            <div className="w-1/2 relative overflow-hidden">
              <img 
                src="https://placehold.co/300x400/4B0082/FFFFFF?text=Wolf+Team" 
                alt="Wolf Team" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-red-600 bg-opacity-80 p-2">
                <h3 className="text-white font-bold text-center">Wolf Pack</h3>
              </div>
            </div>
          </div>
          
          {/* VS Divider */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="bg-gray-900 bg-opacity-50 p-4 rounded-full text-yellow-500 text-6xl font-bold"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              VS
            </motion.div>
          </div>
        </div>
        
        {/* Title bar */}
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Battle of the Day</h2>
          <div className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold text-white">
            LIVE
          </div>
        </div>
      </div>

      {/* Action Buttons - placed right below the battle card */}
      <div className="w-full flex space-x-3 mb-2">
        {/* Large Vote button */}
        <motion.button
          className="flex-1 bg-yellow-500 text-black font-bold text-xl py-3 rounded-lg shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onHeadToHeadClick}
        >
          <span className="mr-2">VOTE!</span>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">1v1</span>
        </motion.button>
        
        {/* Smaller Other Modes button */}
        <motion.button
          className="w-32 bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg"
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