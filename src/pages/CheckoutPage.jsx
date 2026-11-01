  import React, { useState, useMemo } from 'react';
  import './CheckoutPage.css';
  import {useSelector, useDispatch} from 'react-redux';
  import {storageurl} from '../constants/baseurls.jsx';
  import {useNavigate} from 'react-router-dom';
  import {placeOrderService } from '../services/checkoutService.jsx';
  import {clearCart } from '../slices/cart/cartSlice.jsx';
  import { ToastContainer, toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { getGuestId } from "../utils/guest.jsx";

  const ALL_US_STATES = {
    "Alabama": 0.04, "Alaska": 0.00, "Arizona": 0.056, "Arkansas": 0.065, "California": 0.0725,
    "Colorado": 0.029, "Connecticut": 0.0635, "Delaware": 0.00, "Florida": 0.06, "Georgia": 0.04,
    "Hawaii": 0.04, "Idaho": 0.06, "Illinois": 0.0625, "Indiana": 0.07, "Iowa": 0.06,
    "Kansas": 0.065, "Kentucky": 0.06, "Louisiana": 0.0445, "Maine": 0.055, "Maryland": 0.06,
    "Massachusetts": 0.0625, "Michigan": 0.06, "Minnesota": 0.06875, "Mississippi": 0.07, "Missouri": 0.04225,
    "Montana": 0.00, "Nebraska": 0.055, "Nevada": 0.0685, "New Hampshire": 0.00, "New Jersey": 0.06625,
    "New Mexico": 0.05125, "New York": 0.04, "North Carolina": 0.0475, "North Dakota": 0.05, "Ohio": 0.0575,
    "Oklahoma": 0.045, "Oregon": 0.00, "Pennsylvania": 0.06, "Rhode Island": 0.07, "South Carolina": 0.06,
    "South Dakota": 0.045, "Tennessee": 0.07, "Texas": 0.0625, "Utah": 0.061, "Vermont": 0.06,
    "Virginia": 0.053, "Washington": 0.065, "West Virginia": 0.06, "Wisconsin": 0.05, "Wyoming": 0.04
  };

  const COMPREHENSIVE_ADDRESSES = [
    { full: "123 Los Angeles St, Los Angeles, California, 90001", city: "Los Angeles", state: "California", zip: "90001", street: "123 Los Angeles St" },
    { full: "789 Broadway, New York, New York, 10003", city: "New York", state: "New York", zip: "10003", street: "789 Broadway" },
    { full: "456 Houston Ave, Houston, Texas, 77001", city: "Houston", state: "Texas", zip: "77001", street: "456 Houston Ave" },
    { full: "555 Miami Beach Blvd, Miami, Florida, 33139", city: "Miami", state: "Florida", zip: "33139", street: "555 Miami Beach Blvd" },
    { full: "222 Michigan Ave, Chicago, Illinois, 60601", city: "Chicago", state: "Illinois", zip: "60601", street: "222 Michigan Ave" }
  ];

  export default function CheckoutPage() {
    const cartItems = useSelector((state) => state.cart.items);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [subscribe, setSubscribe] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");
    
    const [addressInput, setAddressInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [city, setCity] = useState("");
    const [selectedState, setSelectedState] = useState("California");
    const [zipCode, setZipCode] = useState("");
    const [phone, setPhone] = useState("");

    const [shippingMethod, setShippingMethod] = useState("standard");
    const [orderNotes, setOrderNotes] = useState("");

    const filteredSuggestions = useMemo(() => {
      if (!addressInput.trim()) return [];
      return COMPREHENSIVE_ADDRESSES.filter(addr => 
        addr.full.toLowerCase().includes(addressInput.toLowerCase())
      );
    }, [addressInput]);

    const handleSelectAddress = (addr) => {
      setAddressInput(addr.street);
      setCity(addr.city);
      setSelectedState(addr.state);
      setZipCode(addr.zip);
      setShowSuggestions(false);
    };

  const financials = useMemo(() => {
    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const taxRate = ALL_US_STATES[selectedState] || 0.0;

    let baseShippingCost = 0;
    if (shippingMethod === "standard") baseShippingCost = 0.0;
    if (shippingMethod === "expedited_3day") baseShippingCost = 25.0;
    if (shippingMethod === "expedited_2day") baseShippingCost = 45.0;

    const shippingCost = baseShippingCost * (1 + taxRate);
    const estimatedTax = subtotal * taxRate;

    const total = subtotal + shippingCost;

    return { subtotal, shippingCost, estimatedTax, total };
  }, [cartItems, selectedState, shippingMethod]);

    const dispatch = useDispatch();

    const formattedItems = cartItems.map(item => ({
    product_id: item.id,
    product_name: item.name,
    price: Number(item.price),
    quantity: item.quantity,
  }));



  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    try {
      const res = await placeOrderService({
        items: formattedItems,
        token: localStorage.getItem("token") || null,
        user: JSON.parse(localStorage.getItem("user") || "null"),
        guest_id: getGuestId(),
        email,
        address: {
          name: firstName + " " + lastName,
          phone,
          address: addressInput,
          city,
          postal_code: zipCode,
        },
        financials,
        ref_code: localStorage.getItem('ref_code') || null,
      });
      console.log(res);
      localStorage.setItem("tracking_number", res.tracking_number);

      toast.success(`Order Placed 🎉 Tracking: ${res.tracking_number}`);

      dispatch(clearCart());
      localStorage.removeItem('ref_code');


      navigate(`/thank-you/${res.order_id}`);

    } catch (err) {
      console.log(err);
      toast.error("Order failed");
    }
  };

    return (
      <div className="checkoutContainer">
        <form className="checkoutLayout" onSubmit={handleSubmitOrder} >
          
          <div className="checkoutFormSide">

            <section className="formSection"> Complete Order & Book Shipment
              <div className="sectionHeader">
                <h2>Contact Info</h2>
                <button onClick={() => navigate('/login')} type="button" className="inlineSignInBtn">Log In</button>
              </div>
              <div className="floatingInputGroup">
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                />
                <label>Email Address</label>
              </div>
              <label className="checkboxLabel">
                <input 
                  type="checkbox" 
                  checked={subscribe} 
                  onChange={(e) => setSubscribe(e.target.checked)} 
                />
                <span className="customCheckText">Keep me updated on exclusive releases and offers</span>
              </label>
            </section>

            <section className="formSection">
              <h2>Shipping Address</h2>
              
              <div className="floatingInputGroup">
                <select 
                  value={selectedCountry} 
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="United States">United States</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
                <label>Country/Region</label>
              </div>

              <div className="inputRow">
                <div className="floatingInputGroup">
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder=" " required />
                  <label>First name</label>
                </div>
                <div className="floatingInputGroup">
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder=" " required />
                  <label>Last name</label>
                </div>
              </div>

              <div className="floatingInputGroup addressInputContainer">
                <input 
                  type="text" 
                  value={addressInput} 
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    setShowSuggestions(true);
                  }} 
                  placeholder=" "
                  onFocus={() => setShowSuggestions(true)}
                  required
                />
                <label>Street Address</label>
                <span className="searchIconHint">🔍</span>
                
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <ul className="addressAutocompleteDropdown">
                    {filteredSuggestions.map((addr, idx) => (
                      <li key={idx} onClick={() => handleSelectAddress(addr)}>
                        <div className="addrSugIcon">📍</div>
                        <div className="addrSugText">{addr.full}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="inputGrid3">
                <div className="floatingInputGroup">
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder=" " required />
                  <label>City</label>
                </div>
                
                <div className="floatingInputGroup">
                  <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} required>
                    {Object.keys(ALL_US_STATES).map(stateName => (
                      <option key={stateName} value={stateName}>{stateName}</option>
                    ))}
                  </select>
                  <label>State / Province</label>
                </div>

                <div className="floatingInputGroup">
                  <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder=" " required />
                  <label>ZIP / Postal code</label>
                </div>
              </div>

              <div className="floatingInputGroup">
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder=" " required />
                <label>Phone Number</label>
                <span className="infoIconHint">🛈</span>
              </div>
            </section>

            <section className="formSection">
              <h2>Shipping Method</h2>
              <p className="shippingDisclaimer">A 10% restocking fee applies to returns of two or more custom jackets.</p>
              
              <div className="shippingOptionsList">
                <label className={`shippingRow ${shippingMethod === 'standard' ? 'activeRow' : ''}`}>
                  <input type="radio" name="shipping" checked={shippingMethod === "standard"} onChange={() => setShippingMethod("standard")} />
                  <div className="shippingRowDetails">
                    <span className="shipTitle">Standard Courier Ground Shipping</span>
                    <span className="shipPrice">FREE</span>
                  </div>
                </label>

                <label className={`shippingRow ${shippingMethod === 'expedited_3day' ? 'activeRow' : ''}`}>
                  <input type="radio" name="shipping" checked={shippingMethod === "expedited_3day"} onChange={() => setShippingMethod("expedited_3day")} />
                  <div className="shippingRowDetails">
                    <span className="shipTitle">Expedited 3-Day Air Drop Saver</span>
                    <span className="shipPrice">
                      {`$${(25.00 * (1 + (ALL_US_STATES[selectedState] || 0))).toFixed(2)}`}
                    </span>
                  </div>
                </label>

                <label className={`shippingRow ${shippingMethod === 'expedited_2day' ? 'activeRow' : ''}`}>
                  <input type="radio" name="shipping" checked={shippingMethod === "expedited_2day"} onChange={() => setShippingMethod("expedited_2day")} />
                  <div className="shippingRowDetails">
                    <span className="shipTitle">Priority 2-Day Dedicated Air Cargo</span>
                    <span className="shipPrice">
                      {`$${(45.00 * (1 + (ALL_US_STATES[selectedState] || 0))).toFixed(2)}`}
                    </span>
                  </div>
                </label>
              </div>
            </section>

            <section className="formSection">
              <h2>Order Notes & Instructions</h2>
              <div className="floatingInputGroup textareaGroup">
                <textarea 
                  value={orderNotes} 
                  onChange={(e) => setOrderNotes(e.target.value)} 
                  placeholder=" "
                  rows="3"
                />
                <label>Special instructions for delivery (Optional)</label>
              </div>
            </section>

            <footer className="checkoutFormFooter">
              <button type="submit" className="mainPayNowBtn">Complete Order & Book Shipment</button>
              <div className="footerPolicies">
                <a href="/refund-policy">Refund Policy</a>
                <a href="/terms-and-conditions">Terms & Conditions</a>
                <a href="/privacy-policy">Privacy Policy</a>
              </div>
            </footer>
          </div>

          <div className="checkoutSummarySide">
            <div className="stickySummaryWrapper">
              
            {cartItems.map((item) => (
    <div className="productRowSummary" key={item.id}>
      <div className="productImgBadgeContainer">
        <img src={`${storageurl}${item.main_image}`} alt="Product" />
        <span className="productQtyCircle">{item.quantity}</span>
      </div>

      <div className="productTitleInfo">
        <p className="pTitleName">{item.name}</p>
        <p className="pSizeLabel">Size Specification: {item.selectedSize || "M"}</p>

      </div>

      <div className="productFinalPrice">
        ${item.price}
      </div>
    </div>
  ))}

              <div className="pricingCalculationsBlock">
                <div className="calcLine">
                  <span>Subtotal Items Cost</span>
                  <span className="calcVal">${financials.subtotal.toFixed(2)}</span>
                </div>
                <div className="calcLine">
                  <span>Shipping & Handlings</span>
                  <span className="calcVal">{financials.shippingCost === 0 ? "FREE" : `$${financials.shippingCost.toFixed(2)}`}</span>
                </div>
              
                
                <div className="calcLine totalLine fontBig">
                  <span className="mainTotalText">Grand Total</span>
                  <span className="mainTotalVal"><span className="currencyCodeLabel">USD</span> ${financials.total.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>

        </form>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }