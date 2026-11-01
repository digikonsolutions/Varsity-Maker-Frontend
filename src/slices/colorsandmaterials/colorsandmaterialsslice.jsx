import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getcolorsandmaterials} from '../../services/colorsandmaterialservice.jsx';

export const getcolorsandmaterialsthunk = createAsyncThunk(
    'colorsandmaterials/getcolorsandmaterialsthunk',

    async() => {
        const res = await getcolorsandmaterials();
        return res;
    }
);


const colorsandmaterialsslice = createSlice({
    name: 'colorsandmaterials',

    initialState: {
        items: [],
        loading: false,
        error: null
    },
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(getcolorsandmaterialsthunk.pending, (state) => {
                state.loading = true;
            })

            .addCase(getcolorsandmaterialsthunk.fulfilled, (state, action) =>{
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(getcolorsandmaterialsthunk.rejected, (state, action) =>{
                state.loading = false;
                state.error = action.error.message;
            })
    }
});

export default colorsandmaterialsslice.reducer;