import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    farmerId: '',
    state: '',
    district: '',
    village: '',
    crop: '',
    quantity: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    // Mock API call to send OTP
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      toast.success('OTP sent successfully');
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }
    setLoading(true);
    const success = await register(formData.mobile, otp);
    if (success) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="app-container auth-bg" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', margin: '2rem 1rem' }}>
        <h1 className="text-2xl font-bold mb-4 text-center">Farmer Registration</h1>
        
        {!otpSent ? (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input type="tel" name="mobile" className="form-input" value={formData.mobile} onChange={handleInputChange} maxLength={10} required />
            </div>

            <div className="form-group">
              <label className="form-label">Farmer ID (Optional)</label>
              <input type="text" name="farmerId" className="form-input" value={formData.farmerId} onChange={handleInputChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" name="state" className="form-input" value={formData.state} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <input type="text" name="district" className="form-input" value={formData.district} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Village</label>
              <input type="text" name="village" className="form-input" value={formData.village} onChange={handleInputChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Expected Crop</label>
                <input type="text" name="crop" className="form-input" value={formData.crop} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity (Quintals)</label>
                <input type="number" name="quantity" className="form-input" value={formData.quantity} onChange={handleInputChange} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="loader"></div> : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label">Enter OTP sent to {formData.mobile}</label>
              <input type="text" className="form-input" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="loader"></div> : 'Verify & Complete'}
            </button>
          </form>
        )}
        
        <div className="text-center mt-4 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
          <p className="text-sm text-muted">Already registered?</p>
          <Link to="/login" className="text-primary font-semibold">Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
