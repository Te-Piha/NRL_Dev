import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import '../styles/PlayersDatabase.css';

const PlayersDatabase = () => {
  const players = useSelector(state => state.players.allPlayers); // Get data from Redux store
  const [filters, setFilters] = useState({
    position: '',
    gamesPlayed: '',
    isInjured: false,
  });
  const [hideZeroGamesOrAdp, setHideZeroGamesOrAdp] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending',
  });
  const [showOnlyMultiPositionPlayers, setShowOnlyMultiPositionPlayers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Ensure players is always an array to avoid errors
  const safePlayers = players || [];

  // ✅ Apply Filtering
  const filteredPlayers = useMemo(() => 
    safePlayers.filter((player) => {
      const positionMatches = filters.position ? player.positions.includes(filters.position) : true;
      const gamesPlayedMatches = filters.gamesPlayed ? player.stats.games_played >= filters.gamesPlayed : true;
      const isInjuredMatches = filters.isInjured ? player.status === 'injured' : true;
      const hideZeroGamesOrAdpMatches = !hideZeroGamesOrAdp || (player.stats.games_played !== 0 && player.stats.adp !== 0);
      const multiPositionMatches = showOnlyMultiPositionPlayers ? player.positions.split(',').length > 1 : true;

      return (
        positionMatches &&
        gamesPlayedMatches &&
        isInjuredMatches &&
        hideZeroGamesOrAdpMatches &&
        multiPositionMatches
      );
    }),
    [safePlayers, filters, hideZeroGamesOrAdp, showOnlyMultiPositionPlayers]
  );

  // ✅ Apply Search and Sorting
  const getFilteredAndSearchedPlayers = useMemo(() => {
    let result = filteredPlayers.filter(player => {
      const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {  // Spread to avoid modifying original array
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [filteredPlayers, searchQuery, sortConfig]);

  // ✅ Sorting function
  const sortData = (sortKey) => {
    setSortConfig((currentSortConfig) => {
      const isAscending =
        currentSortConfig.key === sortKey &&
        currentSortConfig.direction === 'ascending';
      return {
        key: sortKey,
        direction: isAscending ? 'descending' : 'ascending',
      };
    });
  };

  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  return (
    <div>
      <div className="table-container">
        <input type="text" placeholder="Search for a player" onChange={handleSearchChange} value={searchQuery} />

        <label>
          <input
            type="checkbox"
            checked={hideZeroGamesOrAdp}
            onChange={() => setHideZeroGamesOrAdp(prev => !prev)}
          />
          Hide Zero Games/ADP
        </label>

        <label>
          <input
            type="checkbox"
            checked={showOnlyMultiPositionPlayers}
            onChange={() => setShowOnlyMultiPositionPlayers(prev => !prev)}
          />
          Show Only Multi-Position Players
        </label>

        <select value={filters.position} onChange={(e) => setFilters({ ...filters, position: e.target.value })}>
          <option value="">All Positions</option>
          <option value="HOK">Hooker</option>
          <option value="MID">Middle</option>
          <option value="EDG">Edge</option>
          <option value="HLF">Half</option>
          <option value="CTR">Center</option>
          <option value="WFB">Winger/Fullback</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th onClick={() => sortData('stats.adp')}>Rank</th>
            <th onClick={() => sortData('first_name')}>Player</th>
            <th onClick={() => sortData('positions')}>Position</th>
            <th onClick={() => sortData('stats.games_played')}>Games Played</th>
            <th onClick={() => sortData('stats.total_points')}>Total Points</th>
            <th onClick={() => sortData('stats.avg_points')}>AVG Stats</th>
            <th onClick={() => sortData('stats.career_avg')}>Career Stats</th>
          </tr>
        </thead>

        <tbody>
          {getFilteredAndSearchedPlayers.map((player) => (
            <tr key={player.id}>
              <td>{player.stats.adp}</td>
              <td>{player.first_name} {player.last_name}</td>
              <td>{player.positions}</td>
              <td>{player.stats.games_played}</td>
              <td>{player.stats.total_points}</td>
              <td>{player.stats.avg_points}</td>
              <td>{player.stats.career_avg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 🔹 Helper function to get nested values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export default PlayersDatabase;