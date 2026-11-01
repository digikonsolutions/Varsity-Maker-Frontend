import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitreview } from "../../services/reviewsservice.jsx";

export const SubmitreviewAPI = createAsyncThunk(
  'submitreview/submit',
  async ({ id, name, email, comment, rating }, { rejectWithValue }) => {
    try {
      const data = await submitreview(id, comment, rating, name, email);
      return data;                 // ab yeh real data hai
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Review submit failed"
      );
    }
  }
);

const ReviewsubmitSlice = createSlice({
  name: "submitreview",

  initialState: {
    loading: false,
    item: null,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(SubmitreviewAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(SubmitreviewAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload;
      })

      .addCase(SubmitreviewAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ReviewsubmitSlice.reducer;