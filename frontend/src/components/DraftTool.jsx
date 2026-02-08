import React, { useState, useEffect, useMemo, useDeferredValue, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDraftedPlayers, fetchPriorityList, addToPriorityList, removePlayer, updatePriorityList, saveDraftPick, savePriorityList, clearDraftedPlayers } from '../redux/playerSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../styles/DraftTool.css';

const POSITIONS = ['HOK', 'MID', 'EDG', 'HLF', 'CTR', 'WFB', 'RES'];
const REC_POSITIONS = ['HOK', 'MID', 'EDG', 'HLF', 'CTR', 'WFB'];
const PLAYER_IMAGE_BASE_URL = 'https://fantasy.nrl.com/assets/media/players/nrl';
const TEAM_LOGO_BASE_URL = 'https://fantasy.nrl.com/assets/media/squads/nrl/logos';

const DraftTool = () => {
  const dispatch = useDispatch();
  const players = useSelector((state) => state.players.allPlayers);
  const priorityList = useSelector((state) => state.players.priorityList);
  const draftedTeam = useSelector((state) => state.players.draftedTeam);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [compactMode, setCompactMode] = useState(false);
  const [recommendationsPerPosition, setRecommendationsPerPosition] = useState(3);
  const [excludePriorityFromRecs, setExcludePriorityFromRecs] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [hiddenIds, setHiddenIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [availablePositions, setAvailablePositions] = useState([]);
  const [actionType, setActionType] = useState('');
  const searchInputRef = useRef(null);

  const getPlayerImageUrl = (player) => {
    const rawId = player?.id;
    if (!rawId) return null;
    return `${PLAYER_IMAGE_BASE_URL}/${rawId}_100.webp`;
  };

  const getTeamLogoUrl = (player) => {
    const teamId = player?.team_id ?? player?.squad_id ?? player?.teamId ?? player?.team?.id;
    if (!teamId) return null;
    return `${TEAM_LOGO_BASE_URL}/${teamId}.png`;
  };

  const renderAvatar = (player) => {
    const url = getPlayerImageUrl(player);
    const initials = `${player?.first_name?.[0] || ''}${player?.last_name?.[0] || ''}`.toUpperCase();
    return (
      <div className="avatar">
        {url && (
          <img
            src={url}
            alt={`${player.first_name} ${player.last_name}`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <span className="avatar-fallback">{initials}</span>
      </div>
    );
  };

  const renderTeamLogo = (player) => {
    const logoUrl = getTeamLogoUrl(player);
    if (!logoUrl) return null;
    return (
      <img
        className="team-logo"
        src={logoUrl}
        alt="Team logo"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  };

  const renderPlayerMeta = (player) => {
    const stats = player?.stats || {};
    const games = Number.isFinite(Number(stats.games_played)) ? Number(stats.games_played) : null;
    const avg = Number.isFinite(Number(stats.avg_points)) ? Number(stats.avg_points) : null;
    const adp = Number.isFinite(Number(stats.adp)) ? Number(stats.adp) : null;
    const pieces = [
      player.positions ? `Pos: ${player.positions}` : null,
      games !== null ? `GP ${games}` : null,
      avg !== null ? `Avg ${avg}` : null,
      adp !== null ? `ADP ${adp}` : null,
    ].filter(Boolean);

    if (pieces.length === 0) return null;
    return <span className="player-meta">{pieces.join(' · ')}</span>;
  };

  useEffect(() => {
    dispatch(fetchDraftedPlayers());
    dispatch(fetchPriorityList()); // Fetch stored priority list
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(savePriorityList(priorityList));
    }, 500);

    return () => clearTimeout(timer);
  }, [priorityList, dispatch]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nrl_hidden_players');
      if (stored) setHiddenIds(JSON.parse(stored));
    } catch (err) {
      setHiddenIds([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nrl_hidden_players', JSON.stringify(hiddenIds));
    } catch (err) {
      // ignore storage failures
    }
  }, [hiddenIds]);

  const filteredPlayers = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    if (!term) return [];

    const filtered = players.filter((player) => {
      const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
      const matchesName = fullName.includes(term);
      const matchesPosition = positionFilter === 'ALL'
        ? true
        : (player.positions || '').split(',').map((p) => p.trim()).includes(positionFilter);
      const notHidden = !hiddenIds.includes(player.id);
      return matchesName && matchesPosition && notHidden;
    });

    return filtered.slice(0, 120);
  }, [players, deferredSearchTerm, positionFilter, hiddenIds]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTypingField =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

      if (modalOpen) return;

      if (event.key === '/' && !isTypingField) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (isTypingField) return;

      if (event.key.toLowerCase() === 'c') {
        setCompactMode((prev) => !prev);
        return;
      }

      if (filteredPlayers.length === 0) return;

      if (event.key.toLowerCase() === 'a') {
        openModal(filteredPlayers[0], 'priority');
        return;
      }

      if (event.key.toLowerCase() === 'd' || event.key === 'Enter') {
        openModal(filteredPlayers[0], 'draft');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredPlayers, modalOpen]);

  const draftedIdSet = useMemo(() => new Set(draftedTeam.map((p) => p.id)), [draftedTeam]);
  const priorityIdSet = useMemo(() => new Set(priorityList.map((p) => p.id)), [priorityList]);

  const handleMarkTaken = (playerId) => {
    setHiddenIds((prev) => (prev.includes(playerId) ? prev : [...prev, playerId]));
    if (priorityIdSet.has(playerId)) {
      dispatch(updatePriorityList(priorityList.filter((p) => p.id !== playerId)));
    }
  };

  const recommendationPools = useMemo(() => {
    const pools = {};
    REC_POSITIONS.forEach((pos) => {
      pools[pos] = [];
    });

    players.forEach((player) => {
      if (hiddenIds.includes(player.id)) return;
      if (draftedIdSet.has(player.id)) return;
      if (excludePriorityFromRecs && priorityIdSet.has(player.id)) return;

      const positions = (player.positions || '').split(',').map((p) => p.trim());
      positions.forEach((pos) => {
        if (pools[pos]) pools[pos].push(player);
      });
    });

    return pools;
  }, [players, draftedIdSet, priorityIdSet, excludePriorityFromRecs, hiddenIds]);

  const recommendationsByPosition = useMemo(() => {
    const result = {};

    REC_POSITIONS.forEach((pos) => {
      const pool = recommendationPools[pos] || [];
      const enriched = pool.map((player) => {
        const stats = player.stats || {};
        const gamesPlayed = Number(stats.games_played || 0);
        const avgPoints = Number(stats.avg_points || 0);
        const totalPoints = Number(stats.total_points || 0);
        const adp = Number.isFinite(Number(stats.adp)) ? Number(stats.adp) : 9999;
        const valueScore = avgPoints - adp / 120;
        const baseScore = avgPoints * 0.6 + totalPoints * 0.2 + (1 / (adp + 1)) * 120 * 0.2;

        return {
          player,
          gamesPlayed,
          avgPoints,
          totalPoints,
          adp,
          valueScore,
          baseScore,
        };
      });

      const avgRanks = [...enriched].sort((a, b) => b.avgPoints - a.avgPoints);
      const valueRanks = [...enriched].sort((a, b) => b.valueScore - a.valueScore);

      const withTier = enriched.map((entry) => {
        const avgIndex = avgRanks.findIndex((e) => e.player.id === entry.player.id);
        const valueIndex = valueRanks.findIndex((e) => e.player.id === entry.player.id);
        const avgPercent = avgRanks.length ? avgIndex / avgRanks.length : 1;
        const valuePercent = valueRanks.length ? valueIndex / valueRanks.length : 1;

        let tier = 'Upside';
        if (entry.gamesPlayed <= 4 || entry.avgPoints === 0) {
          tier = 'Upside';
        } else if (avgPercent <= 0.3) {
          tier = 'Proven';
        } else if (valuePercent <= 0.3) {
          tier = 'Value';
        }

        const tags = [];
        if ((entry.player.positions || '').split(',').length > 1) tags.push('Multi-Pos');
        if (entry.player.status === 'injured') tags.push('Injured');
        tags.push(tier);

        return { ...entry, tier, tags };
      });

      const tierOrder = { Proven: 0, Value: 1, Upside: 2 };
      const sorted = withTier.sort((a, b) => {
        const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
        if (tierDiff !== 0) return tierDiff;
        return b.baseScore - a.baseScore;
      });

      result[pos] = sorted.slice(0, recommendationsPerPosition);
    });

    return result;
  }, [recommendationPools, recommendationsPerPosition]);

  const priorityByPosition = useMemo(() => {
    return POSITIONS.reduce((acc, pos) => {
      acc[pos] = priorityList.filter((player) => player.positions === pos);
      return acc;
    }, {});
  }, [priorityList]);

  const draftedByPosition = useMemo(() => {
    return POSITIONS.reduce((acc, pos) => {
      acc[pos] = draftedTeam.filter((player) => player.positions === pos);
      return acc;
    }, {});
  }, [draftedTeam]);

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
    <div className={`draft-tool ${compactMode ? 'compact' : ''}`}>
      {modalOpen && (
        <div className="modal">
          <div className="modal-card">
            <h3>Select Position</h3>
            <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
              {availablePositions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleConfirmSelection}>Confirm</button>
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <header className="draft-header">
        <div>
          <h1>Draft Tool</h1>
          <p>Search, prioritize, and lock picks without losing momentum.</p>
        </div>
        <div className="draft-stats">
          <div>
            <span className="label">Priority</span>
            <span className="value">{priorityList.length}</span>
          </div>
          <div>
            <span className="label">Drafted</span>
            <span className="value">{draftedTeam.length}</span>
          </div>
          <div>
            <span className="label">Available</span>
            <span className="value">{Math.max(players.length - draftedTeam.length, 0)}</span>
          </div>
        </div>
      </header>

      <section className="draft-controls">
        <div className="search">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search players by name..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="btn btn-ghost" onClick={() => setSearchTerm('')}>Clear</button>
          <button className="btn btn-ghost" onClick={() => setCompactMode((prev) => !prev)}>
            {compactMode ? 'Expand' : 'Compact'}
          </button>
        </div>
        {searchTerm && (
          <div className="search-popover">
            <div className="popover-header">
              <span className="muted">Search Results</span>
              <span className="muted">{`Showing ${filteredPlayers.length} (max 120)`}</span>
            </div>
            <div className="results">
              {filteredPlayers.map((player) => {
                const drafted = draftedIdSet.has(player.id);
                return (
                  <div key={player.id} className={`result-row ${drafted ? 'is-drafted' : ''}`}>
                    <div className="player-info">
                      {renderAvatar(player)}
                      <div>
                        <div className="player-name-row">
                          <span className="player-name">{player.first_name} {player.last_name}</span>
                          {renderTeamLogo(player)}
                        </div>
                        {renderPlayerMeta(player)}
                      </div>
                    </div>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => openModal(player, 'priority')}>+ Priority</button>
                      <button className="icon-btn" onClick={() => openModal(player, 'draft')}>Draft</button>
                      <button className="icon-btn danger" onClick={() => handleMarkTaken(player.id)}>Taken</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="shortcut-hints">
          <span className="hint">/ Focus search</span>
          <span className="hint">A Add top result</span>
          <span className="hint">D or Enter Draft top</span>
          <span className="hint">C Toggle compact</span>
        </div>
        <div className="recommend-controls">
          <label>
            Recommendations per position
            <input
              type="number"
              min="1"
              max="10"
              value={recommendationsPerPosition}
              onChange={(e) => setRecommendationsPerPosition(Number(e.target.value || 1))}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={excludePriorityFromRecs}
              onChange={() => setExcludePriorityFromRecs((prev) => !prev)}
            />
            Exclude players already in Priority List
          </label>
        </div>
        <div className="filters">
          <span>Position</span>
          <div className="chips">
            <button className={positionFilter === 'ALL' ? 'chip active' : 'chip'} onClick={() => setPositionFilter('ALL')}>All</button>
            {POSITIONS.map((pos) => (
              <button key={pos} className={positionFilter === pos ? 'chip active' : 'chip'} onClick={() => setPositionFilter(pos)}>{pos}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="draft-panel recommend-panel">
        <button className="recommend-toggle" onClick={() => setShowRecommendations((prev) => !prev)}>
          <div>
            <h2>Recommended</h2>
            <span className="muted">Tiered by Proven, Value, Upside</span>
          </div>
          <span className="toggle-indicator">{showRecommendations ? 'Hide' : 'Show'}</span>
        </button>
        {showRecommendations && (
          <div className="board">
            {REC_POSITIONS.map((position) => (
              <div key={position} className="board-column">
                <div className="column-header">
                  <h3>{position}</h3>
                  <span className="muted">{recommendationsByPosition[position]?.length || 0}</span>
                </div>
                <div className="column-body">
                  {(recommendationsByPosition[position] || []).map((entry) => (
                    <div key={entry.player.id} className="pill">
                      <div className="pill-main">
                        <div className="player-info">
                          {renderAvatar(entry.player)}
                          <div>
                            <div className="player-name-row">
                              <span>{entry.player.first_name} {entry.player.last_name}</span>
                              {renderTeamLogo(entry.player)}
                            </div>
                            {renderPlayerMeta(entry.player)}
                          </div>
                        </div>
                        <div className="tag-row">
                          {entry.tags.map((tag) => (
                            <span key={tag} className={`tag tag-${tag.toLowerCase().replace(/[^a-z]/g, '')}`}>{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="pill-actions">
                        <button className="link" onClick={() => openModal(entry.player, 'priority')}>+ Priority</button>
                        <button className="link" onClick={() => openModal(entry.player, 'draft')}>Draft</button>
                        <button className="link danger" onClick={() => handleMarkTaken(entry.player.id)}>Taken</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="draft-grid">
        <section className="draft-panel">
          <div className="panel-header">
            <h2>Priority Board</h2>
            <button className="btn btn-ghost" onClick={() => dispatch(updatePriorityList([]))}>Clear</button>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="board board-positions">
              {POSITIONS.map((position) => (
                <Droppable key={position} droppableId={position}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="board-column">
                      <div className="column-header">
                        <h3>{position}</h3>
                        <button className="link" onClick={() => dispatch(updatePriorityList(priorityList.filter(p => p.positions !== position)))}>Clear</button>
                      </div>
                      <div className="column-body">
                        {priorityByPosition[position].map((player, index) => (
                          <Draggable key={player.id} draggableId={player.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="pill"
                              >
                                <div className="player-info">
                                  {renderAvatar(player)}
                                  <div>
                                    <div className="player-name-row">
                                      <span>{player.first_name} {player.last_name}</span>
                                      {renderTeamLogo(player)}
                                    </div>
                                    {renderPlayerMeta(player)}
                                  </div>
                                </div>
                                <div className="pill-actions">
                                  <button
                                    className="link success"
                                    onClick={() => openModal(player, 'draft')}
                                  >
                                    ✓
                                  </button>
                                  <button className="link danger" onClick={() => dispatch(removePlayer(player.id))}>✕</button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </section>

        <section className="draft-panel">
          <div className="panel-header">
            <h2>Drafted Team</h2>
            <button className="btn btn-ghost" onClick={() => dispatch(clearDraftedPlayers())}>Clear</button>
          </div>
          <div className="board">
            {POSITIONS.map((position) => (
              <div key={position} className="board-column">
                <div className="column-header">
                  <h3>{position}</h3>
                  <span className="muted">{draftedByPosition[position].length}</span>
                </div>
                <div className="column-body">
                  {draftedByPosition[position].map((player) => (
                    <div key={player.id} className="pill">
                      <div className="player-info">
                        {renderAvatar(player)}
                        <div>
                          <div className="player-name-row">
                            <span>{player.first_name} {player.last_name}</span>
                            {renderTeamLogo(player)}
                          </div>
                          {renderPlayerMeta(player)}
                        </div>
                      </div>
                      <button className="link danger" onClick={() => dispatch(removePlayer(player.id))}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DraftTool;
