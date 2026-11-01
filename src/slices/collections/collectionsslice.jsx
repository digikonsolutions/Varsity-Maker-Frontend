import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {fetchallcollections} from '../../services/collectionservices.jsx';

export const fetchcollections = createAsyncThunk(
    'collections/fetchallcollections',
    async () => {
        const data = await fetchallcollections();
        return data;
    }
);

const collectionsslice = createSlice({
    name: 'collections',
    initialState : {
        items : [],
        loading: false,
        error : null
    },
    reducers: {},

   extraReducers: (builder) => {
    builder
        .addCase(fetchcollections.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchcollections.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
        })
        .addCase(fetchcollections.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
}
});

export default collectionsslice.reducer;

