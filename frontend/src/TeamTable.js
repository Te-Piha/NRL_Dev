import React from 'react';
import './styles/TeamTable.css'

const TeamTable = ({ teamName, players, removePlayerFromTeam }) => {


  
  const totalPoints = players.reduce((acc, player) => {
    const points = parseInt(player.stats.total_points);
    return acc + (isNaN(points) ? 0 : points);
  }, 0);
  
  const totalAVGPoints = players.reduce((acc, player) => {
    const points = parseInt(player.stats.avg_points);
    return acc + (isNaN(points) ? 0 : points);
  }, 0);
  const avgOfAVGPoints = players.length > 0 ? totalAVGPoints / players.length : 0;
  
  const totalCARPoints = players.reduce((acc, player) => {
    const points = parseInt(player.stats.career_avg);
    return acc + (isNaN(points) ? 0 : points);
  }, 0);
  const avgOfCARPoints = players.length > 0 ? totalCARPoints / players.length : 0;



return (
      <div className="team-table">
      <h2 className='paddingHeader'>{teamName}'s Team</h2>
      <table >
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Position</th>
            <th>Games Played</th>
            <th>Total Points</th>
            <th>Avg Points</th>
            <th>Career avg</th>
            <th>Delete</th>
            {/* ... other headers ... */}
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id}>
              <td>{`${player.first_name} ${player.last_name}`}</td>
              <td>{player.positions}</td>
              <td>{player.stats.games_played}</td>
              <td>{player.stats.total_points}</td>
              <td>{player.stats.avg_points}</td>
              <td>{player.stats.career_avg}</td>
              {/* ... other player data ... */}
              <button onClick={() => removePlayerFromTeam(player.id, teamName)}>
                Remove
              </button>
            </tr>
            
          ))}
            <tr>
            <td colSpan="3">Total Points</td>
            <td>{totalPoints}</td>
            <td>{avgOfAVGPoints}</td>
            <td>{avgOfCARPoints}</td>
            <td></td> {/* Empty cell for the delete column */}
          </tr>
        </tbody>
      </table>
      </div>
  );
};

export default TeamTable;