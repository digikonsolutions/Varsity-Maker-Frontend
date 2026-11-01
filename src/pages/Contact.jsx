import "./contact.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { contactsendmessageThunk, resetContactState } from "../slices/sendmessage/sendcontactmessageslics.jsx";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Contact() {

    const dispatch = useDispatch();

const { loading, success, error } = useSelector(
  (state) => state.contact
);

const [formData, setFormData] = useState({
  firstname: "",
  lastname: "",
  email: "",
  message: "",
  agree: false,
  consent: false,
});

 const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setFormData({
    ...formData,
    [name]: type === "checkbox" ? checked : value,
  });
};
const handleSubmit = (e) => {
  e.preventDefault();

  if (!formData.agree || !formData.consent) {
    toast.error("Please accept both checkboxes");
    return;
  }

  dispatch(contactsendmessageThunk(formData));
};

useEffect(() => {
  if (success) {
    toast.success("Message sent successfully 🚀");

    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      message: "",
      agree: false,
      consent: false,
    });

    dispatch(resetContactState());
  }

  if (error) {
    toast.error(error?.message || "Something went wrong ❌");
  }
}, [success, error]);



  return (
    <div className="contact-page">
      {/* HERO SECTION */}
      <div className="contact-hero">
        <span className="badge">WRITE TO US</span>
        <h1>Get In Touch</h1>
      </div>

      {/* MAIN SECTION */}
      <div className="contact-container">
        {/* LEFT FORM */}
        <div className="contact-card contact-form-box">
          <h2>Let’s Talk!</h2>
          <p className="subtitle">
            Get in touch with us using the enquiry form or contact details below.
          </p>

         <form className="contact-form" onSubmit={handleSubmit}>
  <div className="form-row">
    <div className="input-group">
      <input
        type="text"
        name="firstname"
        placeholder="First Name"
        value={formData.firstname}
        onChange={handleChange}
        required
      />
    </div>

    <div className="input-group">
      <input
        type="text"
        name="lastname"
        placeholder="Last Name"
        value={formData.lastname}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  <div className="input-group">
    <input
      type="email"
      name="email"
      placeholder="Email Address"
      value={formData.email}
      onChange={handleChange}
      required
    />
  </div>

  <div className="input-group">
    <textarea
      name="message"
      placeholder="Your Message"
      rows="5"
      value={formData.message}
      onChange={handleChange}
      required
    />
  </div>

  <div className="checkboxes">
  <label className="checkbox-container">
    <input
      type="checkbox"
      name="agree"
      checked={formData.agree}
      onChange={handleChange}
    />
    <span className="checkmark"></span>
    I agree to receive messages.*
  </label>

  <label className="checkbox-container">
    <input
      type="checkbox"
      name="consent"
      checked={formData.consent}
      onChange={handleChange}
    />
    <span className="checkmark"></span>
    I give consent to store data.*
  </label>
</div>

  <button type="submit" className="submit-btn" disabled={loading}>
    {loading ? "Sending..." : "Send Message"}
  </button>
</form>
        </div>

        {/* RIGHT INFO */}
        <div className="contact-card contact-info-box">
          <div className="info-header">
            <h2>Our Details</h2>
            <p className="subtitle">Reach out directly via phone, email, or visit our headquarters.</p>
          </div>

          <div className="contact-info-grid">
            <div className="info-box">
              <div className="icon-wrapper"> <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: "18px" }}/></div>
              <div className="info-content">
                <h4>Quick Contact</h4>
                <p>info@example.com</p>
              </div>
            </div>

            <div className="info-box">
              <div className="icon-wrapper"> <FontAwesomeIcon icon={faPhone} style={{ fontSize: "18px" }}/></div>
              <div className="info-content">
                <h4>Phone Number</h4>
                <p>+43 123 456 789</p>
                <p>+1 999 888 777</p>
              </div>
            </div>

            <div className="info-box">
              <div className="icon-wrapper"> <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: "18px" }} /></div>
              <div className="info-content">
                <h4>Headquarter</h4>
                <p>Vienna, Austria</p>
              </div>
            </div>
          </div>

          {/* Symmetrical design piece / Minimalist texture */}
          <div className="info-footer-accent">
            <div className="gold-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
}