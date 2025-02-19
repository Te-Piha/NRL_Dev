// src/PlayersDatabase.js
import React, { useEffect, useState, useMemo } from 'react'
import '../styles/PlayersDatabase.css'

const PlayersDatabase = ({ onDraftPick, draftPicks }) => {
  const [players, setPlayers] = useState([])
  const [filters, setFilters] = useState({
    position: '',
    gamesPlayed: '',
    isInjured: false,
  })
  const [hideZeroGamesOrAdp, setHideZeroGamesOrAdp] = useState(false)
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending',
  })
  const [showOnlyMultiPositionPlayers, setShowOnlyMultiPositionPlayers] =
    useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Replace with the actual endpoint of your backend
    fetch('http://127.0.0.1:5000/data')
      .then((response) => response.json())
      .then((data) => setPlayers(data))
      .catch((error) => console.error('Error fetching data: ', error))
  }, [])

  //Filter
  const filteredPlayers = useMemo(
    () =>
      players.filter((player) => {
        const positionMatches = filters.position
          ? player.positions.includes(filters.position)
          : true

        const gamesPlayedMatches = filters.gamesPlayed
          ? player.stats.games_played >= filters.gamesPlayed
          : true

        const isInjuredMatches = filters.isInjured
          ? player.status === 'injured'
          : true

        const hideZeroGamesOrAdpMatches =
          !hideZeroGamesOrAdp ||
          (player.stats.games_played !== 0 && player.stats.adp !== 0)

        const multiPositionMatches = showOnlyMultiPositionPlayers
          ? player.positions.split(',').length > 1
          : true

        return (
          positionMatches &&
          gamesPlayedMatches &&
          isInjuredMatches &&
          hideZeroGamesOrAdpMatches &&
          multiPositionMatches
        )
      }),
    [players, filters, hideZeroGamesOrAdp, showOnlyMultiPositionPlayers]
  )

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  const getFilteredAndSearchedPlayers = useMemo(() => {
    let result = filteredPlayers.filter((player) => {
      const fullName = `${player.first_name} ${player.last_name}`.toLowerCase()
      return fullName.includes(searchQuery.toLowerCase())
    })

    if (sortConfig.key) {
      result = result.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key)
        const bValue = getNestedValue(b, sortConfig.key)
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [filteredPlayers, searchQuery, sortConfig])

  // Sort

  const sortData = (sortKey) => {
    setSortConfig((currentSortConfig) => {
      const isAscending =
        currentSortConfig.key === sortKey &&
        currentSortConfig.direction === 'ascending'
      return {
        key: sortKey,
        direction: isAscending ? 'descending' : 'ascending',
      }
    })
  }

  const handlePositionChange = (e) => {
    setFilters({ ...filters, position: e.target.value })
  }

  const handleGamesPlayedChange = (e) => {
    setFilters({ ...filters, gamesPlayed: e.target.value })
  }

  const handleInjuryChange = (e) => {
    setFilters({ ...filters, isInjured: e.target.checked })
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
  }

  function isPlayerDrafted(playerId, draftPicks) {
    return Object.values(draftPicks ?? {}).some(team => team.includes(playerId));
  }
  
  // Function to check if a player has been drafted by any team
  const isPlayerDraftedColor = (playerId) => {
    return Object.values(draftPicks).some(playerIds => playerIds.includes(playerId));
  };

  return (
    <div>
      <div className="table-container">
        <div>
          <input
            type="text"
            placeholder="Search for a player"
            onChange={handleSearchChange}
            value={searchQuery}
          />

          {/* Position filter */}
          <select value={filters.position} onChange={handlePositionChange}>
            <option value="">All Positions</option>
            <option value="HOK">Hooker</option>
            <option value="MID">Middle</option>
            <option value="EDG">Edge</option>
            <option value="HLF">Half</option>
            <option value="CTR">Center</option>
            <option value="WFB">Winger/Fulback</option>
          </select>

          {/* Games played filter */}
          <input
            type="number"
            value={filters.gamesPlayed}
            onChange={handleGamesPlayedChange}
            placeholder="Min games played"
          />

          {/* Injury filter */}
          <label>
            <input
              type="checkbox"
              checked={filters.isInjured}
              onChange={handleInjuryChange}
            />
            Injured
          </label>

          <button
            onClick={() => setHideZeroGamesOrAdp((prevState) => !prevState)}
          >
            {hideZeroGamesOrAdp ? 'Show' : 'Hide'} Zero
          </button>

          <label>
            <input
              type="checkbox"
              checked={showOnlyMultiPositionPlayers}
              onChange={(e) =>
                setShowOnlyMultiPositionPlayers(e.target.checked)
              }
            />
            Dual Position
          </label>
        </div>
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
            <th>Drafted To</th>

            {/* Add more headers as needed */}
          </tr>
        </thead>

        <tbody>
          {getFilteredAndSearchedPlayers.map((player) => (
            <tr 
            key={player.id}
            style={{ backgroundColor: isPlayerDraftedColor(player.id) ? '#5fcd99' : 'transparent' }}
            >
              <td>{player.stats.adp}</td>
              <td className={player.status === 'injured' ? 'injured' : ''}>
                {player.first_name} {player.last_name}
              </td>
              <td>{player.positions}</td>
              <td>{player.stats.games_played}</td>
              <td>{player.stats.total_points}</td>
              <td>{player.stats.avg_points}</td>
              <td>{player.stats.career_avg}</td>
              <td>
              <select onChange={(e) => onDraftPick(player.id, e.target.value)}>
                <option value="">Draft to...</option>
                    {Object.keys(draftPicks ?? {}).map(teamName => (
                  <option key={teamName} value={teamName} disabled={isPlayerDrafted(player.id, draftPicks)}>{teamName}</option>
                    ))}
              </select>
              </td>

              {/* Add more data cells as needed */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PlayersDatabase
