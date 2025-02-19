// src/Player.js
import React from 'react';

const Player = ({ player }) => {
  return (
    <tr>
      <td>{player.first_name} {player.last_name}</td>
      <td>{player.positions}</td>
      <td>{player.stats.games_played}</td>
      <td>{player.stats.total_points}</td>
      {/* Add more data cells as needed */}
    </tr>
  );
};

export default Player;