import React from "react";

const DraftedTeam = ({ draftedTeam, setDraftedTeam }) => {
  return (
    <div className="drafted-team">
      <h2>Drafted Team</h2>
      {Object.keys(draftedTeam).map((position) => (
        <div key={position}>
          <h3>{position}</h3>
          <ul>
            {draftedTeam[position].map((player) => (
              <li key={player.id}>
                {player.first_name} {player.last_name}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={() => setDraftedTeam({})}>Clear Drafted Team</button>
    </div>
  );
};

export default DraftedTeam;