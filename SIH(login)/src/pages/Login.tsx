import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      toast.success('OTP sent successfully (Use any for mock)');
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }
    setLoading(true);
    const success = await login(mobile, otp);
    if (success) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="app-container auth-bg" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
        <div className="text-center mb-4">
          <Leaf size={48} color="var(--color-primary)" style={{ margin: '0 auto' }} />
          <h1 className="mt-2 text-2xl font-bold">Farmer Portal</h1>
          <p className="text-muted">Login to manage your bookings</p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Enter 10-digit number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="loader"></div> : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter OTP (e.g. 1234)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="loader"></div> : 'Verify & Login'}
            </button>
            <button 
              type="button" 
              className="btn mt-2" 
              onClick={() => setOtpSent(false)} 
              style={{ color: 'var(--color-text-muted)' }}
            >
              Change Mobile Number
            </button>
          </form>
        )}

        <div className="text-center mt-4 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
          <p className="text-sm text-muted">New Farmer?</p>
          <Link to="/register" className="text-primary font-semibold">Register Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
