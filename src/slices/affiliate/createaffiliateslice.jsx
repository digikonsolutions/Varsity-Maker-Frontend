import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {CreateAffiliate} from '../../services/affiliateservices.jsx';

export const createaffiliateThunk  = createAsyncThunk(
    'createaffiliate/createaffiliateThunk',

    async({data}, {rejectWithValue}) => {
        try {
            const res = await CreateAffiliate(data);
            return res;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const createaffiliateslice = createSlice({
    name: 'createaffiliate',
    initialState: {
        items: [],
        loading: false,
        error: null
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(createaffiliateThunk.pending, (state) => {
                state.loading = true;
            })

            .addCase(createaffiliateThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(createaffiliateThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })


    }
});

export default createaffiliateslice.reducer;