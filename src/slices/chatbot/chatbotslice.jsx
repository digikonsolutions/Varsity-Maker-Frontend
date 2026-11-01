import { createSlice } from "@reduxjs/toolkit";
import { chatbot } from "../../services/chatbotservice.jsx";


const WELCOME_MESSAGES = [
  "Hi there! 👋 I'm **Zara**, your personal shopping assistant. What are you looking for today?",
  "Welcome! 😊 I'm Zara — here to help you find the perfect product. Just ask me anything!",
  "Hello! 👋 I'm Zara, your shopping assistant. Let me know what you need!",
];

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState: {
    open:     false,
    messages: [
      {
        role:              "bot",
        text:              WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)],
        product:           null,
        show_product_card: false,
        reviews:           [],
        policy_links:      {},
      }
    ],  
    loading:  false,
    error:    null,
  },
  reducers: {
    toggleChat(state) {
      state.open = !state.open;
    },

    addUserMessage(state, action) {
      state.messages.push({
        role:              "user",
        text:              action.payload,
        product:           null,
        show_product_card: false,
        reviews:           [],
      });
    },

    addBotMessage(state, action) {
      const p = action.payload || {};
      state.messages.push({
        role:                "bot",
        text:                p.reply               || "",
        product:             p.product             ?? null,
        show_product_card:   Boolean(p.show_product_card),
        category_name:       p.category_name       || null,
        total_products:      p.total_products       || null,
        upsell_products:     Array.isArray(p.upsell_products)     ? p.upsell_products     : [],
        cross_sell_products: Array.isArray(p.cross_sell_products) ? p.cross_sell_products : [],
        // Top-level reviews (for review_query intent) — also embedded in each product object
        reviews:             Array.isArray(p.reviews)             ? p.reviews             : [],
        intent:              p.intent              || null,
        policy_links:        p.policy_links        || {},
      });
    },

    setLoading(state, action) { state.loading = action.payload; },
    setError(state, action)   { state.error   = action.payload; },
  },
});

export const {
  toggleChat, addUserMessage, addBotMessage, setLoading, setError,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;

// ── THUNK ─────────────────────────────────────────────────────────
export function sendChatMessage(message, session_id = "session_1") {
  return async (dispatch) => {
    dispatch(addUserMessage(message));
    dispatch(setLoading(true));
    try {
      const data = await chatbot(message, session_id);
      dispatch(addBotMessage(data));
    } catch (err) {
      dispatch(addBotMessage({
        reply:             "Sorry, I couldn't connect right now. Please try again!",
        product:           null,
        show_product_card: false,
        reviews:           [],
      }));
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
}