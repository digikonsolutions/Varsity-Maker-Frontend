import React, {useState} from "react";
import {useNavigate} from 'react-router-dom';
import "../Css/register.css";
import {useSelector, useDispatch} from 'react-redux';
import {registeruserThunk} from '../../../slices/registeruser/registeruserslice.jsx';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const {loading, items, error} = useSelector((state) => state.userregister);
    const [formData, SetFormData] = useState({
        name: "",
        email : "",
        password: "",
        confirmPassword : "",
    });

    const [validationerror, SetValidationError] = useState("");

    const handlechange = (e) => {
        SetFormData({
            ...formData,
            [e.target.name] : e.target.value,
        });
    }
  
    const handlesubmit = (e) => {
        e.preventDefault();
        SetValidationError("");

        console.log('button clicked');
        if(formData.password !== formData.confirmPassword){
            SetValidationError("Password do not match");
            return;
        }

        dispatch(registeruserThunk({
            name: formData.name,
            email: formData.email,
            password: formData.password
        }));
    }
  
  
  
  
  
  
    return (
    <div className="register-wrapper">
      {/* LEFT SIDE: AUTH FORM */}
      <div className="register-left">
        <div className="register-left-container">
        

          <div className="header-group">
            <h1>Create account</h1>
            <p className="sub-text">
              Already have an account? <span onClick={() => navigate('/login')}>Sign in.</span>
            </p>
          </div>

          {validationerror && <p className="error-text" style={{ color: "red" }}>{validationerror}</p>}
          {error && (
  <p className="error-text" style={{ color: "red" }}>
    {error.message}
  </p>
)}
          {items && <p className="success-text" style={{ color: "green" }}>Account created successfully!</p>}

          <form className="register-form" onSubmit={handlesubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handlechange} placeholder="Enter your name" required />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handlechange} placeholder="Enter your email" required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handlechange} placeholder="••••••••" required />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handlechange} placeholder="••••••••" required />
            </div>

            <div className="register-options">
              <label className="checkbox-container">
                <input type="checkbox" required />
                <span className="checkmark"></span>
                <span className="label-text">I agree to the <span>Terms & Privacy</span></span>
              </label>
            </div>

            <button type="submit" className="btn-primary-register" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>

            <button type="button" className="btn-google">
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
              />
              Sign up with Google
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE: PREMIUM GLASSMORPHISM PANEL */}
      <div className="register-right">
        {/* Crisp abstract dark dashboard geometric pattern background from Unsplash */}
        <div className="background-image-overlay"></div>
        
        <div className="overlay-content">
          <div className="glass-card-wrapper">
            {/* Small Metric Card */}
            <div className="card small-card">
              <div className="card-header">
                <h4>New Users</h4>
                <span className="badge">+8.1%</span>
              </div>
              <h2>12.4k</h2>
              <p className="card-meta">Active this month</p>
            </div>

            {/* Simulated Analytics / Graph Card */}
            <div className="card graph-card">
              <div className="graph-header">
                <h4>Growth Rate</h4>
                <div className="graph-legend">
                  <span className="dot dot-gold"></span> Live Data
                </div>
              </div>
              <div className="graph-visual">
                <svg viewBox="0 0 300 100" className="chart-svg">
                  <path 
                    d="M0,80 Q40,40 80,60 T160,20 T240,40 T300,10" 
                    fill="none" 
                    stroke="#caa35a" 
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path 
                    d="M0,80 Q40,40 80,60 T160,20 T240,40 T300,10 L300,100 L0,100 Z" 
                    fill="url(#chart-gradient)" 
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#caa35a" />
                      <stop offset="100%" stopColor="#caa35a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          <div className="text-content">
            <h3>Start your journey with Varsity Maker</h3>
            <p>
              Join thousands of professionals optimizing their daily operations with our ultra-clean, data-driven system architecture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;