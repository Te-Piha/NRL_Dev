import React from "react";
import PositionBox from "./PositionBox";

const positions = ["HOK", "MID", "EDG", "HLF", "CTR", "WFB", "RES"];

const WantDraftList = ({ wantDraftList, setWantDraftList }) => {
  return (
    <div className="want-draft-list">
      <h2>Want List</h2>
      <div className="grid-container">
        {positions.map((position) => (
          <PositionBox
            key={position}
            position={position}
            players={wantDraftList[position] || []}
            setWantDraftList={setWantDraftList}
          />
        ))}
      </div>
    </div>
  );
};

export default WantDraftList;