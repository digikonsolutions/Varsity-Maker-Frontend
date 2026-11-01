import react from 'react';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {GetsingleblogbyID} from '../../services/blogservice.jsx';

export const getsingleblogAPIthunk = createAsyncThunk(
  'singleblog/GetsingleblogbyID',
  async(id, {rejectWithValue}) => {
    try {
      const res = await GetsingleblogbyID(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Error");
    }
  }
);

const getsingleblogslice = createSlice({
    name: 'singleblog', 
    initialState: {
        items: null,
        loading: false,
        error : null
    },

    reducers: {},

    extraReducers : (builder) => {
        builder
            .addCase(getsingleblogAPIthunk.pending, (state) => {
                state.loading = true;
            })

            .addCase(getsingleblogAPIthunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(getsingleblogAPIthunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
})

export default getsingleblogslice.reducer;