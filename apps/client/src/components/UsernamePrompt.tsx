import React, { useState } from 'react';

interface UsernamePromptProps {
  onContinue: (username: string) => void;
}

export const UsernamePrompt: React.FC<UsernamePromptProps> = ({ onContinue }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    
    if (username.trim().length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('playerName', username.trim());
    
    // Continue to app
    onContinue(username.trim());
  };

  return (
    <div className="username-prompt-overlay">
      <div className="username-prompt-card">
        <h1>Welcome to SealTank</h1>
        <p>Enter your username to continue</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Enter your username"
            className="username-input"
            autoFocus
            maxLength={20}
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="continue-button">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};
