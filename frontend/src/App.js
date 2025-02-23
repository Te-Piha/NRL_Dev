// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PlayersDatabase from "./components/PlayersDatabase";
import TeamsDatabase from "./components/TeamsDatabase";
import NavBar from "./components/Navbar";
import IdealDraftBoard from "./components/IdealTeam/IdealTeamPage.jsx";

const App = () => {
  const initialState = useMemo(() => ({
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
  }), []);

  const [allPlayers, setAllPlayers] = useState([]); // State to hold all player data
  const [loading, setLoading] = useState(true); // Loading state for better UX
  const [draftPicks, setDraftPicks] = useState(() => {
    const savedDraftPicks = localStorage.getItem("draftPicks");
    return savedDraftPicks ? JSON.parse(savedDraftPicks) : initialState;
  });

  // Fetch all player data on mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/data");
        if (!response.ok) throw new Error("Failed to fetch player data");
        const data = await response.json();
        setAllPlayers(data);
      } catch (error) {
        console.error("Error fetching player data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  // Handle draft pick
  const handleDraftPick = useCallback((playerId, friendName) => {
    setDraftPicks((prevDraftPicks) => {
      const updatedDraftPicks = {
        ...prevDraftPicks,
        [friendName]: [...prevDraftPicks[friendName], playerId],
      };
      localStorage.setItem("draftPicks", JSON.stringify(updatedDraftPicks));
      return updatedDraftPicks;
    });
  }, []);

  // Reset all teams
  const resetTeams = useCallback(() => {
    setDraftPicks(initialState);
    localStorage.setItem("draftPicks", JSON.stringify(initialState));
  }, [initialState]);

  // Remove player from a team
  const removePlayerFromTeam = useCallback((playerId, friendName) => {
    setDraftPicks((prevDraftPicks) => {
      const updatedTeam = prevDraftPicks[friendName].filter((id) => id !== playerId);
      const updatedDraftPicks = { ...prevDraftPicks, [friendName]: updatedTeam };
      localStorage.setItem("draftPicks", JSON.stringify(updatedDraftPicks));
      return updatedDraftPicks;
    });
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
          element={<TeamsDatabase 
            draftPicks={draftPicks} 
            allPlayers={allPlayers} 
            resetTeams={resetTeams} 
            removePlayerFromTeam={removePlayerFromTeam} 
          />} 
        />
        <Route 
          path="/ideal-draft" 
          element={<IdealDraftBoard allPlayers={allPlayers} />} 
        />
      </Routes>
    </Router>
  );
};

export default App;