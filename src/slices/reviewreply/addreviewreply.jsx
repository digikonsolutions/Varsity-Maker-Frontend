import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Addreviewreply} from '../../services/reviewreplyservices.jsx';

export const Addreviewreplythunk = createAsyncThunk(
  "addreviewreply/Addreviewreplythunk",
  async ({ reviewId, name, replyText }, { rejectWithValue }) => {
    try {
      const res = await Addreviewreply({
        reviewId : reviewId,
        name : name,
        reply: replyText, 
      });

      return res;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Error");
    }
  }
);

const createaddreviewreplyslice = createSlice({
  name: "addreviewreply",

  initialState: {
    loading: false,
    item: null,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(Addreviewreplythunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(Addreviewreplythunk.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload?.data;
      })

      .addCase(Addreviewreplythunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


export default createaddreviewreplyslice.reducer;