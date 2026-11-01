import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Getreferral} from '../../services/affiliateservices.jsx';

export const GetRefferalThunk = createAsyncThunk(
    'getrefferal/GetRefferalThunk',

    async(code) =>{
        try {
            const res = await Getreferral(code);
            return res;
        } catch (error) {
            throw error;
        }
    }
);


const creategetrefferalSlice = createSlice({
    name: 'getrefferal',

    initialState: {
        items: [],
        loading:false,
        error: null,
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(GetRefferalThunk.pending, (state) => {
                state.loading = true;
            })

            .addCase(GetRefferalThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(GetRefferalThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});


export default creategetrefferalSlice.reducer;

