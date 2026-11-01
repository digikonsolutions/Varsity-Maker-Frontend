import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, addToCart,  decreaseQty, increaseQty, updateSize  } from "../slices/cart/cartSlice.jsx";
import "./CartDrawer.css";
import {storageurl} from '../constants/baseurls.jsx';
import {useNavigate} from 'react-router-dom'

export default function CartDrawer({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((state) => state.cart.items);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );


  
  // Fallback ID selector to ensure correct item removal
  const getItemId = (item) => item.id || item._id;

  return (
    <div className={`cart-overlay ${open ? "show" : ""}`} onClick={onClose}>
      <div
  className="cart-drawer"
  onClick={(e) => e.stopPropagation()}
>

        {/* HEADER */}
        <div className="cart-header">
          <h2>Your Cart <span className="item-count">({items.length})</span></h2>
          <button className="close-btn" onClick={onClose} aria-label="Close Cart">✕</button>
        </div>

        {/* FREE SHIPPING BAR */}
        <div className="cart-banner">
          <p>🎉 FREE shipping will be applied at checkout</p>
        </div>

        {/* ITEMS BODY */}
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-icon">🛒</div>
              <p className="empty-text">Your cart is feeling a bit light!</p>
            </div>
          ) : (
            items.map((item) => {
              const itemId = getItemId(item);
             const sizes = item?.sizes
  ? item.sizes
      .toString()
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [];
              return (
                <div className="cart-item" key={itemId}>
                  <img src={`${storageurl}${item.main_image}`} alt={item.title || item.name} className="cart-img" />

                  <div className="cart-info">
                    <h4 className="item-title">{item.title || item.name}</h4>
                    <div className="size-chips">
  {sizes.map((size) => (
    
    <button
      key={size}
      type="button"
      className={`size-chip ${
        item.selectedSize === size ? "active" : ""
      }`}
      onClick={() =>
        dispatch(updateSize({ id: itemId, size }))
      }
    >
      {size}
    </button>
  ))}
</div>

                    <div className="qty-container">
                     <button
  className="qty-btn"
  onClick={() => dispatch(decreaseQty(itemId))}
>
  -
</button>
                      <span className="qty-number">{item.quantity}</span>
                      <button
  className="qty-btn"
  onClick={() => dispatch(increaseQty(itemId))}
>
  +
</button>
                    </div>
                  </div>

                  <div className="price-tag">
                    $ {item.price.toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="total-row">
              <span>Subtotal</span>
              <span className="total-amount">$ {total.toLocaleString()}</span>
            </div>
            <button
  className="checkout-btn"
  onClick={() => {
    const missingSize = items.find(
      (item) => !item.selectedSize
    );

    if (missingSize) {
      alert("Please select size for all products");
      return;
    }
onClose();
    navigate("/checkout");
  }}
>
  PROCEED TO CHECKOUT
</button>
          </div>
        )}

      </div>
    </div>
  );
}