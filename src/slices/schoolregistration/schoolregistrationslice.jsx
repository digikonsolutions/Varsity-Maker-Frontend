import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSchoolRegistration } from "../../services/schoolRegistrationService.jsx";

export const submitSchoolRegistration = createAsyncThunk(
  "schoolRegistration/submit",
  async (formData, thunkAPI) => {
    try {
      return await createSchoolRegistration(formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

const schoolRegistrationSlice = createSlice({
  name: "schoolRegistration",

  initialState: {
    loading: false,
    success: false,
    data: null,
    error: null,
  },

  reducers: {
    resetSchoolRegistrationState: (state) => {
      state.loading = false;
      state.success = false;
      state.data = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(submitSchoolRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(submitSchoolRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
      })

      .addCase(submitSchoolRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSchoolRegistrationState } =
  schoolRegistrationSlice.actions;

export default schoolRegistrationSlice.reducer;