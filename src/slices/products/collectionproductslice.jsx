import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchproductsAPIbyslug } from '../../services/productService.jsx';

export const fetchCollectionProductsBySlug = createAsyncThunk(
    "collectionProducts/fetchBySlug",
    async (slug, { rejectWithValue }) => {
        try {
            const data = await fetchproductsAPIbyslug(slug);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const collectionproductsSlice = createSlice({
    name: 'collectionProducts',
    initialState: {
        items: [],
        collection: null,
        loading: false,
        error: null
    },
    reducers: {
        clearCollectionState: (state) => {
            state.items = [];
            state.collection = null;
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchCollectionProductsBySlug.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCollectionProductsBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.collection = action.payload.collection;
            })
            .addCase(fetchCollectionProductsBySlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    }
});

export const { clearCollectionState } = collectionproductsSlice.actions;

export default collectionproductsSlice.reducer;