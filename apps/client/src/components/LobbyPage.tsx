import React, { useState } from 'react';

interface LobbyPageProps {
  username: string;
  onLaunch: (lobbyData: any) => void;
}

interface Lobby {
  id: string;
  name: string;
  roomType: string;
  players: number;
  maxPlayers: number;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({ username, onLaunch }) => {
  const [view, setView] = useState<'main' | 'create'>('main');
  const [lobbyName, setLobbyName] = useState('');
  const [roomType, setRoomType] = useState('standard');

  // Dummy lobbies for demonstration (empty initially)
  const availableLobbies: Lobby[] = [
    // { id: '1', name: 'Ocean Arena', roomType: 'standard', players: 2, maxPlayers: 8 },
    // { id: '2', name: 'Arctic Zone', roomType: 'ice', players: 5, maxPlayers: 10 },
    // { id: '3', name: 'Deep Sea', roomType: 'deep', players: 1, maxPlayers: 6 },
  ];

  const roomTypes = [
    { value: 'standard', label: 'Standard Arena', description: 'Classic gameplay area' },
    { value: 'ice', label: 'Ice Arena', description: 'Slippery surface with icebergs' },
    { value: 'deep', label: 'Deep Sea', description: 'Dark depths with obstacles' },
    { value: 'tropical', label: 'Tropical Bay', description: 'Warm waters and coral reefs' },
  ];

  const handleCreateLobby = () => {
    if (lobbyName.trim().length < 3) {
      alert('Lobby name must be at least 3 characters');
      return;
    }
    
    const lobbyData = {
      name: lobbyName,
      roomType: roomType,
      host: username,
      action: 'create'
    };
    
    onLaunch(lobbyData);
  };

  const handleJoinLobby = (lobby: Lobby) => {
    const lobbyData = {
      lobbyId: lobby.id,
      lobbyName: lobby.name,
      roomType: lobby.roomType,
      action: 'join'
    };
    
    onLaunch(lobbyData);
  };

  return (
    <div className="lobby-page">
      <div className="lobby-container">
        {view === 'main' && (
          <div className="lobby-main">
            <div className="lobby-header">
              <div>
                <h1 className="lobby-title">Game Lobbies</h1>
                <p className="lobby-subtitle">Join an existing game or create your own</p>
              </div>
              <button 
                className="create-lobby-btn"
                onClick={() => setView('create')}
              >
                + Create Lobby
              </button>
            </div>
            
            <div className="lobby-list-container">
              {availableLobbies.length === 0 ? (
                <div className="empty-lobbies">
                  <div className="empty-icon">🌊</div>
                  <h3>No active lobbies</h3>
                  <p>Be the first to create a lobby and start playing!</p>
                </div>
              ) : (
                <div className="lobby-list">
                  {availableLobbies.map((lobby) => (
                    <div
                      key={lobby.id}
                      className="lobby-item"
                      onClick={() => handleJoinLobby(lobby)}
                    >
                      <div className="lobby-item-header">
                        <h3>{lobby.name}</h3>
                        <span className="lobby-badge">{lobby.roomType}</span>
                      </div>
                      <div className="lobby-item-info">
                        <span>Players: {lobby.players}/{lobby.maxPlayers}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'create' && (
          <div className="lobby-form">
            <button className="back-button" onClick={() => setView('main')}>
              ← Back
            </button>
            
            <h1 className="form-title">Create Lobby</h1>
            
            <div className="form-group">
              <label htmlFor="lobbyName">Lobby Name</label>
              <input
                id="lobbyName"
                type="text"
                value={lobbyName}
                onChange={(e) => setLobbyName(e.target.value)}
                placeholder="Enter lobby name"
                className="form-input"
                maxLength={30}
              />
            </div>
            
            <div className="form-group">
              <label>Room Template</label>
              <div className="room-type-grid">
                {roomTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`room-type-card ${roomType === type.value ? 'selected' : ''}`}
                    onClick={() => setRoomType(type.value)}
                  >
                    <h3>{type.label}</h3>
                    <p>{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="launch-button"
              onClick={handleCreateLobby}
            >
              Create & Launch
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
