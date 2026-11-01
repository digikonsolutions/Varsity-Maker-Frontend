import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {getallblogcategoriesAPI} from '../../services/blogcategoriesservice.jsx';

export const fetchallcategoriesthunk = createAsyncThunk(
    'blogcategories/fetchallcategoriesthunk',

    async () => {
        const res = await getallblogcategoriesAPI();
        return res;
    }
);

const blogcategoriesslice = createSlice({
    name: 'blogcategories', 
    initialState : {
        items : [],
        loading : false,
        error : null,
    },
    reducers: {},

    extraReducers : (builder) =>{
        builder
            .addCase(fetchallcategoriesthunk.pending, (state) => {
               state.loading = true;
            })

            .addCase(fetchallcategoriesthunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(fetchallcategoriesthunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
})

export default blogcategoriesslice.reducer;