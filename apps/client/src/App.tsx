import React, { useState, useEffect } from 'react'
import { NeedleEngine } from './NeedleEngine';
import { UsernamePrompt } from './components/UsernamePrompt';
import { Header } from './components/Header';
import { GameObject, onStart, Rigidbody } from '@needle-tools/engine';
import { Vector3 } from 'three';

function randFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const App = () => {
  const [username, setUsername] = useState<string | null>(null);

  // Check for existing username in localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('playerName');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Fetch rigidbodies from needle
  const bodies: Rigidbody[] = [];
  onStart(_context => {
    bodies.push(...GameObject.findObjectsOfType(Rigidbody));
  })

  const performJump = () => {
    const vec = new Vector3(0, 1, 0);
    bodies.forEach((body) => {
      vec.set(0, randFloat(0.5, 5), 0);
      body.applyImpulse(vec);
    })
  };

  const handleUsernameContinue = (newUsername: string) => {
    setUsername(newUsername);
  };

  const handleLogout = () => {
    setUsername(null);
  };

  // Show username prompt if no username is set
  if (!username) {
    return <UsernamePrompt onContinue={handleUsernameContinue} />;
  }

  return (
    <>
      <Header username={username} onLogout={handleLogout} />
      
      <div id="container" className="needle-container">
        <NeedleEngine style={{ position: "relative", display: "flex" }} loading-style="light">
          <div style={{ width: "100%", heigth: "100%" }}>
            <button type="button" onClick={performJump} className="jump-button">Squish!</button>
          </div>
        </NeedleEngine>
      </div>
      <div className="bottom">
          The canvas can be transparent allowing for a seamless experience.
          <br />
          Visit <a href="https://needle.tools" target="_blank">needle.tools</a> for more information.
      </div>
    </>
  );
};

export default App;