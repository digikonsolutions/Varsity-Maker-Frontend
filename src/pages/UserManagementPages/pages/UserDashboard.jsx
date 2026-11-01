import React, { useState, useEffect } from 'react';
import '../Css/UserDashboard.css';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getmyorderbyuserthunk } from '../../../slices/myorders/myordersfordashboardslice.jsx'; 
import { trackmyorderThunk } from '../../../slices/trackorder/trackorderslice.jsx';
import { affiliatedashboardthunk } from '../../../slices/affiliate/affiliatedashboardslice.jsx'; 
import { createaffiliateThunk } from '../../../slices/affiliate/createaffiliateslice.jsx';
import { GetRefferalThunk } from '../../../slices/affiliate/getrefferalslice.jsx';

import { 
  FaSignOutAlt, FaChartPie, FaHistory, FaMapMarkedAlt, 
  FaSearchLocation, FaEye, FaBoxOpen, FaHandshake, 
  FaDollarSign, FaLink, FaUsers, FaCopy, FaCheckCircle, FaUserCircle 
} from 'react-icons/fa';
import LoadingSpinner from '../../../components/LoadingSpinner.jsx';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  
  const [activeTab, setActiveTab] = useState('orders'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderItems, setSelectedOrderItems] = useState(null);
  const [trackInput, setTrackInput] = useState('');
  const [copied, setCopied] = useState(false);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const rawData = localStorage.getItem('user_data');
    if (rawData) {
      try {
        setUserData(JSON.parse(rawData));
      } catch (e) {
        console.error("Failed parsing storage payload node structure:", e);
      }
    }
  }, []);

  const { items, loading, error } = useSelector(
    (state) => state.myordersbyuser
  );

  const { 
    items: trackItems, 
    loading: trackOrderLoading, 
    error: trackOrderError 
  } = useSelector((state) => state.trackorder);

  const { 
    items: affiliateData, 
    loading: affiliateLoading, 
    error: affiliateError,
    isRegistered 
  } = useSelector((state) => state.affiliatedasboard);
  console.log(affiliateData);

  const {
    loading: registrationLoading,
    error: registrationError
  } = useSelector((state) => state.createaffiliate);

  useEffect(() => {
    dispatch(getmyorderbyuserthunk());
    dispatch(affiliatedashboardthunk()); // Fetch user affiliate records on lifecycle init

      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      if (!referralCode) return;
       console.log(referralCode);
const alreadyTracked = sessionStorage.getItem('ref_tracked');
  if (alreadyTracked === referralCode) return;
  console.log("Tracking referral:", referralCode);
    
    dispatch(GetRefferalThunk(referralCode))
    .unwrap()
    .then((res) => {
      console.log("Referral tracked successfully:", res);
      sessionStorage.setItem('ref_tracked', referralCode);
      localStorage.setItem('ref_code', referralCode);
    })
    .catch((err) => {
      console.error("Referral tracking failed:", err);
    })
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('user_token'); 
    localStorage.removeItem('user_data'); 
    alert('Logout Successful! Redirecting to login page...');
    navigate('/login'); 
  };

  // Safe Array Castings
  const ordersList = Array.isArray(items) ? items : [];

  // Metrics Computations
  const totalOrders = ordersList.length;
  const activeShipments = ordersList.filter(o => 
    String(o.status).toLowerCase() === 'shipped' || String(o.status).toLowerCase() === 'pending'
  ).length;
  const deliveredItems = ordersList.filter(o => 
    String(o.status).toLowerCase() === 'delivered'
  ).length;
  const totalSpent = ordersList.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0);

  // Live Order Search Filter Logic
  const filteredOrders = ordersList.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const orderIdStr = String(order.id || '').toLowerCase();
    const trackingCodeStr = order.tracking_number ? String(order.tracking_number).toLowerCase() : '';
    return orderIdStr.includes(searchLower) || trackingCodeStr.includes(searchLower);
  });

  const handleApiTrack = (e) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    dispatch(trackmyorderThunk({ trackingnumber: trackInput.trim() }));
  };

  const handleOnboardAffiliate = (e) => {
    e.preventDefault();
    
    const payloadName = userData?.name || 'Customer Account';
    const payloadId = userData?.id || null;
    const payloadguestid = localStorage.getItem('guest_id');
    console.log(payloadguestid);

    dispatch(createaffiliateThunk({ 
      data: { 
        user_id: payloadId,
        name: payloadName,
        type: 'customer',
        commission_rate: 10
      } 
    })).unwrap()
      .then(() => {
        alert('Affiliate Node Registration Activated!');
        dispatch(affiliatedashboardthunk()); 
      })
      .catch((err) => {
        console.error("Pipeline breakdown:", err);
      });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAffiliateRegistered = isRegistered && affiliateData && Object.keys(affiliateData).length > 0;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        {/* User Identity Profile Card */}
        {userData && (
          <div className="sidebar-profile-card" style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid var(--border-color, #334155)' }}>
            <FaUserCircle style={{ fontSize: '48px', color: 'var(--accent-primary, #3b82f6)', marginBottom: '8px' }} />
            <h4 style={{ color: 'var(--text-main, #f8fafc)', margin: '0', fontSize: '16px', textTransform: 'capitalize' }}>{userData.name}</h4>
            <p style={{ color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0', fontSize: '12px' }}>{userData.email}</p>
          </div>
        )}

        <nav className="sidebar-menu">
          <div className="menu-links">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`menu-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <FaChartPie className="menu-icon" /> Overview
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`menu-item-btn ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <FaHistory className="menu-icon" /> Order History
            </button>
            <button 
              onClick={() => setActiveTab('tracking')} 
              className={`menu-item-btn ${activeTab === 'tracking' ? 'active' : ''}`}
            >
              <FaSearchLocation className="menu-icon" /> Live Tracking
            </button>
            <button 
              onClick={() => setActiveTab('address')} 
              className={`menu-item-btn ${activeTab === 'address' ? 'active' : ''}`}
            >
              <FaMapMarkedAlt className="menu-icon" /> Address System
            </button>

            {/* ================= NEW SIDEBAR LINK MODULE ================= */}
            <button 
              onClick={() => setActiveTab('affiliate')} 
              className={`menu-item-btn ${activeTab === 'affiliate' ? 'active' : ''}`}
             style={activeTab === 'affiliate' 
    ? { borderLeft: '3px solid var(--accent-primary)' } 
    : {}
  }
            >
              <FaHandshake className="menu-icon" style={activeTab ==='affiliate' ? {color: 'var(--accent-primary)'} : {color : ""}} /> Affiliate Program
            </button>
          </div>

          <div className="sidebar-logout-wrapper">
            <hr className="sidebar-divider" />
            <button onClick={handleLogout} className="menu-item logout-btn">
              <FaSignOutAlt className="logout-icon-fa" />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        
        {/* 1️⃣ OVERVIEW MODULE */}
        {activeTab === 'overview' && (
          <div className="tab-fade-in">
            <header className="main-header">
              <div className="header-title">
                <h1>Dashboard Overview</h1>
                <p className="subtitle">Welcome back, <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{userData?.name || 'Client'}</span>! Here is a snapshot of your account activity metrics.</p>
              </div>
            </header>

            <section className="stats-grid">
              <div className="stat-card unique-spent-card">
                <h3>Total Amount</h3>
                <p className="stat-number">${totalSpent.toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>Total Invoices Issued</h3>
                <p className="stat-number">{totalOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Active Shipments</h3>
                <p className="stat-number">{activeShipments}</p>
              </div>
            </section>

            <section className="overview-recent-box table-container" style={{ marginTop: '24px', padding: '24px' }}>
              <h3 style={{ marginBottom: '10px', color: 'var(--text-main)' }}>Quick Activity Log</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Your account is in good standing. You currently have <strong>{activeShipments}</strong> parcels processing in our system. Use the navigation sidebar tabs to view deeper item lists.
              </p>
            </section>
          </div>
        )}

        {/* 2️⃣ ORDERS HISTORY MODULE */}
        {activeTab === 'orders' && (
          <div className="tab-fade-in">
            <header className="main-header">
              <div className="header-title">
                <h1>Customer Orders</h1>
                <p className="subtitle">View and manage all your orders, track delivery progress, and check order details.</p>
              </div>
            </header>

            <section className="stats-grid">
              <div className="stat-card">
                <h3>Total Orders Placed</h3>
                <p className="stat-number">{totalOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Active Shipments</h3>
                <p className="stat-number">{activeShipments}</p>
              </div>
              <div className="stat-card">
                <h3>Delivered Items</h3>
                <p className="stat-number">{deliveredItems}</p>
              </div>
            </section>

            <section className="table-controls">
              <div className="search-wrapper">
                <input 
                  type="text" 
                  placeholder="Search by Order ID or Tracking Key..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-dashboard"
                />
              </div>
            </section>

            <section className="table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Order ID & Date</th>
                    <th>User Identity</th>
                    <th>Total Bill</th>
                    <th>Tracking Number</th>
                    <th>Email Phase Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const liveTracking = order.tracking_number || 'Pending Assignment';
                      return (
                        <tr key={order.id}>
                          <td>
                            <span className="order-id-badge">#{order.id}</span>
                            <p className="order-date-text">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric'
                              }) : 'N/A'}
                            </p>
                          </td>
                          <td>
                            <div className="user-name">{order.guest_name || 'Client Account'}</div>
                            <div className="user-email">{order.guest_email || `ID #${order.user_id}`}</div>
                          </td>
                          <td>
                            <span className="order-price-tag">
                              ${parseFloat(order.total_amount || 0).toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <span 
                              className={`tracking-code ${liveTracking === 'Pending Assignment' ? 'pending-track' : ''}`}
                              style={{ cursor: liveTracking !== 'Pending Assignment' ? 'pointer' : 'default' }}
                              onClick={() => {
                                if(liveTracking !== 'Pending Assignment') {
                                  setTrackInput(liveTracking);
                                  setActiveTab('tracking');
                                  dispatch(trackmyorderThunk({ trackingnumber: liveTracking }));
                                }
                              }}
                              title={liveTracking !== 'Pending Assignment' ? "Click to track live via server API" : "Awaiting tracking hash"}
                            >
                              {liveTracking}
                            </span>
                          </td>
                          <td>
                            <span className={`status-indicator status-${String(order.status || 'pending').toLowerCase().replace(' ', '-')}`}>
                              {order.status || 'Pending'}
                            </span>
                          </td>
                          <td className="text-right">
                            <button className="btn-action btn-edit" onClick={() => setSelectedOrderItems(order.items || [])}>
                              <FaEye /> Items ({order.items?.length || 0})
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    !loading && (
                      <tr>
                        <td colSpan="6" className="empty-state">No order history available matching the parameters.</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </section>

            {loading && <div className="dashboard-loading-bar" style={{ margin: '15px 0' }}><LoadingSpinner/></div>}
            {error && <div className="dashboard-error-alert" style={{ margin: '15px 0', color: 'var(--danger)' }}>Error: {error}</div>}
          </div>
        )}

        {/* 3️⃣ LIVE TRACKING MODULE */}
        {activeTab === 'tracking' && (
          <div className="tab-fade-in">
            <header className="main-header">
              <div className="header-title">
                <h1>Track Your Order</h1>
                <p className="subtitle">Enter your tracking key to instantly view your order's current status and updates.</p>
              </div>
            </header>

            <section className="table-container" style={{ padding: '30px' }}>
              <form onSubmit={handleApiTrack} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <input 
                  type="text"
                  className="search-input-dashboard"
                  placeholder="e.g. TRK-2026XXXXXXXXXXXX"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  style={{ flex: 1, minWidth: '250px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px' }}>
                  Locate Shipment
                </button>
              </form>

              {trackOrderLoading && <div style={{ marginTop: '20px' }}><LoadingSpinner/></div>}
              {trackOrderError && <div className="dashboard-error-alert" style={{ marginTop: '20px', color: 'var(--danger)' }}>❌ Network tracking node failure: {trackOrderError}</div>}

              {!trackOrderLoading && trackItems && Object.keys(trackItems).length > 0 && (
                <div className="tracking-results-timeline" style={{ marginTop: '30px', borderLeft: '3px solid var(--accent-primary)', paddingLeft: '20px' }}>
                  <h3 style={{ color: 'var(--text-main)' }}><FaBoxOpen /> &nbsp; Order Status: {String(trackItems.status || 'PROCESSED').toUpperCase()}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                    Tracking Sequence Key: <strong>{trackItems.tracking_number || trackInput}</strong>
                  </p>
                  
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ color: 'var(--text-main)', marginBottom: '15px' }}>Milestone Progress Events:</h4>
                    {Array.isArray(trackItems.trackings) && trackItems.trackings.length > 0 ? (
                      trackItems.trackings.map((log, index) => (
                        <div key={index} style={{ margin: '15px 0', fontSize: '14px', color: 'var(--text-main)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>[{log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}]</span> - <span>{log.message || 'Status checkpoint cleared.'}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>📍 Parcel token registered successfully. Ground dispatch transit routing queue data pending refresh.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* 4️⃣ ADDRESS SYSTEM MODULE */}
        {activeTab === 'address' && (
          <div className="tab-fade-in">
            <header className="main-header">
              <div className="header-title">
                <h1>Your Address</h1>
                <p className="subtitle">Manage your saved address and contact details.</p>
              </div>
            </header>

            <section className="table-container" style={{ padding: '30px' }}>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '15px' }}>Default Delivery Address</h3>
              {ordersList.length > 0 && ordersList[0].shipping_address ? (
                (() => {
                  try {
                    const parsedAddress = typeof ordersList[0].shipping_address === 'string' 
                      ? JSON.parse(ordersList[0].shipping_address) 
                      : ordersList[0].shipping_address;
                    
                    return (
                      <div className="address-card-mock" style={{ color: 'var(--text-main)', lineHeight: '2', fontSize: '15px' }}>
                        <p><strong>Full Name:</strong> {parsedAddress.name || 'N/A'}</p>
                        <p><strong>Your Phone Number:</strong> {parsedAddress.phone || 'N/A'}</p>
                        <p><strong>Stated Street Address:</strong> {parsedAddress.address || 'No string address field extracted.'}</p>
                      </div>
                    );
                  } catch (e) {
                    return <p style={{ color: 'var(--text-muted)' }}>Parsing error on system node mapping.</p>;
                  }
                })()
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No active shipping nodes bound to this explicit token history yet.</p>
              )}
            </section>
          </div>
        )}

        {/* ================= 5️⃣ DYNAMIC AFFILIATE SYSTEM ENGINE MODULE ================= */}
        {activeTab === 'affiliate' && (
          <div className="tab-fade-in">
            <header className="main-header">
              <div className="header-title">
                <h1>Partner Affiliate Program</h1>
                <p className="subtitle">Join our Partner Affiliate Program and earn commissions by promoting our products and driving successful referrals.</p>
              </div>
            </header>

            {affiliateLoading ? (
              <div style={{ padding: '40px' }}><LoadingSpinner /></div>
            ) : isAffiliateRegistered ? (
              /* State A: User Is Active Affiliate Member Container */
              <div>
                <section className="stats-grid">
                  <div className="stat-card" style={{ borderTop: '4px solid var(--accent-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>Total Earnings</h3>
                      <FaDollarSign style={{ color: 'var(--accent-primary)', fontSize: '20px' }} />
                    </div>
                    <p className="stat-number" style={{ color: 'var(--accent-primary)' }}>
                      ${parseFloat(affiliateData.earnings || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>Link Clicks</h3>
                      <FaLink style={{ color: 'var(--text-main)', fontSize: '20px' }} />
                    </div>
                    <p className="stat-number">{affiliateData.total_clicks || 0}</p>
                  </div>
                  <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>Conversions</h3>
                      <FaUsers style={{ color: 'var(--text-main)', fontSize: '20px' }} />
                    </div>
                    <p className="stat-number">{affiliateData.total_orders || 0}</p>
                  </div>
                </section>

                {/* Breakdown Balance Ledger Sub-Grid */}
                <section className="stats-grid" style={{ marginTop: '20px' }}>
                  <div className="stat-card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <h3 style={{ color: '#f59e0b' }}>Pending Commissions</h3>
                    <p className="stat-number" style={{ fontSize: '24px', color: '#f59e0b' }}>
                      ${parseFloat(affiliateData.pending || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="stat-card" style={{ background: '#0f172a1c', border: '1px solid #0f172a1c' }}>
                    <h3 style={{ color: 'var(--text-main)' }}>Paid Out Settlements</h3>
                    <p className="stat-number" style={{ fontSize: '24px', color: 'var(--text-main)' }}>
                      ${parseFloat(affiliateData.paid || 0).toFixed(2)}
                    </p>
                  </div>
                </section>

                <section className="table-container" style={{ marginTop: '24px', padding: '30px' }}>
                  <h3 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Your Affiliate Link</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '15px' }}>
                   Share this personalized URL with your network. Every successful transaction made through your link is tracked instantly, and your commissions are reflected in real time on your dashboard. </p>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: 'var(--bg-main, #0f172a)', 
                    padding: '12px 20px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-color, #334155)',
                    gap: '15px',
                    justifyContent: 'space-between'
                  }}>
                    <code style={{ color: 'var(--accent-primary)', fontWeight: '600', wordBreak: 'break-all' }}>
                      {`${window.location.origin}?ref=${affiliateData.ref_code || ''}`}
                    </code>
                    <button 
                      type="button" 
                      onClick={() => copyToClipboard(`${window.location.origin}?ref=${affiliateData.ref_code || ''}`)}
                      style={{
                        background: copied ? '#10b981' : 'var(--accent-primary)',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {copied ? <FaCheckCircle /> : <FaCopy />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </section>

                <section className="table-container" style={{ marginTop: '24px', padding: '24px' }}>
                  <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Transaction and Updates</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
                    All transactions and system updates are processed in real time, ensuring accurate tracking, instant synchronization, and seamless commission recording across your affiliate dashboard.
                  </p>
                </section>
              </div>
            ) : (
              /* State B: Onboarding Registration Screen For Non-Affiliates */
              <div className="table-container" style={{ padding: '40px', textAlign: 'center', maxWidth: '650px', margin: '30px auto' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <FaHandshake style={{ fontSize: '35px', color: '#10b981' }} />
                </div>
                <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Unlock Capital Streams</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' }}>
                  Hey <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{userData?.name || 'Partner'}</span>, click below to join our native monetization loop and immediately activate your scalable revenue pipeline generation mechanism.
                </p>

                <form onSubmit={handleOnboardAffiliate}>
                  {registrationError && (
                    <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: '500', marginBottom: '15px' }}>
                      ❌ Token assignment crash: {registrationError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ background: '#10b981', borderColor: '#10b981', padding: '14px 28px', fontSize: '15px', fontWeight: '600', width: '100%' }}
                    disabled={registrationLoading}
                  >
                    {registrationLoading ? 'Compiling Partner Node...' : 'Generate Partner Pipeline Token'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

      </main>

      {/* 🧾 ORDER ITEMS MODAL OVERLAY */}
      {selectedOrderItems && (
        <div className="modal-overlay" onClick={() => setSelectedOrderItems(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Order Items List</h2>
            <div className="items-list-container">
              {selectedOrderItems.length > 0 ? (
                selectedOrderItems.map((item) => (
                  <div key={item.id} className="item-row">
                    <div>
                      <h4 className="item-title-text">{item.product_name || "Premium Item"}</h4>
                      <p className="subtitle">Database Product ID: #{item.product_id || item.id}</p>
                    </div>
                    <div className="item-price-breakdown">
                      <span>{item.quantity || 1}x</span>
                      <strong>${parseFloat(item.price || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No linked product logs for this snapshot invoice.</p>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrderItems(null)}>Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;