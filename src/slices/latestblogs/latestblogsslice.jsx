import react from 'react';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {GetLatestBlogs} from '../../services/blogservice.jsx';


export const getlatestblogsthunk = createAsyncThunk(
    'latestblogs/getlatestblogsthunk',

    async() =>{
        const res = await GetLatestBlogs();
        return res.data;
    }
);

const getlatestblogsslice = createSlice({
    name: 'latestblogs',
    initialState: {
        items: [],
        loading: false,
        error : null,
    },

    reducers: {},

    extraReducers : (builder) => {
        builder 
            .addCase(getlatestblogsthunk.pending, (state) => {
                state.loading = true;
            })

            .addCase(getlatestblogsthunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(getlatestblogsthunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
})


export default getlatestblogsslice.reducer;