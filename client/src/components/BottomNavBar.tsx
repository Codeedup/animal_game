import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Icon SVGs
const StoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14H5V7h14v12z" />
    <path d="M7 9h10v2H7zm0 4h5v2H7z" />
  </svg>
);

const VoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 13h-5v5h5v-5zm-7-7h-5v5h5V6zm7 0h-5v5h5V6zm-7 7h-5v5h5v-5z" />
  </svg>
);

const InventoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 2h4v4h-4V5zm-6 0h4v4H6V5zm0 6h4v4H6v-4zm10 8H8v-4h8v4zm4-4h-4v-4h4v4zm0-6h-4V5h4v4z" />
  </svg>
);

const LeaderboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5V5h7v12zm7 0h-5v-6h5v6zm0-8h-5V5h5v4z" />
  </svg>
);

const FightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.29 13.29a1 1 0 0 1-1.42 1.42l-3-3a1 1 0 0 1 0-1.42l3-3a1 1 0 0 1 1.42 1.42L8.41 12l2.3 2.29zm5.71-1.29l-3 3a1 1 0 0 1-1.42-1.42l2.3-2.29-2.3-2.29a1 1 0 0 1 1.42-1.42l3 3a1 1 0 0 1 0 1.42z" />
  </svg>
);

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isHighlighted?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'store',
    label: 'Store',
    icon: <StoreIcon />
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <InventoryIcon />
  },
  {
    id: 'vote',
    label: 'Vote',
    icon: <VoteIcon />,
    isHighlighted: true
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: <LeaderboardIcon />
  },
  {
    id: 'fight',
    label: 'Big Time Fight',
    icon: <FightIcon />
  }
];

interface BottomNavBarProps {
  onNavChange?: (navId: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNavChange }) => {
  const [activeNav, setActiveNav] = useState('vote');

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
    if (onNavChange) {
      onNavChange(navId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0">
      {/* Main navigation bar */}
      <div className="grid grid-cols-5 bg-gray-800 border-t border-gray-700">
        {navItems.map((item) => {
          if (item.isHighlighted) {
            return (
              <div 
                key={item.id} 
                className="relative flex justify-center"
              >
                <motion.button
                  className="absolute -top-6 w-20 h-16 bg-yellow-500 rounded-lg shadow-lg flex flex-col items-center justify-center"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavClick(item.id)}
                >
                  <div className="h-7 w-7 mb-1 text-black">
                    {item.icon}
                  </div>
                  <p className="text-xs font-bold text-black">
                    {item.label}
                  </p>
                </motion.button>
              </div>
            );
          }

          return (
            <motion.div
              key={item.id}
              className={`
                py-3 flex flex-col items-center justify-center cursor-pointer
                ${activeNav === item.id ? 'text-white' : 'text-gray-400'}
              `}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavClick(item.id)}
            >
              <div className="h-5 w-5 mb-1">
                {item.icon}
              </div>
              <p className="text-xs font-medium truncate max-w-[60px] text-center">
                {item.label}
              </p>
              {activeNav === item.id && (
                <motion.div
                  className="h-1 w-10 bg-blue-500 rounded-t mt-1"
                  layoutId="navIndicator"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar; 