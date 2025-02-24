import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers, fetchDraftedPlayers, fetchPriorityList, addToPriorityList, removePlayer, updatePriorityList, saveDraftPick, savePriorityList, clearDraftedPlayers } from '../redux/playerSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const POSITIONS = ['HOK', 'MID', 'EDG', 'HLF', 'CTR', 'WFB', 'RES'];

const DraftTool = () => {
  const dispatch = useDispatch();
  const players = useSelector((state) => state.players.allPlayers);
  const priorityList = useSelector((state) => state.players.priorityList);
  const draftedTeam = useSelector((state) => state.players.draftedTeam);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [availablePositions, setAvailablePositions] = useState([]);
  const [actionType, setActionType] = useState('');

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
    
      const { source, destination } = result;
      const sourcePosition = source.droppableId;
      const destinationPosition = destination.droppableId;
    
      if (sourcePosition !== destinationPosition) return; // Prevent cross-position dragging
    
      const updatedList = [...priorityList];
      const playersInPosition = updatedList.filter(player => player.positions === sourcePosition);
    
      const [movedPlayer] = playersInPosition.splice(source.index, 1);
      playersInPosition.splice(destination.index, 0, movedPlayer);
    
      const newPriorityList = updatedList
        .filter(player => player.positions !== sourcePosition)
        .concat(playersInPosition);
    
      dispatch(updatePriorityList(newPriorityList));
    };

  const openModal = (player, type) => {
    setSelectedPlayer(player);
    setActionType(type);
    
    let positionsArray = typeof player.positions === 'string' 
      ? player.positions.split(',').map(pos => pos.trim()) 
      : Array.isArray(player.positions) 
      ? player.positions 
      : [];

    if (positionsArray.length === 0) {
      positionsArray = ['RES'];
    } else {
      positionsArray.push('RES'); // Always allow the Reserve option
    }
    
    setAvailablePositions(positionsArray);
    setSelectedPosition(positionsArray[0]);
    setModalOpen(true);
  };

  const handleConfirmSelection = () => {
    if (selectedPlayer) {
      const playerWithPosition = { ...selectedPlayer, positions: selectedPosition };
      if (actionType === 'priority') {
        dispatch(addToPriorityList(playerWithPosition));
      } else if (actionType === 'draft') {
        dispatch(saveDraftPick(playerWithPosition));
      }
    }
    setModalOpen(false);
  };

  return (
    <div>

{modalOpen && (
        <div className="modal">
          <h3>Select Position</h3>
          <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
            {availablePositions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          <button onClick={handleConfirmSelection}>Confirm</button>
          <button onClick={() => setModalOpen(false)}>Cancel</button>
        </div>
      )}

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
            <button onClick={() => openModal(player, 'priority')}>➕</button>
            <button onClick={() => dispatch(removePlayer(player.id))}>❌</button>
            <button onClick={() => openModal(player, 'draft')}>✅</button>
          </li>
        ))}
      </ul>



      
      <h2>Priority List</h2>
<button onClick={() => dispatch(updatePriorityList([]))}>Clear Priority List</button>

<DragDropContext onDragEnd={handleDragEnd}>
  <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', padding: '10px' }}>
    {POSITIONS.map((position) => (
      <Droppable key={position} droppableId={position}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ minWidth: '150px', border: '1px solid black', padding: '10px' }}
          >
            <h3>{position}</h3>
            <button onClick={() => dispatch(updatePriorityList(priorityList.filter(p => p.positions !== position)))}>Clear</button>
            <ul>
              {priorityList
                .filter(player => player.positions === position) // ✅ Correct Filtering
                .map((player, index) => (
                  <Draggable key={player.id} draggableId={player.id.toString()} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {player.first_name} {player.last_name}
                        <button onClick={() => dispatch(removePlayer(player.id))}>❌</button>
                      </li>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </ul>
          </div>
        )}
      </Droppable>
    ))}
  </div>
</DragDropContext>
      
      <h2>Drafted Team</h2>
<button onClick={() => dispatch(clearDraftedPlayers())}>Clear Drafted Team</button>

<div style={{ display: 'flex', overflowX: 'auto', gap: '10px', padding: '10px' }}>
  {POSITIONS.map((position) => {
    const playersInPosition = draftedTeam.filter(player => player.positions === position);

    return (
      <div key={position} style={{ minWidth: '150px', border: '1px solid black', padding: '10px' }}>
        <h3>{position} ({playersInPosition.length})</h3>
        <button onClick={() => dispatch(updatePriorityList(draftedTeam.filter(p => p.positions !== position)))}>Clear</button>
        <ul>
          {playersInPosition.map((player) => (
            <li key={player.id}>
              {player.first_name} {player.last_name}
              <button onClick={() => dispatch(removePlayer(player.id))}>❌</button>
            </li>
          ))}
        </ul>
      </div>
    );
  })}
</div>


    </div>
  );
};

export default DraftTool;
