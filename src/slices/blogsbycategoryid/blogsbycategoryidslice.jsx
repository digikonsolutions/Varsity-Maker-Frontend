import react from 'react';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {FetchblogsbycategoryID} from '../../services/blogservice.jsx';

export const FetchblogsbycategoryidAPI = createAsyncThunk(
    'blogsbycategory/FetchblogsbycategoryidAPI',

    async({id}, {rejectWithValue}) => {
        try {
            const res = await FetchblogsbycategoryID(id);
            return res;
        } catch (error) {
            return rejectWithValue(error?.response?.data || "Error");
        }
    }
);


const createblogsbycategoryslice = createSlice({
    name: 'blogsbycategory',
    initialState: {
        items : [],
        loading : false,
        error: null,
    },

    reducers : {},

    extraReducers: (builder) => {
        builder
            .addCase(FetchblogsbycategoryidAPI.pending, (state) => {
                state.loading = true;
            })

            .addCase(FetchblogsbycategoryidAPI.fulfilled, (state, action) =>{
                state.loading = false,
                state.items = action.payload.data;
            })

            .addCase(FetchblogsbycategoryidAPI.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

    }
})

export default createblogsbycategoryslice.reducer;