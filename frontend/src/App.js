// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PlayersDatabase from './components/PlayersDatabase';
import TeamsDatabase from './components/TeamsDatabase';
import NavBar from './components/Navbar';

const App = () => {
  const initialState = {
    Piha: [],
    Honehau: [],
    Ren: [],
    Mana: [],
    Ariki: [],
    Leonard: [],
    Brytyn: [],
    Wiremu: [],
    Helim: [],
    TeKemara: [],
  };

  const [allPlayers, setAllPlayers] = useState([]); // State to hold all player data
  const [draftPicks, setDraftPicks] = useState(() => { // Load from localStorage
    const savedDraftPicks = localStorage.getItem('draftPicks');
    return savedDraftPicks ? JSON.parse(savedDraftPicks) : initialState;
  });

  const handleDraftPick = (playerId, friendName) => {
    setDraftPicks((prevDraftPicks) => {
      const updatedDraftPicks = {
        ...prevDraftPicks,
        [friendName]: [...prevDraftPicks[friendName], playerId],
      };
      localStorage.setItem('draftPicks', JSON.stringify(updatedDraftPicks)); // Save to localStorage
      return updatedDraftPicks;
    });
  };

  const resetTeams = () => {
    setDraftPicks(initialState);
    localStorage.setItem('draftPicks', JSON.stringify(initialState)); // Reset localStorage
  };

  const removePlayerFromTeam = (playerId, friendName) => {
    setDraftPicks((prevDraftPicks) => {
      const updatedTeam = prevDraftPicks[friendName].filter((id) => id !== playerId);
      const updatedDraftPicks = { ...prevDraftPicks, [friendName]: updatedTeam };
      localStorage.setItem('draftPicks', JSON.stringify(updatedDraftPicks));
      return updatedDraftPicks;
    });
  };

  useEffect(() => {
    fetch('http://127.0.0.1:5000/data')
      .then((response) => response.json())
      .then((data) => setAllPlayers(data))
      .catch((error) => console.error('Error fetching player data:', error));
  }, []);

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate replace to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route 
          path="/players-database" 
          element={<PlayersDatabase onDraftPick={handleDraftPick} draftPicks={draftPicks} />} 
        />
        <Route 
          path="/draft-picks-database" 
          element={<TeamsDatabase draftPicks={draftPicks} allPlayers={allPlayers} resetTeams={resetTeams} removePlayerFromTeam={removePlayerFromTeam} />} 
        />

      </Routes>
    </Router>
  );
};

export default App;