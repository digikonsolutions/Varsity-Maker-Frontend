import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchproductsAPI } from "../../services/productService.jsx";

export const fetchproducts = createAsyncThunk(
  "products/fetchproducts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchproductsAPI();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],       
    loading: false,
    error: null
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchproducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchproducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })

      .addCase(fetchproducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export default productSlice.reducer;