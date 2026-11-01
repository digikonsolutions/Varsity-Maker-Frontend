import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendcontactmessage } from '../../services/contactmessagesservice.jsx';

export const contactsendmessageThunk = createAsyncThunk(
  'contact/send',
  async (data, { rejectWithValue }) => {
    try {
      const res = await sendcontactmessage(
        data.firstname,
        data.lastname,
        data.email,
        data.message,
        data.agree,
        data.consent
      );

      return res;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Something went wrong"
      );
    }
  }
);

const contactSlice = createSlice({
  name: 'contact',
  initialState: {
    loading: false,
    success: false,
    error: null,
    data: null,
  },

  reducers: {
    resetContactState: (state) => {
      state.success = false;
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(contactsendmessageThunk.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(contactsendmessageThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(contactsendmessageThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
    });
  }
});

export const { resetContactState } = contactSlice.actions;
export default contactSlice.reducer;