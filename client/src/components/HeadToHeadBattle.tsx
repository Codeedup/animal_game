import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

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
}

interface HeadToHeadBattleProps {
  onBackToMenu: () => void;
}

// Mock animal squads
const animalSquads: AnimalSquad[] = [
  {
    id: 'lions',
    name: 'Lion Pride',
    imageUrl: 'https://placehold.co/300x400/8A2BE2/FFFFFF?text=Lions'
  },
  {
    id: 'wolves',
    name: 'Wolf Pack',
    imageUrl: 'https://placehold.co/300x400/4B0082/FFFFFF?text=Wolves'
  },
  {
    id: 'tigers',
    name: 'Tiger Team',
    imageUrl: 'https://placehold.co/300x400/FF6F61/FFFFFF?text=Tigers'
  },
  {
    id: 'bears',
    name: 'Bear Clan',
    imageUrl: 'https://placehold.co/300x400/00BFFF/FFFFFF?text=Bears'
  }
];

// Mock data for matched player
const mockPlayer: Player = {
  id: 'player2',
  name: 'AnimalLover',
  avatar: 'https://placehold.co/100/FF6F61/FFFFFF?text=P2'
};

const HeadToHeadBattle: React.FC<HeadToHeadBattleProps> = ({ onBackToMenu }) => {
  // State for the two randomly selected squads
  const [squadA, setSquadA] = useState<AnimalSquad | null>(null);
  const [squadB, setSquadB] = useState<AnimalSquad | null>(null);
  
  // Voting state
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [opponentVote, setOpponentVote] = useState<string | null>(null);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [matchState, setMatchState] = useState<'connecting' | 'voting' | 'results'>('connecting');
  
  // Results state
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resultsTimeout, setResultsTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Handle showing results
  const handleShowResults = useCallback(() => {
    setMatchState('results');
    setShowResults(true);
    
    // Start confetti if there's a match
    const userDidNotVote = !votedFor;
    const match = votedFor === opponentVote && !userDidNotVote;
    
    if (match) {
      setShowConfetti(true);
      
      // Stop confetti after 5 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      // Clean up timeout if component unmounts
      setResultsTimeout(confettiTimer);
    }
    
    // Auto return to menu after 7 seconds
    const timer = setTimeout(() => {
      onBackToMenu();
    }, 7000);
    
    // Clean up timeout if component unmounts
    setResultsTimeout(oldTimer => {
      if (oldTimer) clearTimeout(oldTimer);
      return timer;
    });
  }, [votedFor, opponentVote, onBackToMenu]);
  
  // Simulate finding an opponent
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setMatchState('voting');
      
      // Randomly select two different squads
      const shuffled = [...animalSquads].sort(() => 0.5 - Math.random());
      setSquadA(shuffled[0]);
      setSquadB(shuffled[1]);
      
      // Start the voting timer
      setTimeLeft(15);
    }, 2000);
    
    return () => clearTimeout(connectTimer);
  }, []);
  
  // Handle vote
  const handleVote = useCallback((squadId: string) => {
    setVotedFor(squadId);
    // Randomly determine when opponent votes (between 1-5 seconds)
    const opponentVoteDelay = Math.floor(Math.random() * 5000) + 1000;
    setTimeout(() => {
      // 50% chance they vote for the same squad
      const sameVote = Math.random() > 0.5;
      const oppositeSquadId = squadId === squadA?.id ? squadB?.id : squadA?.id;
      setOpponentVote(sameVote ? squadId : (oppositeSquadId || squadId));
    }, opponentVoteDelay);
  }, [squadA, squadB]);
  
  // Handle timer countdown
  useEffect(() => {
    if (matchState !== 'voting' || timeLeft <= 0) return;
    
    // Skip timer if both players have voted
    if (votedFor && opponentVote) {
      handleShowResults();
      return;
    }
    
    const timer = setTimeout(() => {
      if (timeLeft > 0) {
        setTimeLeft(prevTime => prevTime - 1);
      }
      
      // When timer ends, show results
      if (timeLeft === 1) {
        // Simulate opponent's vote if they haven't voted yet
        if (!opponentVote) {
          setOpponentVote(Math.random() > 0.5 ? squadA?.id || null : squadB?.id || null);
        }
        handleShowResults();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, matchState, opponentVote, votedFor, squadA, squadB, handleShowResults]);
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (resultsTimeout) {
        clearTimeout(resultsTimeout);
      }
    };
  }, [resultsTimeout]);
  
  // Render connecting screen
  if (matchState === 'connecting') {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <motion.div 
          className="text-6xl mb-6"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          🔄
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-4">Finding an opponent...</h2>
        <div className="bg-gray-800 rounded-lg p-4 max-w-md">
          <p className="text-gray-300 text-center">Connecting you with another player for a head-to-head battle!</p>
        </div>
      </div>
    );
  }
  
  // Main voting/results screen
  return (
    <div className="flex flex-col h-full relative">
      {/* Confetti effect when matching votes */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* Opponent info */}
      <div className="absolute top-2 right-4 z-10">
        <div className="bg-gray-800 bg-opacity-80 inline-block px-4 py-2 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              <img src={mockPlayer.avatar} alt={mockPlayer.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-bold">{mockPlayer.name}</span>
            {opponentVote && (
              <span className="ml-2 text-green-400">✓ Voted</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Back button - only visible after results are shown */}
      {showResults && (
        <div className="absolute top-2 left-4 z-10">
          <button 
            className="bg-gray-800 p-2 rounded-full text-white"
            onClick={onBackToMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        </div>
      )}
      
      {/* Main Battle Area */}
      <div className="flex-1 flex justify-between items-center px-8 pt-20 pb-10">
        {squadA && squadB && (
          <>
            {/* Squad A */}
            <div className="flex flex-col items-center">
              <motion.div
                className={`relative rounded-lg overflow-hidden border-8 ${
                  votedFor === squadA.id ? 'border-yellow-500' : 
                  showResults && opponentVote === squadA.id ? 'border-blue-500' : 
                  'border-blue-600'
                }`}
                whileHover={votedFor === null && !showResults ? { scale: 1.05 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                onClick={() => !votedFor && !showResults && handleVote(squadA.id)}
              >
                <img
                  src={squadA.imageUrl}
                  alt={squadA.name}
                  className="w-64 h-80 object-cover"
                />
                <div className={`absolute bottom-0 left-0 right-0 ${
                  votedFor === squadA.id ? 'bg-yellow-500' : 
                  showResults && opponentVote === squadA.id ? 'bg-blue-500' : 
                  'bg-blue-600'
                } bg-opacity-80 p-2 text-center`}>
                  <h3 className="text-white font-bold text-xl">{squadA.name}</h3>
                </div>
                
                {votedFor === squadA.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-yellow-500 text-black text-xl font-bold px-6 py-2 rounded-full">
                      YOUR VOTE
                    </div>
                  </div>
                )}
                
                {showResults && opponentVote === squadA.id && votedFor !== squadA.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-blue-500 text-white text-xl font-bold px-6 py-2 rounded-full">
                      OPPONENT'S VOTE
                    </div>
                  </div>
                )}
                
                {/* Match indicator for A */}
                {showResults && votedFor === opponentVote && votedFor === squadA.id && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-bold px-4 py-2 rounded-full text-lg animate-bounce">
                    MATCH! +10 XP
                  </div>
                )}
              </motion.div>
              
              {!votedFor && !showResults && (
                <motion.button
                  className="mt-4 w-40 py-2 rounded-lg font-bold bg-blue-600 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVote(squadA.id)}
                >
                  Vote
                </motion.button>
              )}
            </div>

            {/* Center area with timer or results */}
            <div className="flex flex-col items-center">
              {!showResults ? (
                <>
                  {/* Timer display */}
                  <div className={`text-white font-bold text-5xl mb-4 px-8 py-4 rounded-full ${
                    timeLeft <= 5 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
                  }`}>
                    {timeLeft}s
                  </div>
                  
                  <motion.div
                    className="text-yellow-500 text-5xl font-bold"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    VS
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Results summary */}
                  <div className="bg-gray-800 rounded-lg p-4 text-center mb-4">
                    {!votedFor ? (
                      <div className="text-red-400 font-bold text-xl">You didn't vote! +0 XP</div>
                    ) : votedFor === opponentVote ? (
                      <div className="text-green-400 font-bold text-xl">Match! +10 XP</div>
                    ) : (
                      <div className="text-yellow-400 font-bold text-xl">No match! +2 XP</div>
                    )}
                  </div>
                  
                  <motion.div
                    className="text-yellow-500 text-5xl font-bold"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    VS
                  </motion.div>
                </>
              )}
            </div>

            {/* Squad B */}
            <div className="flex flex-col items-center">
              <motion.div
                className={`relative rounded-lg overflow-hidden border-8 ${
                  votedFor === squadB.id ? 'border-yellow-500' : 
                  showResults && opponentVote === squadB.id ? 'border-blue-500' : 
                  'border-red-600'
                }`}
                whileHover={votedFor === null && !showResults ? { scale: 1.05 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                onClick={() => !votedFor && !showResults && handleVote(squadB.id)}
              >
                <img
                  src={squadB.imageUrl}
                  alt={squadB.name}
                  className="w-64 h-80 object-cover"
                />
                <div className={`absolute bottom-0 left-0 right-0 ${
                  votedFor === squadB.id ? 'bg-yellow-500' : 
                  showResults && opponentVote === squadB.id ? 'bg-blue-500' : 
                  'bg-red-600'
                } bg-opacity-80 p-2 text-center`}>
                  <h3 className="text-white font-bold text-xl">{squadB.name}</h3>
                </div>
                
                {votedFor === squadB.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-yellow-500 text-black text-xl font-bold px-6 py-2 rounded-full">
                      YOUR VOTE
                    </div>
                  </div>
                )}
                
                {showResults && opponentVote === squadB.id && votedFor !== squadB.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-blue-500 text-white text-xl font-bold px-6 py-2 rounded-full">
                      OPPONENT'S VOTE
                    </div>
                  </div>
                )}
                
                {/* Match indicator for B */}
                {showResults && votedFor === opponentVote && votedFor === squadB.id && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-bold px-4 py-2 rounded-full text-lg animate-bounce">
                    MATCH! +10 XP
                  </div>
                )}
              </motion.div>
              
              {!votedFor && !showResults && (
                <motion.button
                  className="mt-4 w-40 py-2 rounded-lg font-bold bg-red-600 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVote(squadB.id)}
                >
                  Vote
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Next button - only visible after results */}
      {showResults && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <motion.button
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToMenu}
          >
            Return to Menu
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default HeadToHeadBattle; 