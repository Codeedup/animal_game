import React, { useState } from 'react';
import GameScreen from './components/GameScreen';
import BottomNavBar from './components/BottomNavBar';
import TopBar from './components/TopBar';
import VoteBattleMenu from './components/VoteBattleMenu';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('vote');
  const [showSettings, setShowSettings] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [battleMode, setBattleMode] = useState<'menu' | 'head-to-head' | 'more-modes'>('menu');

  const handleNavChange = (navId: string) => {
    setCurrentScreen(navId);
    // Reset battle mode to menu when switching between main tabs
    if (navId === 'vote') {
      setBattleMode('menu');
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    if (showFriends) setShowFriends(false);
  };
  
  const handleFriendsClick = () => {
    setShowFriends(!showFriends);
    if (showSettings) setShowSettings(false);
  };

  const handleHeadToHeadClick = () => {
    setBattleMode('head-to-head');
  };

  const handleMoreModesClick = () => {
    setBattleMode('more-modes');
  };
  
  const handleBackToMenu = () => {
    setBattleMode('menu');
  };

  // Mock friends data
  const friends = [
    { id: 1, name: 'AnimalLover', avatar: '🦁', status: 'online', level: 7 },
    { id: 2, name: 'CatQueen', avatar: '🐯', status: 'online', level: 12 },
    { id: 3, name: 'DogWhisperer', avatar: '🐺', status: 'offline', level: 4 },
    { id: 4, name: 'FoxHunter', avatar: '🦊', status: 'away', level: 9 },
    { id: 5, name: 'BirdWatcher', avatar: '🦅', status: 'online', level: 6 },
  ];

  // Helper to render the appropriate vote screen based on battle mode
  const renderVoteScreen = () => {
    switch (battleMode) {
      case 'menu':
        return (
          <VoteBattleMenu 
            onHeadToHeadClick={handleHeadToHeadClick}
            onMoreModesClick={handleMoreModesClick}
          />
        );
      case 'head-to-head':
        return <GameScreen onBackToMenu={handleBackToMenu} />;
      case 'more-modes':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="bg-gray-800 rounded-lg p-6 w-11/12 max-w-md text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-4">More Battle Modes</h2>
              <p className="text-gray-300 mb-6">
                Tournament, Team Battles, and Special Events coming soon!
              </p>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={() => setBattleMode('menu')}
              >
                Back to Menu
              </button>
            </div>
          </div>
        );
      default:
        return <VoteBattleMenu 
          onHeadToHeadClick={handleHeadToHeadClick}
          onMoreModesClick={handleMoreModesClick}
        />;
    }
  };

  return (
    <div className="App flex flex-col h-screen relative">
      <TopBar 
        level={5}
        currentXP={256}
        maxXP={300}
        onSettingsClick={handleSettingsClick}
        onFriendsClick={handleFriendsClick}
      />
      
      <div className="flex-1 overflow-y-auto pb-16 pt-16">
        {currentScreen === 'vote' && renderVoteScreen()}
        {currentScreen === 'store' && (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl font-bold">Store Coming Soon</h2>
          </div>
        )}
        {currentScreen === 'inventory' && (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl font-bold">Inventory Coming Soon</h2>
          </div>
        )}
        {currentScreen === 'leaderboard' && (
          <div className="flex items-center justify-center h-full">
            <div className="bg-gray-800 rounded-lg p-6 w-11/12 max-w-md">
              <h2 className="text-2xl font-bold text-center mb-4">Leaderboard</h2>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(rank => (
                  <div key={rank} className="flex items-center bg-gray-700 p-3 rounded-lg">
                    <div className="text-xl font-bold mr-3">{rank}</div>
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      {rank === 1 ? '👑' : '👤'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">Player{rank}</div>
                      <div className="text-xs text-gray-300">Score: {10000 - (rank * 1000)}</div>
                    </div>
                    <div className="text-yellow-400 font-bold">{6 - rank}⭐</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {currentScreen === 'fight' && (
          <div className="flex items-center justify-center h-full">
            <div className="bg-gray-800 rounded-lg p-6 w-11/12 max-w-md">
              <h2 className="text-2xl font-bold text-center mb-4">Big Time Fight</h2>
              <div className="bg-gradient-to-r from-purple-800 to-blue-700 p-4 rounded-lg text-center mb-4">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="text-xl font-bold mb-1">Super Squad Battle</h3>
                <p className="text-sm text-gray-300 mb-3">Compete with your best animals</p>
                <div className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-md inline-block">
                  Coming Soon
                </div>
              </div>
              <div className="text-center text-gray-400 text-sm">
                Unlock at level 10 to participate in the ultimate battle arena!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-80">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={handleSettingsClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Sound</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Notifications</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Dark Mode</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
              <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md mt-4">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Friends Modal */}
      {showFriends && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-80 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Friends</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={handleFriendsClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search friends..." 
                  className="w-full bg-gray-700 text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex mb-4">
              <button className="flex-1 bg-blue-600 text-white py-1 rounded-l-md">Online</button>
              <button className="flex-1 bg-gray-700 text-gray-300 py-1">All</button>
              <button className="flex-1 bg-gray-700 text-gray-300 py-1 rounded-r-md">Pending</button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <div className="space-y-2">
                {friends.map(friend => (
                  <div 
                    key={friend.id} 
                    className="flex items-center bg-gray-700 p-2 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3 text-xl">
                      {friend.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold flex items-center">
                        {friend.name}
                        <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-md">
                          Lv.{friend.level}
                        </span>
                      </div>
                      <div className="text-xs flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-1 ${
                          friend.status === 'online' ? 'bg-green-500' : 
                          friend.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></span>
                        <span className="text-gray-300 capitalize">{friend.status}</span>
                      </div>
                    </div>
                    <button className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-700">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Friend
              </button>
            </div>
          </div>
        </div>
      )}
      
      <BottomNavBar onNavChange={handleNavChange} />
    </div>
  );
}

export default App;
