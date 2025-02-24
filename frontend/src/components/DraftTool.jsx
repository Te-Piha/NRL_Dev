import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers, fetchDraftedPlayers, fetchPriorityList, addToPriorityList, removePlayer, updatePriorityList, saveDraftPick, savePriorityList, clearDraftedPlayers } from '../redux/playerSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const DraftTool = () => {
  const dispatch = useDispatch();
  const players = useSelector((state) => state.players.allPlayers);
  const priorityList = useSelector((state) => state.players.priorityList);
  const draftedTeam = useSelector((state) => state.players.draftedTeam);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchPlayers());
    dispatch(fetchDraftedPlayers());
    dispatch(fetchPriorityList()); // Fetch stored priority list
  }, [dispatch]);

  useEffect(() => {
    dispatch(savePriorityList(priorityList)); // Save priority list on change
  }, [priorityList, dispatch]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredPlayers = searchTerm
    ? players.filter((player) =>
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedList = [...priorityList];
    const [movedItem] = reorderedList.splice(result.source.index, 1);
    reorderedList.splice(result.destination.index, 0, movedItem);
    dispatch(updatePriorityList(reorderedList));
  };

  const handleDraftPlayer = (player) => {
    dispatch(saveDraftPick(player)); // Only dispatch API call, Redux updates from response
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
      <button onClick={() => setSearchTerm('')}>Clear Search</button>
      <ul>
        {filteredPlayers.map((player) => (
          <li key={player.id}>
            {player.first_name} {player.last_name} ({player.positions})
            <button onClick={() => dispatch(addToPriorityList(player))}>➕</button>
            <button onClick={() => dispatch(removePlayer(player.id))}>❌</button>
            <button onClick={() => handleDraftPlayer(player)}>✅</button>
          </li>
        ))}
      </ul>
      
      <h2>Priority List</h2>
      <button onClick={() => dispatch(updatePriorityList([]))}>Clear Priority List</button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="priorityList">
          {(provided) => (
            <ul ref={provided.innerRef} {...provided.droppableProps}>
              {priorityList.map((player, index) => (
                <Draggable key={player.id} draggableId={player.id.toString()} index={index}>
                  {(provided) => (
                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      {player.first_name} {player.last_name} ({player.positions})
                      <button onClick={() => dispatch(removePlayer(player.id))}>❌</button>
                      <button onClick={() => handleDraftPlayer(player)}>✅</button>
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
      <button onClick={() => dispatch(clearDraftedPlayers())}>Clear Drafted Team</button>
      <ul>
        {draftedTeam.map((player) => (
          <li key={player.id}>{player.first_name} {player.last_name} ({player.positions})</li>
        ))}
      </ul>
    </div>
  );
};

export default DraftTool;
