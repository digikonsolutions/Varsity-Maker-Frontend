import axios from "axios";
import { baseurl, reviews, replyreview } from "../constants/baseurls.jsx";

async function Addreviewreply({ reviewId, name, reply }) {
  const payload = {
  name: typeof name === "string" ? name : String(name?.name ?? ""),
  reply:
    typeof reply === "string"
      ? reply
      : String(reply?.reply ?? reply ?? ""),
};

  console.log("SEND TO API:", payload);

  const res = await axios.post(
    `${baseurl}${reviews}/${reviewId}${replyreview}`,
    payload
  );

  return res.data;
}
export { Addreviewreply };