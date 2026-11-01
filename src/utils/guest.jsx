export const getGuestId = () => {
  let guestId = localStorage.getItem("guest_id");

  if (!guestId) {
    guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("guest_id", guestId);
  }

  return guestId;
};