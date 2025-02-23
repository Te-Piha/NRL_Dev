import React from "react";

const PositionBox = ({ position, players, setWantDraftList }) => {
  const removePlayer = (playerId) => {
    setWantDraftList(prev => ({
      ...prev,
      [position]: prev[position].filter(player => player.id !== playerId)
    }));
  };

  return (
    <div className="position-box">
      <h3>{position}</h3>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.first_name} {player.last_name}
            <button onClick={() => removePlayer(player.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PositionBox;