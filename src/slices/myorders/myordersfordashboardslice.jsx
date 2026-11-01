import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getmyordersbyuser} from '../../services/orderService.jsx';


export const getmyorderbyuserthunk = createAsyncThunk(
    'myordersbyuser/getmyorderbyuserthunk',

    async() => {
      try {
        const res = await getmyordersbyuser();
        return res;
      } catch (error) {
        throw error;
      }
    }
);


const getmyordersbyuserslice = createSlice({
    name: 'myordersbyuser',

    initialState: {
        items : [],
        loading : false,
        error : null
    },

    reducers: {},


    extraReducers: (builder) => {
        builder
            .addCase(getmyorderbyuserthunk.pending, (state) => {
                state.loading = true;
            })

            .addCase(getmyorderbyuserthunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(getmyorderbyuserthunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
});


export default getmyordersbyuserslice.reducer;