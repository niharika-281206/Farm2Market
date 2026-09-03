import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    const success = await sendOtp(mobile);
    if (success) {
      setOtpSent(true);
      toast.success('OTP sent successfully');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }
    setLoading(true);
    const result = await verifyOtp(mobile, otp);
    if (result) {
      if (result.is_registered === false) {
        toast.success('OTP Verified. Please complete registration.');
        navigate('/farmer/register', { state: { mobile } });
      } else {
        toast.success('Logged in successfully');
        const from = (location.state as any)?.from?.pathname || '/farmer/';
        navigate(from, { replace: true });
      }
    }
    setLoading(false);
  };

  return (
    <div className="app-container auth-bg" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', margin: '0 1rem' }}>
        <div className="text-center mb-6">
          <div className="logo-placeholder mx-auto mb-4" style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Farmer Portal</h1>
          <p className="text-muted mt-2">Login to manage your bookings</p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="Enter 10-digit number" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? <div className="loader"></div> : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <p className="text-sm text-muted mb-2">Sent to {mobile}</p>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? <div className="loader"></div> : 'Verify & Login'}
            </button>
            <div className="text-center mt-4">
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                onClick={() => setOtpSent(false)}
              >
                Change Number
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/farmer/register" className="text-primary font-semibold">Register as Farmer</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
