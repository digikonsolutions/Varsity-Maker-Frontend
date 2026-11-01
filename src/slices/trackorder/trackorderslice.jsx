import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {trackmyorder} from '../../services/trackorder.jsx';

export const trackmyorderThunk = createAsyncThunk(
    'trackorder/trackmyorderThunk',

    async({trackingnumber}, {rejectWithValue}) => {
        try {
            const res = await trackmyorder(trackingnumber);
            return res;
        } catch (error) {
            throw error;
        }
    }
);


const trackorderslice = createSlice({
    name: 'trackorder',

    initialState: {
        items: [],
        loading : false,
        error: null,
    },

    reducers : {},

    extraReducers: (builder) => {
        builder
            .addCase(trackmyorderThunk.pending, (state) => {
                state.loading = true;
            })

            .addCase(trackmyorderThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(trackmyorderThunk.rejected, (state, action) => {
                state.loading = false;
                state.error =  action.error.message;
            });

    }
})

export default trackorderslice.reducer;