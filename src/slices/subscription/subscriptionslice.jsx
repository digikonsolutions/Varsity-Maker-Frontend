import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Subscribeourcommunity } from '../../services/subscribeservice.jsx';

export const SubscribeourcommunityThunk = createAsyncThunk(
    'subscriptions/SubscribeourcommunityThunk',

    async (email, { rejectWithValue }) => {
        try {
            const res = await Subscribeourcommunity(email);
            return res;
        } catch (error) {
            return rejectWithValue(error?.response?.data || "Error");
        }
    }
);


const Subscribeourcommunityslice = createSlice({
    name: 'subscriptions',
    initialState : {
        items : [],
        loading : false,
        error : null
    },

    reducers : {},

    extraReducers : (builder) => {
        builder
            .addCase(SubscribeourcommunityThunk.pending, (state) => {
                state.loading = true;
            })

            .addCase(SubscribeourcommunityThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(SubscribeourcommunityThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
}) 

export default Subscribeourcommunityslice.reducer;