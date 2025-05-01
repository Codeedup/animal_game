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
  
  // Game state
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [playerXP, setPlayerXP] = useState<number>(0);
  const [showConcede, setShowConcede] = useState<boolean>(false);
  const [showConcedeConfirmation, setShowConcedeConfirmation] = useState<boolean>(false);
  const [showFinalResults, setShowFinalResults] = useState<boolean>(false);
  const [isSuddenDeath, setIsSuddenDeath] = useState<boolean>(false);
  const [suddenDeathWinner, setSuddenDeathWinner] = useState<string | null>(null);
  const [showWrongPickAnimation, setShowWrongPickAnimation] = useState<boolean>(false);
  
  // Voting state
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [opponentVote, setOpponentVote] = useState<string | null>(null);
  const [winningAnimal, setWinningAnimal] = useState<string | null>(null);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [matchState, setMatchState] = useState<'connecting' | 'voting' | 'results'>('connecting');
  
  // Results state
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resultsTimeout, setResultsTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Start a new round
  const startNewRound = useCallback(() => {
    setMatchState('voting');
    setVotedFor(null);
    setOpponentVote(null);
    setWinningAnimal(null);
    setShowResults(false);
    setShowConfetti(false);
    setTimeLeft(15);
    
    // Randomly select two different squads
    const shuffled = [...animalSquads].sort(() => 0.5 - Math.random());
    setSquadA(shuffled[0]);
    setSquadB(shuffled[1]);
  }, []);
  
  // Start sudden death round
  const startSuddenDeath = useCallback(() => {
    setIsSuddenDeath(true);
    setVotedFor(null);
    setOpponentVote(null);
    setWinningAnimal(null);
    setShowResults(false);
    setShowConfetti(false);
    setTimeLeft(15);
    setMatchState('voting');
    
    // Randomly select two different squads for the final showdown
    const shuffled = [...animalSquads].sort(() => 0.5 - Math.random());
    setSquadA(shuffled[0]);
    setSquadB(shuffled[1]);
  }, []);
  
  // Handle showing results
  const handleShowResults = useCallback(() => {
    setMatchState('results');
    setShowResults(true);
    
    // Determine the winning animal randomly
    const winner = Math.random() > 0.5 ? squadA?.id || null : squadB?.id || null;
    setWinningAnimal(winner);
    
    // Calculate points - only for correct picks
    const playerPickedCorrect = votedFor === winner;
    const opponentPickedCorrect = opponentVote === winner;
    
    // Show wrong pick animation if player picked incorrectly
    if (votedFor && votedFor !== winner) {
      setShowWrongPickAnimation(true);
      setTimeout(() => setShowWrongPickAnimation(false), 1000);
    }
    
    // Handle sudden death mode differently
    if (isSuddenDeath) {
      if (playerPickedCorrect && !opponentPickedCorrect) {
        // Player wins sudden death
        setSuddenDeathWinner('player');
        setPlayerScore(prev => prev + 1);
        setPlayerXP(prev => prev + 10);
        setShowConfetti(true);
        
        // Game over - show final results
        const finalTimer = setTimeout(() => {
          setShowFinalResults(true);
        }, 3500);
        
        setResultsTimeout(finalTimer);
      } else if (!playerPickedCorrect && opponentPickedCorrect) {
        // Opponent wins sudden death
        setSuddenDeathWinner('opponent');
        setOpponentScore(prev => prev + 1);
        
        // Game over - show final results
        const finalTimer = setTimeout(() => {
          setShowFinalResults(true);
        }, 3500);
        
        setResultsTimeout(finalTimer);
      } else {
        // Both got it right or both got it wrong - continue sudden death
        const suddenDeathTimer = setTimeout(() => {
          startSuddenDeath();
        }, 3500);
        
        setResultsTimeout(suddenDeathTimer);
      }
      return;
    }
    
    // Regular round scoring
    let newPlayerScore = playerScore;
    let newOpponentScore = opponentScore;
    
    if (playerPickedCorrect) {
      newPlayerScore = playerScore + 1;
      setPlayerScore(newPlayerScore);
      setPlayerXP(prev => prev + 5);
      setShowConfetti(true);
      
      // Stop confetti after 3 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      setResultsTimeout(confettiTimer);
    }
    
    if (opponentPickedCorrect) {
      newOpponentScore = opponentScore + 1;
      setOpponentScore(newOpponentScore);
    }
    
    // Next round or end game
    const timer = setTimeout(() => {
      if (currentRound < 5) {  // Changed back to 5 rounds
        setCurrentRound(prev => prev + 1);
        startNewRound();
      } else {
        // Check for tie after 5 rounds with updated scores
        if (newPlayerScore === newOpponentScore) {
          // Start sudden death
          startSuddenDeath();
        } else {
          // Game over - show final results
          setShowFinalResults(true);
        }
      }
    }, 3500);
    
    // Clean up timeout if component unmounts
    setResultsTimeout(oldTimer => {
      if (oldTimer) clearTimeout(oldTimer);
      return timer;
    });
  }, [votedFor, opponentVote, squadA, squadB, currentRound, playerScore, opponentScore, isSuddenDeath, startNewRound, startSuddenDeath]);
  
  // Simulate finding an opponent and start the first round
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      startNewRound();
    }, 2000);
    
    return () => clearTimeout(connectTimer);
  }, [startNewRound]);
  
  // Handle vote
  const handleVote = useCallback((squadId: string) => {
    setVotedFor(squadId);
    // Randomly determine when opponent votes (between 1-5 seconds)
    const opponentVoteDelay = Math.floor(Math.random() * 5000) + 1000;
    setTimeout(() => {
      // Random opponent vote
      const opponentSelection = Math.random() > 0.5 ? squadA?.id : squadB?.id;
      setOpponentVote(opponentSelection || null);
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
  
  const handleBackToMenu = useCallback(() => {
    // Find all the style elements we added that hide nav bars
    const styleElements = document.querySelectorAll('style');
    styleElements.forEach(element => {
      if (element.innerText.includes('.App > div:first-child') || 
          element.innerText.includes('.App > div:last-child')) {
        element.remove();
      }
    });
    
    // Return to menu
    onBackToMenu();
  }, [onBackToMenu]);
  
  // Handle concede confirmation
  const handleConcede = useCallback(() => {
    setShowConcedeConfirmation(true);
  }, []);

  // Handle actual concede action
  const handleConfirmConcede = useCallback(() => {
    setShowConcedeConfirmation(false);
    // Player loses immediately
    setShowConcede(true);
    setPlayerScore(0);
    setOpponentScore(5);
    
    // Show concede message for 3 seconds then return to menu
    const timer = setTimeout(() => {
      handleBackToMenu();
    }, 3000);
    
    setResultsTimeout(oldTimer => {
      if (oldTimer) clearTimeout(oldTimer);
      return timer;
    });
  }, [handleBackToMenu]);

  // Handle cancel concede
  const handleCancelConcede = useCallback(() => {
    setShowConcedeConfirmation(false);
  }, []);
  
  // Render connecting screen
  if (matchState === 'connecting') {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        {/* Hide top and bottom navigation bars throughout the entire battle */}
        <style>
          {`
            .App > div:first-child,
            .App > div:last-child {
              display: none !important;
            }
          `}
        </style>
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
  
  // Render concede confirmation popup
  if (showConcedeConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Are you sure you want to concede?</h2>
          <div className="flex justify-center gap-4">
            <motion.button
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-bold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancelConcede}
            >
              Back
            </motion.button>
            <motion.button
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-bold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirmConcede}
            >
              Yes
            </motion.button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render concede screen
  if (showConcede) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        {/* Hide top and bottom navigation bars throughout the entire battle */}
        <style>
          {`
            .App > div:first-child,
            .App > div:last-child {
              display: none !important;
            }
          `}
        </style>
        <div className="bg-red-600 rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-6">🏳️</div>
          <h2 className="text-2xl font-bold text-white mb-4">You Conceded the Match</h2>
          <p className="text-gray-200 mb-4">
            Returning to menu...
          </p>
        </div>
      </div>
    );
  }
  
  // Render final results screen
  if (showFinalResults) {
    const playerWon = playerScore > opponentScore;
    
    return (
      <div className="flex flex-col h-full relative">
        {/* Background gradient based on result */}
        <div className={`absolute inset-0 ${
          playerWon ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600' : 
          'bg-gradient-to-br from-blue-900 via-gray-800 to-gray-900'
        }`}></div>
        
        {/* Hide top and bottom navigation bars throughout the entire battle */}
        <style>
          {`
            .App > div:first-child,
            .App > div:last-child {
              display: none !important;
            }
            
            @keyframes firework {
              0% { transform: translate(var(--x, 0), var(--initialY, 60vmin)); width: var(--initialSize, 0.5vmin); opacity: 1; }
              50% { width: 0.5vmin; opacity: 1; }
              100% { width: var(--finalSize, 45vmin); opacity: 0; }
            }
            
            .firework {
              --initialSize: 0.5vmin;
              --finalSize: 45vmin;
              --particleSize: 0.2vmin;
              --y: -30vmin;
              --initialY: 60vmin;
              content: "";
              animation: firework 2s infinite;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, var(--y));
              width: var(--initialSize);
              aspect-ratio: 1;
              background: 
                radial-gradient(circle, yellow var(--particleSize, 0.2vmin), #0000 0) 0% 0%,
                radial-gradient(circle, khaki var(--particleSize, 0.2vmin), #0000 0) 100% 0%,
                radial-gradient(circle, white var(--particleSize, 0.2vmin), #0000 0) 100% 100%,
                radial-gradient(circle, lime var(--particleSize, 0.2vmin), #0000 0) 0% 100%,
                radial-gradient(circle, gold var(--particleSize, 0.2vmin), #0000 0) 50% 0%,
                radial-gradient(circle, mediumseagreen var(--particleSize, 0.2vmin), #0000 0) 50% 100%,
                radial-gradient(circle, yellow var(--particleSize, 0.2vmin), #0000 0) 0% 50%,
                radial-gradient(circle, khaki var(--particleSize, 0.2vmin), #0000 0) 100% 50%,
                radial-gradient(circle, white var(--particleSize, 0.2vmin), #0000 0) 50% 50%;
              background-size: var(--initialSize) var(--initialSize);
              background-repeat: no-repeat;
            }
            
            .firework::before, .firework::after {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              transform: rotate(var(--rotation, 0deg));
              background: inherit;
            }
            
            .firework::before {
              --rotation: 25deg;
            }
            
            .firework::after {
              --rotation: 45deg;
            }
            
            .firework-1 { 
              margin-left: 20vmin; 
            }
            
            .firework-2 { 
              margin-left: -20vmin; 
            }
            
            .firework-3 { 
              margin-left: 0; 
              --y: -15vmin;
              animation-delay: 0.25s;
            }
            
            .firework-4 { 
              margin-left: -30vmin; 
              --y: -15vmin;
              animation-delay: 0.4s;
            }
            
            .firework-5 { 
              margin-left: 30vmin; 
              --y: -15vmin; 
              animation-delay: 0.6s;
            }
          `}
        </style>
        
        {/* Fireworks animation for winner */}
        {playerWon && (
          <>
            <div className="firework firework-1"></div>
            <div className="firework firework-2"></div>
            <div className="firework firework-3"></div>
            <div className="firework firework-4"></div>
            <div className="firework firework-5"></div>
          </>
        )}
        
        {/* Confetti for winning */}
        {playerWon && <Confetti recycle={true} numberOfPieces={300} gravity={0.2} />}
        
        {/* Winner/loser announcement */}
        <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
          <div className={`text-6xl font-extrabold ${playerWon ? 'text-yellow-300 animate-pulse' : 'text-gray-300'} shadow-lg px-4 py-2 rounded-lg bg-black bg-opacity-30`}>
            {playerWon ? 'WINNER!' : 'DEFEATED!'}
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          {/* Leaderboard Style Rankings */}
          <div className="w-full max-w-xl mb-8 mt-28">
            {/* First Place */}
            <div className={`flex items-center mb-4 ${playerWon ? 'animate-pulse' : ''}`}>
              <div className="bg-yellow-500 rounded-full w-12 h-12 flex items-center justify-center border-2 border-white mr-3">
                <span className="text-2xl font-extrabold">1</span>
              </div>
              <div className={`flex-1 ${playerWon ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 'bg-gradient-to-r from-blue-800 to-blue-600'} h-16 rounded-lg flex items-center px-4 shadow-lg transition-all duration-300`}>
                <div className="flex items-center w-full">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white mr-3">
                    {playerWon ? (
                      <img src="https://placehold.co/100/22C55E/FFFFFF?text=YOU" alt="You" className="w-full h-full object-cover" />
                    ) : (
                      <img src={mockPlayer.avatar} alt={mockPlayer.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-lg">{playerWon ? 'YOU' : mockPlayer.name}</div>
                    <div className="text-yellow-200 text-sm">{playerWon ? playerScore : opponentScore} points</div>
                  </div>
                  <div className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-white text-xs font-bold">
                    CHAMPION
                  </div>
                </div>
              </div>
            </div>
            
            {/* Second Place */}
            <div className="flex items-center mb-4">
              <div className="bg-gray-400 rounded-full w-12 h-12 flex items-center justify-center border-2 border-white mr-3">
                <span className="text-2xl font-extrabold">2</span>
              </div>
              <div className={`flex-1 ${!playerWon ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-gray-600 to-gray-500'} h-14 rounded-lg flex items-center px-4 shadow-md`}>
                <div className="flex items-center w-full">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white mr-3">
                    {!playerWon ? (
                      <img src="https://placehold.co/100/22C55E/FFFFFF?text=YOU" alt="You" className="w-full h-full object-cover" />
                    ) : (
                      <img src={mockPlayer.avatar} alt={mockPlayer.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold">{!playerWon ? 'YOU' : mockPlayer.name}</div>
                    <div className="text-gray-300 text-sm">{!playerWon ? playerScore : opponentScore} points</div>
                  </div>
                  <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-white text-xs">
                    RUNNER-UP
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="mt-2 bg-black bg-opacity-70 rounded-xl py-4 px-8 max-w-md w-full">
            <div className="text-center text-xl font-bold text-white">
              Final Score: <span className="text-green-400">{playerScore}</span> - <span className="text-blue-400">{opponentScore}</span>
            </div>
            {isSuddenDeath && (
              <div className="text-center text-lg text-red-400 mt-1">
                Decided by Sudden Death!
                {suddenDeathWinner && (
                  <span className="ml-2 font-bold">
                    {suddenDeathWinner === 'player' ? 'You won!' : 'Opponent won!'}
                  </span>
                )}
              </div>
            )}
            <div className="text-center text-lg text-yellow-300 mt-1">
              XP Earned: {playerXP}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-gray-800 p-2 rounded-lg text-center">
                <div className="text-blue-400 text-sm">Accuracy</div>
                <div className="text-white font-bold">{Math.round((playerScore / 5) * 100)}%</div>
              </div>
              <div className="bg-gray-800 p-2 rounded-lg text-center">
                <div className="text-blue-400 text-sm">Rank Change</div>
                <div className="text-green-400 font-bold">+{playerWon ? 25 : 5}</div>
              </div>
            </div>
          </div>
          
          {/* Return to Menu button */}
          <div className="mt-6">
            <motion.button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-bold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToMenu}
            >
              Return to Lobby
            </motion.button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main voting/results screen
  return (
    <div className="flex flex-col h-full relative">
      {/* Hide top and bottom navigation bars throughout the entire battle */}
      <style>
        {`
          .App > div:first-child,
          .App > div:last-child {
            display: none !important;
          }
        `}
      </style>
      
      {/* Confetti effect when correct pick */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* Wrong pick animation - screen flash */}
      {showWrongPickAnimation && (
        <div className="absolute inset-0 bg-red-600 bg-opacity-40 z-50 animate-pulse">
          <div className="h-full w-full flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1.5, 0], rotate: [0, 0, 90] }}
              transition={{ duration: 0.8 }}
              className="text-red-100 text-9xl"
            >
              ✗
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Pulsing background for sudden death */}
      {isSuddenDeath && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-red-600 opacity-30 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-red-900 to-orange-900 opacity-50"></div>
        </div>
      )}
      
      {/* Round and score info */}
      <div className="absolute top-2 left-0 right-0 z-10 flex justify-center">
        <div className="bg-gray-800 bg-opacity-80 px-6 py-2 rounded-lg">
          <div className="flex items-center justify-between w-64">
            <div className="text-white">
              <span className="font-bold">
                {isSuddenDeath ? (
                  <span className="text-red-400 animate-pulse">SUDDEN DEATH!</span>
                ) : (
                  <>Round: <span className="text-yellow-400">{currentRound}/5</span></>
                )}
              </span>
            </div>
            <div className="text-white">
              <span className="font-bold">Score: </span>
              <span className="text-green-400">{playerScore}</span>
              <span className="mx-1">-</span>
              <span className="text-blue-400">{opponentScore}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Concede button - always available during the game */}
      <div className="absolute top-2 left-4 z-10">
        <button
          className="bg-red-600 px-3 py-1 rounded-md text-white text-sm font-bold"
          onClick={handleConcede}
        >
          Concede
        </button>
      </div>
      
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
                  showResults && winningAnimal === squadA.id ? 'border-green-500' :
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
                  showResults && winningAnimal === squadA.id ? 'bg-green-500' :
                  'bg-blue-600'
                } bg-opacity-80 p-2 text-center`}>
                  <h3 className="text-white font-bold text-xl">{squadA.name}</h3>
                </div>
                
                {/* Player vote indicator with profile */}
                {votedFor === squadA.id && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-yellow-500 rounded-lg p-2 flex items-center shadow-lg">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border-2 border-white">
                        <img src="https://placehold.co/100/22C55E/FFFFFF?text=YOU" alt="You" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-black text-sm">Your Pick</span>
                    </div>
                  </div>
                )}
                
                {/* Opponent vote indicator with profile */}
                {showResults && opponentVote === squadA.id && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-blue-500 rounded-lg p-2 flex items-center shadow-lg">
                      <span className="font-bold text-white text-sm mr-2">Opponent</span>
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                        <img src={mockPlayer.avatar} alt={mockPlayer.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                )}
                
                {showResults && winningAnimal === squadA.id && (
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-bold px-4 py-2 rounded-full text-lg animate-bounce">
                    WINNER!
                  </div>
                )}
                
                {/* Correct pick indicator */}
                {showResults && votedFor === winningAnimal && votedFor === squadA.id && (
                  <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-bold px-4 py-2 rounded-full text-lg">
                    CORRECT! +5 XP
                  </div>
                )}
              </motion.div>
            </div>

            {/* Center area with timer or results */}
            <div className="flex flex-col items-center">
              {!showResults ? (
                <>
                  {/* Timer display */}
                  <div className={`text-white font-bold text-5xl mb-4 px-8 py-4 rounded-full ${
                    timeLeft <= 5 ? 'bg-red-600 animate-pulse' : isSuddenDeath ? 'bg-orange-600' : 'bg-blue-600'
                  }`}>
                    {timeLeft}s
                  </div>
                  
                  <motion.div
                    className={`text-5xl font-bold ${isSuddenDeath ? 'text-red-500' : 'text-yellow-500'}`}
                    animate={{ scale: [1, 1.2, 1], rotate: isSuddenDeath ? [0, -5, 5, 0] : [0, 0, 0] }}
                    transition={{ repeat: Infinity, duration: isSuddenDeath ? 0.5 : 2 }}
                  >
                    VS
                  </motion.div>
                  
                  <div className={`mt-4 text-white text-xl font-bold text-center w-full px-6 ${isSuddenDeath ? 'animate-pulse text-red-400' : ''}`}>
                    {isSuddenDeath ? 'SUDDEN DEATH! Pick to win!' : 'Tap an animal to vote!'}
                  </div>
                </>
              ) : (
                <>
                  {/* Results summary */}
                  <div className={`bg-gray-800 rounded-lg p-4 text-center mb-4 ${isSuddenDeath ? 'border-2 border-red-500' : ''}`}>
                    {isSuddenDeath && (
                      <div className="text-red-400 font-bold text-lg mb-2 animate-pulse">
                        SUDDEN DEATH!
                      </div>
                    )}
                    
                    {!votedFor ? (
                      <div className="text-red-400 font-bold text-xl">You didn't vote!</div>
                    ) : votedFor === winningAnimal ? (
                      <div className="text-green-400 font-bold text-xl">
                        Correct pick! {isSuddenDeath ? '+10 XP' : '+5 XP'}
                      </div>
                    ) : (
                      <div className="text-yellow-400 font-bold text-xl">Wrong pick!</div>
                    )}
                    
                    {playerXP > 0 && (
                      <div className="text-blue-300 font-bold text-sm mt-2">Total XP this game: {playerXP}</div>
                    )}
                  </div>
                  
                  <motion.div
                    className={`text-5xl font-bold ${isSuddenDeath ? 'text-red-500' : 'text-yellow-500'}`}
                    animate={{ 
                      scale: [1, 1.2, 1], 
                      rotate: isSuddenDeath ? [0, -3, 3, 0] : [0, 0, 0] 
                    }}
                    transition={{ repeat: Infinity, duration: isSuddenDeath ? 0.5 : 2 }}
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
                  showResults && winningAnimal === squadB.id ? 'border-green-500' :
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
                  showResults && winningAnimal === squadB.id ? 'bg-green-500' :
                  'bg-red-600'
                } bg-opacity-80 p-2 text-center`}>
                  <h3 className="text-white font-bold text-xl">{squadB.name}</h3>
                </div>
                
                {/* Player vote indicator with profile */}
                {votedFor === squadB.id && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-yellow-500 rounded-lg p-2 flex items-center shadow-lg">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border-2 border-white">
                        <img src="https://placehold.co/100/22C55E/FFFFFF?text=YOU" alt="You" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-black text-sm">Your Pick</span>
                    </div>
                  </div>
                )}
                
                {/* Opponent vote indicator with profile */}
                {showResults && opponentVote === squadB.id && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-blue-500 rounded-lg p-2 flex items-center shadow-lg">
                      <span className="font-bold text-white text-sm mr-2">Opponent</span>
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                        <img src={mockPlayer.avatar} alt={mockPlayer.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                )}
                
                {showResults && winningAnimal === squadB.id && (
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-bold px-4 py-2 rounded-full text-lg animate-bounce">
                    WINNER!
                  </div>
                )}
                
                {/* Correct pick indicator */}
                {showResults && votedFor === winningAnimal && votedFor === squadB.id && (
                  <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-bold px-4 py-2 rounded-full text-lg">
                    CORRECT! +5 XP
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeadToHeadBattle; 