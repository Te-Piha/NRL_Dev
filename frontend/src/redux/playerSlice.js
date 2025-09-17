import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

// Fetch players from backend
export const fetchPlayers = createAsyncThunk('players/fetchPlayers', async () => {
  const response = await fetch(`${API_BASE_URL}/data`);
  return response.json();
});

// Fetch drafted players from backend
export const fetchDraftedPlayers = createAsyncThunk('players/fetchDraftedPlayers', async () => {
  const response = await fetch(`${API_BASE_URL}/drafted_players`);
  return response.json();
});

// Persist draft picks to backend
export const saveDraftPick = createAsyncThunk('players/saveDraftPick', async (player) => {
  const response = await fetch(`${API_BASE_URL}/drafted_players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(player),
  });
  return response.json();
});

// Clear drafted players from backend
export const clearDraftedPlayers = createAsyncThunk('players/clearDraftedPlayers', async () => {
  await fetch(`${API_BASE_URL}/drafted_players`, {
    method: 'DELETE',
  });
  return [];
});

// Fetch priority list from backend
export const fetchPriorityList = createAsyncThunk('players/fetchPriorityList', async () => {
  const response = await fetch(`${API_BASE_URL}/priority_list`);
  return response.json();
});

// Save priority list to backend
export const savePriorityList = createAsyncThunk('players/savePriorityList', async (priorityList) => {
  await fetch(`${API_BASE_URL}/priority_list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(priorityList),
  });
});

const playerSlice = createSlice({
  name: 'players',
  initialState: {
    allPlayers: [],
    priorityList: [],
    draftedTeam: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addToPriorityList: (state, action) => {
      if (!state.priorityList.some(player => player.id === action.payload.id)) {
        state.priorityList.push(action.payload);
      }
    },
    removePlayer: (state, action) => {
      state.priorityList = state.priorityList.filter(player => player.id !== action.payload);
    },
    updatePriorityList: (state, action) => {
      state.priorityList = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allPlayers = action.payload;
      })
      .addCase(saveDraftPick.fulfilled, (state, action) => {
        if (!state.draftedTeam.some(player => player.id === action.payload.id)) {
          state.draftedTeam.push(action.payload);
        }
      })
      .addCase(fetchDraftedPlayers.fulfilled, (state, action) => {
        state.draftedTeam = action.payload;
      })
      .addCase(fetchPriorityList.fulfilled, (state, action) => {
        state.priorityList = action.payload;
      })
      .addCase(clearDraftedPlayers.fulfilled, (state) => {
        state.draftedTeam = [];
      });
  },
});

export const { addToPriorityList, removePlayer, updatePriorityList } = playerSlice.actions;
export default playerSlice.reducer;
