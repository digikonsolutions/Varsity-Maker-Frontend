import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getpatches} from '../../services/patchesandembrservice.jsx';

export const getpatchesthunk = createAsyncThunk(
    'patches/getpatchesthunk',

    async( ) => {
        try {
            const res = await getpatches();
            return res;
        } catch (error) {
            throw error;
        }
    }
);


const getpatchesslice = createSlice({
    name: 'patches',

    initialState: {
        items: [],
        loading: false,
        error: null,
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(getpatchesthunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(getpatchesthunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(getpatchesthunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message; 
            })
    }
});

export default getpatchesslice.reducer;