import React from 'react';
import { motion } from 'framer-motion';

interface TopBarProps {
  level: number;
  currentXP: number;
  maxXP: number;
  onSettingsClick: () => void;
  onFriendsClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  level = 5,
  currentXP = 256,
  maxXP = 300,
  onSettingsClick,
  onFriendsClick = () => {}
}) => {
  const progressPercentage = (currentXP / maxXP) * 100;

  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
      {/* Level Progress Bar and Friends Button */}
      <div className="flex items-center">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gray-800 rounded-full p-1 flex items-center mr-2">
            <span className="text-white text-xs font-bold bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center">
              {level}
            </span>
          </div>
          <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{currentXP}/{maxXP}</span>
            </div>
          </div>
        </motion.div>
        
        {/* Friends Button - now horizontally aligned with level */}
        <motion.button
          className="ml-3 p-2 rounded-full bg-gray-800 shadow-md w-8 h-8 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onFriendsClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </motion.button>
      </div>

      {/* Settings Button */}
      <motion.button
        className="bg-gray-800 rounded-full p-2 text-white mr-2"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onSettingsClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </motion.button>
    </div>
  );
};

export default TopBar; 