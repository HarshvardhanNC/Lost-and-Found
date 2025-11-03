import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import lostFoundReducer from './slices/lostFoundSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    lostFound: lostFoundReducer,
  },
});
