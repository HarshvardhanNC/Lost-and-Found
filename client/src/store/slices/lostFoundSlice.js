import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get authorization header helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async thunks for API calls
export const fetchItems = createAsyncThunk(
  'lostFound/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/lost-found`);
      // Sort items by date, newest first
      const sortedItems = response.data.sort((a, b) => {
        return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
      });
      return sortedItems;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load items'
      );
    }
  }
);

export const addItem = createAsyncThunk(
  'lostFound/addItem',
  async (itemData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `${API_URL}/lost-found`,
        {
          ...itemData,
          reportedBy: auth.user?.id,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add item'
      );
    }
  }
);

export const markAsClaimed = createAsyncThunk(
  'lostFound/markAsClaimed',
  async (itemId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `${API_URL}/lost-found/${itemId}/mark-claimed`,
        { userId: auth.user?.id },
        {
          headers: getAuthHeaders(),
        }
      );
      return { itemId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark item as claimed'
      );
    }
  }
);

export const unmarkClaimed = createAsyncThunk(
  'lostFound/unmarkClaimed',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/lost-found/${itemId}/unmark-claimed`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
      return { itemId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to unmark item'
      );
    }
  }
);

export const deleteItem = createAsyncThunk(
  'lostFound/deleteItem',
  async (itemId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/lost-found/${itemId}`, {
        headers: getAuthHeaders(),
      });
      return itemId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete item'
      );
    }
  }
);

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null,
  filter: 'all', // 'all', 'lost', 'found'
};

const lostFoundSlice = createSlice({
  name: 'lostFound',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch items
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add item
    builder
      .addCase(addItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.error = null;
      })
      .addCase(addItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Mark as claimed
    builder
      .addCase(markAsClaimed.fulfilled, (state, action) => {
        const item = state.items.find((item) => item._id === action.payload.itemId);
        if (item) {
          item.claimed = true;
          item.claimedAt = action.payload.claimedAt;
        }
      })
      .addCase(markAsClaimed.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Unmark claimed
    builder
      .addCase(unmarkClaimed.fulfilled, (state, action) => {
        const item = state.items.find((item) => item._id === action.payload.itemId);
        if (item) {
          item.claimed = false;
          item.claimedAt = null;
        }
      })
      .addCase(unmarkClaimed.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete item
    builder
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setFilter, clearError } = lostFoundSlice.actions;

// Selectors
export const selectAllItems = (state) => state.lostFound.items;
export const selectFilteredItems = (state) => {
  const { items, filter } = state.lostFound;
  if (filter === 'all') return items;
  return items.filter((item) => item.type === filter);
};
export const selectLostItems = (state) =>
  state.lostFound.items.filter((item) => item.type === 'lost');
export const selectFoundItems = (state) =>
  state.lostFound.items.filter((item) => item.type === 'found');
export const selectLoading = (state) => state.lostFound.loading;
export const selectError = (state) => state.lostFound.error;
export const selectFilter = (state) => state.lostFound.filter;

export default lostFoundSlice.reducer;
