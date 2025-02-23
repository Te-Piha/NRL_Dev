import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchPlayers } from './redux/playerSlice';
import Dashboard from './components/Dashboard';
import PlayersDatabase from './components/PlayersDatabase';
import DraftTool from './components/DraftTool';
import NavBar from './components/Navbar';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPlayers());
  }, [dispatch]);

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate replace to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/players-database" element={<PlayersDatabase />} />
        <Route path="/draft-tool" element={<DraftTool />} /> {/* ✅ New route for testing */}
      </Routes>
    </Router>
  );
};

export default App;