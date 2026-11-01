import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SchoolRegistrationForm.css";
import { FaArrowRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {submitSchoolRegistration} from "../slices/schoolregistration/schoolregistrationslice.jsx";
import Swal from "sweetalert2";
import { useEffect } from "react";

const SchoolRegistrationForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const {
  loading,
  success,
  error,
} = useSelector(
  (state) => state.schoolRegistration
);
  
  // Form States
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    city: "",
    phone: "",
    schoolName: "",
    role: "",
    stateRegion: "",
    interest: "",
  });
  
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
  if (e.target.files.length > 0) {
    setSelectedFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  }
};

 const handleSubmit = async (e) => {
  e.preventDefault();

  let tempErrors = {};

  if (!formData.email)
    tempErrors.email = "Please complete this required field.";

  if (!formData.firstName)
    tempErrors.firstName = "Please complete this required field.";

  if (!formData.lastName)
    tempErrors.lastName = "Please complete this required field.";

  if (!formData.schoolName)
    tempErrors.schoolName = "Please complete this required field.";

  if (!formData.role)
    tempErrors.role = "Selection required.";

  setErrors(tempErrors);

  if (Object.keys(tempErrors).length > 0) return;

  const payload = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    payload.append(key, value);
  });

  if (selectedFile) {
    payload.append("jacketImage", selectedFile);
  }

  dispatch(submitSchoolRegistration(payload));
};

