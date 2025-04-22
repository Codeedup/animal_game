import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Mock data for demo
interface AnimalSquad {
  id: string;
  name: string;
  imageUrl: string;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  cosmetics: {
    hat?: string;
    accessory?: string;
    frame?: string;
  };
}

interface GameScreenProps {
  onBackToMenu?: () => void;
}

const mockSquadA: AnimalSquad = {
  id: 'squad-a',
  name: 'Lion Pride',
  imageUrl: 'https://placehold.co/300x400/8A2BE2/FFFFFF?text=Lions'
};

const mockSquadB: AnimalSquad = {
  id: 'squad-b',
  name: 'Wolf Pack',
  imageUrl: 'https://placehold.co/300x400/4B0082/FFFFFF?text=Wolves'
};

const mockPlayers: Player[] = [
  {
    id: 'player1',
    name: 'GamerKid123',
    avatar: 'https://placehold.co/100/CCFF00/000000?text=P1',
    cosmetics: { hat: '👑', frame: '⭐' }
  },
  {
    id: 'player2',
    name: 'AnimalLover',
    avatar: 'https://placehold.co/100/FF6F61/FFFFFF?text=P2',
    cosmetics: { accessory: '🎮' }
  },
  {
    id: 'player3',
    name: 'WildWarrior',
    avatar: 'https://placehold.co/100/00BFFF/FFFFFF?text=P3',
    cosmetics: { hat: '🎩', accessory: '🔥' }
  },
  {
    id: 'player4',
    name: 'ZooKeeper',
    avatar: 'https://placehold.co/100/FFEA00/000000?text=P4',
    cosmetics: { frame: '🌟' }
  }
];

const GameScreen: React.FC<GameScreenProps> = ({ onBackToMenu }) => {
  const [votedFor, setVotedFor] = useState<string | null>(null);

  const handleVote = (squadId: string) => {
    setVotedFor(squadId);
    // Here you would send the vote to your backend
    console.log(`Voted for ${squadId}`);
  };

  return (
    <div className="flex flex-col h-screen relative">
      {/* Back button */}
      {onBackToMenu && (
        <button 
          className="absolute top-2 left-4 bg-gray-800 p-2 rounded-full text-white"
          onClick={onBackToMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
      )}
      
      {/* Main Battle Area */}
      <div className="flex-1 flex justify-between items-center px-8 pt-10">
        {/* Squad A */}
        <div className="flex flex-col items-center">
          <motion.div
            className={`relative rounded-lg overflow-hidden border-8 ${
              votedFor === mockSquadA.id ? 'border-yellow-500' : 'border-blue-600'
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <img
              src={mockSquadA.imageUrl}
              alt={mockSquadA.name}
              className="w-64 h-80 object-cover"
            />
            <div className={`absolute bottom-0 left-0 right-0 ${
              votedFor === mockSquadA.id ? 'bg-yellow-500' : 'bg-blue-600'
            } bg-opacity-80 p-2 text-center`}>
              <h3 className="text-white font-bold text-xl">{mockSquadA.name}</h3>
            </div>
          </motion.div>
          <motion.button
            className={`mt-4 w-40 py-2 rounded-lg font-bold ${
              votedFor === mockSquadA.id 
                ? 'bg-yellow-500 text-black' 
                : votedFor !== null
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white'
            }`}
            whileHover={votedFor === null ? { scale: 1.05 } : {}}
            whileTap={votedFor === null ? { scale: 0.95 } : {}}
            onClick={() => handleVote(mockSquadA.id)}
            disabled={votedFor !== null}
          >
            {votedFor === mockSquadA.id ? 'Voted!' : 'Vote'}
          </motion.button>
        </div>

        {/* VS Divider */}
        <div className="text-center">
          <motion.div
            className="text-yellow-500 text-7xl font-bold"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            VS
          </motion.div>
        </div>

        {/* Squad B */}
        <div className="flex flex-col items-center">
          <motion.div
            className={`relative rounded-lg overflow-hidden border-8 ${
              votedFor === mockSquadB.id ? 'border-yellow-500' : 'border-red-600'
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <img
              src={mockSquadB.imageUrl}
              alt={mockSquadB.name}
              className="w-64 h-80 object-cover"
            />
            <div className={`absolute bottom-0 left-0 right-0 ${
              votedFor === mockSquadB.id ? 'bg-yellow-500' : 'bg-red-600'
            } bg-opacity-80 p-2 text-center`}>
              <h3 className="text-white font-bold text-xl">{mockSquadB.name}</h3>
            </div>
          </motion.div>
          <motion.button
            className={`mt-4 w-40 py-2 rounded-lg font-bold ${
              votedFor === mockSquadB.id 
                ? 'bg-yellow-500 text-black' 
                : votedFor !== null
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-red-600 text-white'
            }`}
            whileHover={votedFor === null ? { scale: 1.05 } : {}}
            whileTap={votedFor === null ? { scale: 0.95 } : {}}
            onClick={() => handleVote(mockSquadB.id)}
            disabled={votedFor !== null}
          >
            {votedFor === mockSquadB.id ? 'Voted!' : 'Vote'}
          </motion.button>
        </div>
      </div>

      {/* Player Cosmetics Row */}
      <div className="bg-black bg-opacity-30 p-4 mt-auto">
        <h3 className="text-white text-center mb-3 text-lg">Players in Battle</h3>
        <div className="flex justify-center space-x-6">
          {mockPlayers.map((player) => (
            <motion.div
              key={player.id}
              className="flex flex-col items-center"
              whileHover={{ y: -5 }}
            >
              <div className="player-avatar">
                <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                {player.cosmetics.hat && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-lg">
                    {player.cosmetics.hat}
                  </div>
                )}
                {player.cosmetics.accessory && (
                  <div className="absolute bottom-0 right-0 text-lg">
                    {player.cosmetics.accessory}
                  </div>
                )}
                {player.cosmetics.frame && (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none">
                    {player.cosmetics.frame}
                  </div>
                )}
              </div>
              <span className="text-white text-xs mt-1">{player.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameScreen; 