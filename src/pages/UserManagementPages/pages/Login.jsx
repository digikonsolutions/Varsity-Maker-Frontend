import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginuserThunk } from '../../../slices/loginuser/loginuserslice.jsx';
import "../Css/login.css";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("user_token");

        if (token) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    const { loading, items, error } = useSelector((state) => state.loginuser);
    const [formdata, setFormdata] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormdata((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

   const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(loginuserThunk(formdata));
    console.log('resut',result);

    if (result?.payload?.token) {
        localStorage.setItem("user_token", result.payload.token);

        navigate("/dashboard", { replace: true });
    }
};


    return (
        <div className="login-wrapper">
            {/* LEFT SIDE: FORM (Bhai yahan pehle 'login-right' likha tha, isko 'login-left' kar diya) */}
            <div className="login-left">
                <div className="login-box">
                    <div className="login-header">
                        <h1>Welcome back</h1>
                        <p className="sub-text">
                            New to Untitled? <span onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>Create an account</span>
                        </p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                name="email"  
                                placeholder="Enter your email" 
                                value={formdata.email}
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                name="password"
                                placeholder="••••••••" 
                                value={formdata.password}
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        {/* Error Message Section */}
                        {error && <p className="error-message" style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

                        <div className="login-options">
                            <label className="checkbox-container">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Remember for 30 days
                            </label>
                            <a href="#forgot" className="forgot-link">Forgot password?</a>
                        </div>

                        <button type="submit" className="btn-primary-login" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                        <div className="divider">
                            <span>or</span>
                        </div>

                        <button type="button" className="btn-google">
                            <img
                                src="https://www.svgrepo.com/show/355037/google.svg"
                                alt="Google"
                            />
                            Sign in with Google
                        </button>
                    </form>
                </div>
            </div>

            {/* RIGHT SIDE: MODERN GLASSMORPHISM PREVIEW */}
            <div className="login-right">
                <div className="grid-overlay"></div>
                
                <div className="overlay-content">
                    {/* Glassmorphism Stat Card */}
                    <div className="glass-card stat-card-login animate-float">
                        <div className="card-header">
                            <span className="badge">Sales Account</span>
                            <span className="trend positive">+3.4% vs last year</span>
                        </div>
                        <div className="card-body">
                            <h2>$288.5k</h2>
                        </div>
                    </div>

                    {/* Glassmorphism Analytics Card */}
                    <div className="glass-card chart-card animate-float delay-1">
                        <div className="chart-header">
                            <div className="live-dot-wrapper">
                                <span className="live-dot"></span>
                                <span>Live Revenue</span>
                            </div>
                            <div className="price">$58,144</div>
                        </div>
                        <div className="mock-chart">
                            <div className="chart-line-wrapper">
                                <svg viewBox="0 0 300 100" className="chart-svg">
                                    <path 
                                        d="M0,80 Q50,40 100,70 T200,20 T300,50" 
                                        fill="none" 
                                        stroke="#caa35a" 
                                        strokeWidth="3"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Feature Text */}
                    <div className="feature-text">
                        <h3>Introducing VarsityMaker</h3>
                        <p>
                            Faster and more accurate automated reports. Sign in to explore your fully automated premium workspace.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;