useEffect(() => {
  if (success) {
    Swal.fire({
      icon: "success",
      title: "Registration Successful!",
      text: "Your school has been registered successfully.",
      confirmButtonText: "Awesome",
      confirmButtonColor: "#caa35a",
      background: "#fff",
      color: "#0f172a",
    });

    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      city: "",
      phone: "",
      schoolName: "",
      role: "",
      stateRegion: "",
      interest: "",
    });

    setSelectedFile(null);
    setFileName("");
  }
}, [success]);

  return (
    <div className="collections-page registration-gate-page">
      
      {/* SECTION 1: BREADCRUMB & HEADER */}
      <header className="form-hero-header">
        <div className="container-luxury">
          <nav className="luxury-breadcrumb">
            <span onClick={() => navigate("/")} className="breadcrumb-link">Home</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">School Registration Form</span>
          </nav>
          
          <div className="section-title-wrapper-left">
            <span className="gold-mini-tag">COACHES & ATHLETES</span>
            <h1 className="luxury-section-title large-title">School Registration</h1>
          </div>
        </div>
      </header>

      {/* SECTION 2: LUXURY FORM ENTRY */}
      <section className="form-body-section">
        <div className="container-luxury-narrow">
          <form onSubmit={handleSubmit} className="premium-luxury-form">
            
            <div className="form-editorial-intro">
              <h2>Join The House. <br /><span className="serif-gold-text">Institutional Enrollment.</span></h2>
              <p>Register your academic organization below to unlock custom high-density embroidery arrays, tailored varsity cuts, and automated program vaults.</p>
            </div>

            {/* Row 1: Email (Full Width) */}
            <div className="form-group full-width">
              <label className="lux-form-label">EMAIL ADDRESS *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange}
                className={`lux-form-input ${errors.email ? "has-error" : ""}`}
                placeholder="Enter your institutional email"
              />
              {errors.email && <span className="lux-error-text">{errors.email}</span>}
            </div>

            {/* Row 2: First Name & Last Name Split */}
            <div className="form-row-split">
              <div className="form-group">
                <label className="lux-form-label">FIRST NAME *</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange}
                  className={`lux-form-input ${errors.firstName ? "has-error" : ""}`}
                />
                {errors.firstName && <span className="lux-error-text">{errors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label className="lux-form-label">LAST NAME *</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange}
                  className={`lux-form-input ${errors.lastName ? "has-error" : ""}`}
                />
                {errors.lastName && <span className="lux-error-text">{errors.lastName}</span>}
              </div>
            </div>

            {/* Row 3: School Name & City Split */}
            <div className="form-row-split">
              <div className="form-group flex-2">
                <label className="lux-form-label">NAME OF YOUR SCHOOL *</label>
                <input 
                  type="text" 
                  name="schoolName" 
                  placeholder="EX. MONTE VISTA HIGH SCHOOL"
                  value={formData.schoolName} 
                  onChange={handleInputChange}
                  className={`lux-form-input ${errors.schoolName ? "has-error" : ""}`}
                />
                {errors.schoolName && <span className="lux-error-text">{errors.schoolName}</span>}
              </div>

              <div className="form-group">
                <label className="lux-form-label">CITY OF SCHOOL *</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange}
                  className="lux-form-input"
                />
              </div>
            </div>

            {/* Row 4: Phone & State Split */}
            <div className="form-row-split">
              <div className="form-group">
                <label className="lux-form-label">PHONE NUMBER</label>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone} 
                  onChange={handleInputChange}
                  className="lux-form-input"
                />
              </div>

              <div className="form-group">
                <label className="lux-form-label">STATE / REGION *</label>
                <input 
                  type="text" 
                  name="stateRegion" 
                  value={formData.stateRegion} 
                  onChange={handleInputChange}
                  className="lux-form-input"
                />
              </div>
            </div>

            {/* Row 5: Role Selector (I AM A...) - Premium Radio Grid */}
            <div className="form-group full-width spacing-top">
              <label className="lux-form-label">I AM A ... *</label>
              <div className="lux-radio-grid">
                {["Parent", "Student", "Coach"].map((roleOption) => (
                  <label key={roleOption} className={`lux-radio-tile ${formData.role === roleOption ? "is-selected" : ""}`}>
                    <input 
                      type="radio" 
                      name="role" 
                      value={roleOption} 
                      checked={formData.role === roleOption}
                      onChange={handleInputChange} 
                    />
                    <span className="tile-indicator"></span>
                    <span className="tile-text">{roleOption.toUpperCase()}</span>
                  </label>
                ))}
              </div>
              {errors.role && <span className="lux-error-text">{errors.role}</span>}
            </div>

            {/* Row 6: Dropdown Selector (Interested in) */}
            <div className="form-group full-width spacing-top">
              <label className="lux-form-label">INTERESTED IN *</label>
              <div className="lux-select-wrapper">
                <select name="interest" value={formData.interest} onChange={handleInputChange} className="lux-form-select">
                  <option value="">Select your structural alignment preference</option>
                  <option value="Letterman Jacket">Letterman Jacket Master Series</option>
                  <option value="Team Store For ASB">Team Store For ASB</option>
                  <option value="Team Store For Coaches">Team Store For Coaches Exclusive</option>
                </select>
              </div>
            </div>

            {/* Row 7: Premium File Upload */}
            <div className="form-group full-width spacing-top">
              <label className="lux-form-label">UPLOAD PHOTO OF YOUR SCHOOL'S LETTERMAN JACKET</label>
              <div className="lux-file-dropzone">
                <input type="file" id="jacket-upload" accept="image/*" onChange={handleFileChange} className="hidden-file-input" />
                <label htmlFor="jacket-upload" className="dropzone-trigger">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                  </svg>
                  <span className="upload-prompt">{fileName ? fileName : "ATTACH INSIGNIA REFERENCE IMAGE"}</span>
                  <span className="upload-subprompt">PNG, JPG up to 10MB</span>
                </label>
              </div>
            </div>

            {/* Submit Block */}
            <div className="form-submit-wrapper">
              <button type="submit" className="btn-luxury-primary-dark form-submit-btn"  disabled={loading}>
                {loading ? "Submitting..." : "Submit Registration"}
               
              </button>
            </div>

          </form>
        </div>
      </section>

    </div>
  );
};

export default SchoolRegistrationForm;