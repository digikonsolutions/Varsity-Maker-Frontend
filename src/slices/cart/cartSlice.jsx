import { createSlice } from "@reduxjs/toolkit";

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch (e) {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

const initialState = {
  items: loadCart(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;

      const id = product.id || product._id;

      const existing = state.items.find(
        (item) => (item.id || item._id) === id
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          ...product,
          id,
          quantity: 1,
          selectedSize: product.selectedSize || "M",
        });
      }

      saveCart(state.items);
    },

    removeFromCart: (state, action) => {
      const id = action.payload;

      state.items = state.items.filter(
        (item) => (item.id || item._id) !== id
      );

      saveCart(state.items);
    },

    increaseQty: (state, action) => {
      const id = action.payload;

      const item = state.items.find(
        (item) => (item.id || item._id) === id
      );

      if (item) item.quantity += 1;

      saveCart(state.items);
    },

    decreaseQty: (state, action) => {
      const id = action.payload;

      const item = state.items.find(
        (item) => (item.id || item._id) === id
      );

      if (!item) return;

      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.items = state.items.filter(
          (item) => (item.id || item._id) !== id
        );
      }

      saveCart(state.items);
    },

    updateSize: (state, action) => {
      const { id, size } = action.payload;

      const item = state.items.find(
        (item) => (item.id || item._id) === id
      );

      if (item) {
        item.selectedSize = size;
      }

      saveCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("cart");
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQty,
  decreaseQty,
  clearCart,
  updateSize,
} = cartSlice.actions;

export default cartSlice.reducer;