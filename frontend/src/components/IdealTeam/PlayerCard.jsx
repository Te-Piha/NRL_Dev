import React from "react";

const PlayerCard = ({ player, onWant, onRemove, onDraft }) => {
  return (
    <div className="player-card">
      <span>{player.first_name} {player.last_name} ({player.positions})</span>
      <button onClick={() => onWant(player)}>❗</button>
      <button onClick={() => onRemove(player.id)}>❌</button>
      <button onClick={() => onDraft(player)}>✔️</button>
    </div>
  );
};

export default PlayerCard;