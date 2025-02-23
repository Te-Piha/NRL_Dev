import React, { useState } from "react";
import PlayerSearch from "./PlayerSearch";
import WantDraftList from "./WantDraftList";
import DraftedTeam from "./DraftedTeam";

const IdealTeamPage = ({ allPlayers }) => {
  const [wantDraftList, setWantDraftList] = useState({});
  const [draftedTeam, setDraftedTeam] = useState({});

  return (
    <div className="ideal-team-container">
      <h1>Ideal Team Draft</h1>
      
      <PlayerSearch 
        allPlayers={allPlayers} 
        wantDraftList={wantDraftList}
        setWantDraftList={setWantDraftList}
        draftedTeam={draftedTeam}
        setDraftedTeam={setDraftedTeam}
      />

      <WantDraftList 
        wantDraftList={wantDraftList}
        setWantDraftList={setWantDraftList}
      />

      <DraftedTeam 
        draftedTeam={draftedTeam}
        setDraftedTeam={setDraftedTeam}
      />
    </div>
  );
};

export default IdealTeamPage;