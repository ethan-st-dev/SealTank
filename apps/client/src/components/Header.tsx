import React, { useState } from 'react';

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('playerName');
    setShowMenu(false);
    onLogout();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h2 className="app-title">Seal Tank</h2>
        </div>
        
        <div className="header-right">
          <div className="user-menu">
            <button 
              className="username-display"
              onClick={() => setShowMenu(!showMenu)}
            >
              <span className="username-text">{username}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showMenu && (
              <div className="user-dropdown">
                <button 
                  className="dropdown-item"
                  onClick={handleLogout}
                >
                  Change Name
                </button>
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
