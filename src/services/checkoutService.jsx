import axios from "axios";
import { baseurl, orders } from "../constants/baseurls.jsx";
export const placeOrderService = async (payload) => {
  try {
    const token = payload.token;

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await axios.post(
      `${baseurl}${orders}`,
      payload,
      { headers }
    );

    return res.data;

  } catch (error) {
    console.error("Order API Error:", error.response?.data || error.message);
    throw error;
  }
};