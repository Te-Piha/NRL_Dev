import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchPlayers = createAsyncThunk('players/fetchPlayers', async () => {
    console.log("Fetching players...");
    try {
      const response = await fetch('http://127.0.0.1:5000/data'); 
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched data:", data);
      return data;
    } catch (error) {
      console.error("Fetch players failed:", error);
      return [];
    }
  });

// Persist draft picks to backend
export const saveDraftPick = createAsyncThunk('players/saveDraftPick', async (player) => {
  const response = await fetch('/drafted_players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(player),
  });
  return response.json();
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
    draftPlayer: (state, action) => {
      if (!state.draftedTeam.some(player => player.id === action.payload.id)) {
        state.draftedTeam.push(action.payload);
      }
    },
    updatePriorityList: (state, action) => {
      state.priorityList = action.payload;
    },
    clearDraftedTeam: (state) => {
      state.draftedTeam = [];
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
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(saveDraftPick.fulfilled, (state, action) => {
        state.draftedTeam.push(action.payload);
      });
  },
});

export const { addToPriorityList, removePlayer, draftPlayer, updatePriorityList, clearDraftedTeam } = playerSlice.actions;
export default playerSlice.reducer;
