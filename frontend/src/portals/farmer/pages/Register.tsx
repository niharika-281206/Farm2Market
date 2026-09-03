import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const location = useLocation();
  const prefilledMobile = location.state?.mobile || '';
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: prefilledMobile,
    state: '',
    district: '',
    village: '',
    mandal: '',
    pincode: '',
    primary_crops: '',
    land_area: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if mobile is missing to prevent unregistered manual access
  React.useEffect(() => {
    if (!prefilledMobile) {
      toast.error('Mobile verification required. Please login first.');
      navigate('/login');
    }
  }, [prefilledMobile, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.mobile.length !== 10) {
      toast.error('Please enter your 10-digit mobile number');
      return;
    }
    setLoading(true);
    const dataToSubmit = {
      ...formData,
      land_area: parseFloat(formData.land_area) || 0
    };
    
    const success = await register(dataToSubmit);
    if (success) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="app-container auth-bg" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
        <h1 className="text-2xl font-bold mb-2 text-center">Complete Registration</h1>
        <p className="text-muted text-center mb-6">Please provide your details to complete your Farmer Profile.</p>
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Mobile Number (Verified)</label>
            <input type="tel" name="mobile" className="form-input bg-gray-100 cursor-not-allowed" value={formData.mobile} readOnly disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Mandal/Taluk</label>
              <input type="text" name="mandal" className="form-input" value={formData.mandal} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Village</label>
              <input type="text" name="village" className="form-input" value={formData.village} onChange={handleInputChange} required />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input type="text" name="pincode" className="form-input" value={formData.pincode} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Land Area (Acres)</label>
              <input type="number" step="0.1" name="land_area" className="form-input" value={formData.land_area} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Crops</label>
            <input type="text" name="primary_crops" className="form-input" placeholder="e.g. Paddy, Maize" value={formData.primary_crops} onChange={handleInputChange} required />
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={loading} style={{ width: '100%' }}>
            {loading ? <div className="loader"></div> : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
