import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getsubmittedreviews} from '../../services/reviewsservice.jsx';

export const getsubmittedreviewthunk = createAsyncThunk(
    'getsubmittedreviews/getsubmittedreviewthunk', 
    async(id, {rejectWithValue}) => {
        try {
            const res = await getsubmittedreviews(id);
            return res;        
        } catch (error) {
            return rejectWithValue(
                "Something went Wrong"
            )
        }
    }
);

const createsubmittedreviewslice = createSlice({
    name: 'getsubmittedreviews', 
    initialState: {
        loading: false, 
        item: null, 
        error: null,
    },

    reducers: {},

    extraReducers : (builder) => {
        builder.
            addCase(getsubmittedreviewthunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            });

            addCase(getsubmittedreviewthunk.fulfilled, (state, action) => {
                state.loading = false;
                state.item = action.payload.data;
            });

            addCase(getsubmittedreviewthunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export default createsubmittedreviewslice.reducer;