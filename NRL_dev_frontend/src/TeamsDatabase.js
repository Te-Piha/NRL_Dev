// src/TeamsDatabase.js
import React from 'react'
import TeamTable from './TeamTable'
import './TeamTable.css'

const TeamsDatabase = ({ draftPicks, allPlayers, resetTeams, removePlayerFromTeam }) => {
  // You'll need to have the full list of all players available to look up the drafted players
  // This could come from props, state, context, etc.

  const renderTeamTables = () => {
    return Object.entries(draftPicks).map(([teamName, playerIds]) => {
      // Filter allPlayers to get only the players in the current team
      const teamPlayers = allPlayers.filter((player) =>
        playerIds.includes(player.id)
      )
      return (
        <TeamTable key={teamName} teamName={teamName} players={teamPlayers} removePlayerFromTeam={removePlayerFromTeam} />
      )
    })
  }

  return (
    <div>

      <button onClick={resetTeams}>Reset All Teams</button>
    <div className="teams-container">
      {renderTeamTables()}
    </div>
    </div>
  )
}

export default TeamsDatabase
