import axios from "axios";
import {aiautomationsbaseurl, chat} from '../constants/baseurls.jsx';


export async function chatbot(message, session_id) {
  try {
    console.log("→ Sending:", { message, session_id });

    const response = await axios.post(
      `${aiautomationsbaseurl}${chat}`,
      { message, session_id },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    console.log("← Response:", response.data);

    // Backend wraps in { data: { reply, product, ... } }
    // Support both { data: {...} } and flat {...}
    const d = response.data?.data ?? response.data;

    if (!d) {
      return _fallback("Empty response from server.");
    }

    return {
      reply:              d.reply              || "I'm here to help! 😊",
      product:            d.product            ?? null,
      show_product_card:  d.show_product_card  === true,
      category_name:      d.category_name      || null,
      total_products:     d.total_products     || null,
      upsell_products:    Array.isArray(d.upsell_products)    ? d.upsell_products    : [],
      cross_sell_products:Array.isArray(d.cross_sell_products)? d.cross_sell_products: [],
      // Reviews can come top-level OR embedded inside each product
      reviews:            Array.isArray(d.reviews)            ? d.reviews            : [],
      intent:             d.intent             || null,
      policy_links:       d.policy_links       || {},
    };

  } catch (error) {
    console.error("Chatbot error:", error);

    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      return _fallback("❌ Cannot connect to server. Is the backend running on port 9000?");
    }
    if (error.response) {
      console.error("Server error body:", JSON.stringify(error.response.data, null, 2));
      return _fallback(`Server error ${error.response.status}. Please try again.`);
    }
    if (error.request) {
      return _fallback("📡 No response from server. Check your connection.");
    }
    return _fallback("⚠️ Something went wrong. Please try again!");
  }
}

function _fallback(msg) {
  return {
    reply:               msg,
    product:             null,
    show_product_card:   false,
    category_name:       null,
    total_products:      null,
    upsell_products:     [],
    cross_sell_products: [],
    reviews:             [],
    intent:              "error",
    policy_links:        {},
  };
}