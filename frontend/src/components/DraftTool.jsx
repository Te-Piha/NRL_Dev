import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers, addToPriorityList, removePlayer, draftPlayer, updatePriorityList, saveDraftPick } from '../redux/playerSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const DraftTool = () => {
  const dispatch = useDispatch();
  const players = useSelector((state) => state.players.allPlayers);
  const priorityList = useSelector((state) => state.players.priorityList);
  const draftedTeam = useSelector((state) => state.players.draftedTeam);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchPlayers());
  }, [dispatch]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedList = [...priorityList];
    const [movedItem] = reorderedList.splice(result.source.index, 1);
    reorderedList.splice(result.destination.index, 0, movedItem);
    dispatch(updatePriorityList(reorderedList));
  };

  const handleDraftPlayer = (player) => {
    dispatch(draftPlayer(player));
    dispatch(saveDraftPick(player)); // Save to backend
  };

  return (
    <div>
      <h1>Fantasy Draft Tool</h1>
      <input
        type="text"
        placeholder="Search Players..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <ul>
        {filteredPlayers.map((player) => (
          <li key={player.id}>
            {player.name} ({player.position})
            <button onClick={() => dispatch(addToPriorityList(player))}>➕</button>
            <button onClick={() => dispatch(removePlayer(player.id))}>❌</button>
            <button onClick={() => handleDraftPlayer(player)}>✅</button>
          </li>
        ))}
      </ul>
      
      <h2>Priority List</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="priorityList">
          {(provided) => (
            <ul ref={provided.innerRef} {...provided.droppableProps}>
              {priorityList.map((player, index) => (
                <Draggable key={player.id} draggableId={player.id.toString()} index={index}>
                  {(provided) => (
                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      {player.name} ({player.position})
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      
      <h2>Drafted Team</h2>
      <ul>
        {draftedTeam.map((player) => (
          <li key={player.id}>{player.name} ({player.position})</li>
        ))}
      </ul>
    </div>
  );
};

export default DraftTool;