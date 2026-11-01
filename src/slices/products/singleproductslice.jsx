import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {fetchsingleproductAPIbyid} from '../../services/productService.jsx';

export const fetchsingleproduct = createAsyncThunk(
    'singleproduct/fetchsingleproduct',

    async(id, {rejectWithValue}) => {
        try {
            const data = await fetchsingleproductAPIbyid(id);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const singleProductSlice = createSlice({
    name: 'singleproduct', 
    initialState: {
        item: null, 
        loading: false, 
        error: null
    }, 
    reducers: {},

    extraReducers: (builder) => {
        builder

            .addCase(fetchsingleproduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchsingleproduct.fulfilled, (state, action) => {
                state.loading = false;
                state.item = action.payload.data;
            })

            .addCase(fetchsingleproduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.error;
            })
    }
});

export default singleProductSlice.reducer;