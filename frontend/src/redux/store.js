import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './playerSlice';

const store = configureStore({
  reducer: {
    players: playerReducer,
  },
});

export default store;
