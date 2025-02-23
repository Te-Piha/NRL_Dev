import React, { useState, useMemo, useCallback } from "react";
import PlayerCard from "./PlayerCard";

const PlayerSearch = ({ allPlayers, wantDraftList, setWantDraftList, draftedTeam, setDraftedTeam }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ useMemo: Prevents recalculating filtered players on every render
  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((player) =>
      (`${player.first_name} ${player.last_name}`).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allPlayers]);

  // ✅ useCallback: Caches function references so components don’t re-render unnecessarily
  const addToWantList = useCallback((player) => {
    setWantDraftList((prev) => {
      if (!prev[player.positions]) return { ...prev, [player.positions]: [player] };
      if (!prev[player.positions].find((p) => p.id === player.id)) {
        return { ...prev, [player.positions]: [...prev[player.positions], player] };
      }
      return prev;
    });
  }, [setWantDraftList]);

  const removeFromSearch = useCallback((playerId) => {
    setWantDraftList((prev) => {
      const newList = { ...prev };
      for (let pos in newList) {
        newList[pos] = newList[pos].filter((player) => player.id !== playerId);
      }
      return newList;
    });
  }, [setWantDraftList]);

  const addToDraftedTeam = useCallback((player) => {
    setDraftedTeam((prev) => ({
      ...prev,
      [player.positions]: prev[player.positions] ? [...prev[player.positions], player] : [player]
    }));
  }, [setDraftedTeam]);

  return (
    <div className="player-search">
      <input
        type="text"
        placeholder="Search for players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={() => setSearchTerm("")}>Clear</button>

      <ul>
        {filteredPlayers.map((player) => (
          <li key={player.id}>
            <PlayerCard 
              player={player} 
              onWant={addToWantList} 
              onRemove={removeFromSearch} 
              onDraft={addToDraftedTeam} 
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerSearch;