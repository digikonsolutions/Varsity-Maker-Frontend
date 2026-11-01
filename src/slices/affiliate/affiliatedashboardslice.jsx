import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Affiliatedashboard } from '../../services/affiliateservices.jsx';

export const affiliatedashboardthunk = createAsyncThunk(
    'affiliatedasboard/affiliatedashboardthunk',
    async (_, { rejectWithValue }) => {
        try {
            const res = await Affiliatedashboard();
            return res; 
        } catch (error) {
            
            if (error.response && error.response.status === 404) {
                return rejectWithValue({ isNotRegistered: true });
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const createaffiliatedashboardslice = createSlice({
    name: 'affiliatedasboard',
    initialState: {
        items: {},
        isRegistered: false, 
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(affiliatedashboardthunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(affiliatedashboardthunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.isRegistered = true; 
            })
            .addCase(affiliatedashboardthunk.rejected, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload.isNotRegistered) {
                    state.items = {};
                    state.isRegistered = false; 
                    state.error = null; 
                } else {
                    state.error = action.payload || action.error.message;
                    state.isRegistered = false;
                }
            });
    }
});

export default createaffiliatedashboardslice.reducer;