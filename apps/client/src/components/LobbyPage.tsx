import React, { useState, useEffect } from 'react';

interface LobbyPageProps {
  username: string;
  onLaunch: (lobbyData: any) => void;
}

interface Lobby {
  id: string;
  name: string;
  roomType: string;
  sceneName: string;
  host: string;
  players: string[];
  maxPlayers: number;
}

const LOBBY_SERVER_URL = 'http://localhost:3001';
const LOBBY_WS_URL = 'ws://localhost:3001';

export const LobbyPage: React.FC<LobbyPageProps> = ({ username, onLaunch }) => {
  const [view, setView] = useState<'main' | 'create'>('main');
  const [lobbyName, setLobbyName] = useState('');
  const [roomType, setRoomType] = useState('standard');
  const [availableLobbies, setAvailableLobbies] = useState<Lobby[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const roomTypes = [
    { value: 'standard', label: 'Standard Arena', description: 'Classic gameplay area', scene: 'StandardArena' },
    { value: 'ice', label: 'Ice Arena', description: 'Slippery surface with icebergs', scene: 'IceArena' },
    { value: 'deep', label: 'Deep Sea', description: 'Dark depths with obstacles', scene: 'DeepSea' },
    { value: 'tropical', label: 'Tropical Bay', description: 'Warm waters and coral reefs', scene: 'TropicalBay' },
  ];

  // Connect to WebSocket for real-time lobby updates
  useEffect(() => {
    const websocket = new WebSocket(LOBBY_WS_URL);
    
    websocket.onopen = () => {
      console.log('✅ Connected to lobby server');
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'lobby-list') {
          console.log('📋 Received lobby list:', data.lobbies);
          setAvailableLobbies(data.lobbies);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setIsConnected(false);
    };

    websocket.onclose = () => {
      console.log('🔌 Disconnected from lobby server');
      setIsConnected(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const handleCreateLobby = async () => {
    if (lobbyName.trim().length < 3) {
      alert('Lobby name must be at least 3 characters');
      return;
    }
    
    const selectedRoom = roomTypes.find(r => r.value === roomType);
    
    try {
      const response = await fetch(`${LOBBY_SERVER_URL}/api/lobbies/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lobbyName,
          roomType: roomType,
          sceneName: selectedRoom?.scene || 'Scene',
          host: username,
          maxPlayers: 8
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create lobby');
      }

      const lobby = await response.json();
      console.log('✅ Lobby created:', lobby);
      
      // Launch directly into the lobby
      onLaunch({
        lobbyId: lobby.id,
        roomName: lobby.id,
        lobbyName: lobby.name,
        roomType: lobby.roomType,
        sceneName: lobby.sceneName,
        action: 'create'
      });
    } catch (error) {
      console.error('❌ Failed to create lobby:', error);
      alert('Failed to create lobby. Make sure the lobby server is running.');
    }
  };

  const handleJoinLobby = async (lobby: Lobby) => {
    try {
      const response = await fetch(`${LOBBY_SERVER_URL}/api/lobbies/${lobby.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: username })
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to join lobby');
        return;
      }

      console.log('✅ Joined lobby:', lobby.name);

      // Launch into the lobby
      onLaunch({
        lobbyId: lobby.id,
        roomName: lobby.id,
        lobbyName: lobby.name,
        roomType: lobby.roomType,
        sceneName: lobby.sceneName,
        action: 'join'
      });
    } catch (error) {
      console.error('❌ Failed to join lobby:', error);
      alert('Failed to join lobby. Make sure the lobby server is running.');
    }
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
              {!isConnected && (
                <div className="connection-warning">
                  ⚠️ Connecting to lobby server...
                </div>
              )}
              {availableLobbies.length === 0 ? (
                <div className="empty-lobbies">
                  <div className="empty-icon">🌊</div>
                  <h3>No active lobbies</h3>
                  <p>Be the first to create a lobby and start playing!</p>
                  {!isConnected && (
                    <p className="error-hint">
                      Make sure the lobby server is running: <code>cd apps/server && npm run dev</code>
                    </p>
                  )}
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
                        <span>Host: {lobby.host}</span>
                        <span>Players: {lobby.players.length}/{lobby.maxPlayers}</span>
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
