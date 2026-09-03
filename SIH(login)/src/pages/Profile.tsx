import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { farmerService } from '../api/apiService';
import { User, MapPin, Phone, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { farmer, updateFarmer } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    village: '',
    district: '',
    state: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (farmer) {
      setFormData({
        name: farmer.name,
        mobile: farmer.mobile,
        village: farmer.village,
        district: farmer.district,
        state: farmer.state
      });
    }
  }, [farmer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    await farmerService.updateProfile(formData);
    updateFarmer(formData);
    toast.success('Profile updated successfully!');
    setLoading(false);
    setIsEditing(false);
  };

  if (!farmer) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Farmer Profile</h1>

      <div className="card mb-4" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-light))', color: 'white' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{farmer.name}</h2>
            <p className="opacity-90 flex items-center gap-1 mt-1 text-sm">
              <Hash size={14} /> {farmer.farmerId}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="font-semibold text-lg">Personal Details</h3>
          {!isEditing ? (
            <button className="text-primary font-semibold text-sm" onClick={() => setIsEditing(true)}>Edit</button>
          ) : (
            <button className="text-muted font-semibold text-sm" onClick={() => setIsEditing(false)}>Cancel</button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <User className="text-muted" size={20} />
            <div className="flex-1">
              <p className="text-xs text-muted">Full Name</p>
              {isEditing ? (
                <input type="text" name="name" className="form-input mt-1" value={formData.name} onChange={handleChange} />
              ) : (
                <p className="font-medium text-gray-800">{farmer.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="text-muted" size={20} />
            <div className="flex-1">
              <p className="text-xs text-muted">Mobile Number</p>
              {isEditing ? (
                <input type="tel" name="mobile" className="form-input mt-1" value={formData.mobile} onChange={handleChange} />
              ) : (
                <p className="font-medium text-gray-800">+91 {farmer.mobile}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="text-muted" size={20} />
            <div className="flex-1">
              <p className="text-xs text-muted">Location</p>
              {isEditing ? (
                <div className="flex flex-col gap-2 mt-1">
                  <input type="text" name="village" className="form-input" value={formData.village} onChange={handleChange} placeholder="Village" />
                  <input type="text" name="district" className="form-input" value={formData.district} onChange={handleChange} placeholder="District" />
                  <input type="text" name="state" className="form-input" value={formData.state} onChange={handleChange} placeholder="State" />
                </div>
              ) : (
                <p className="font-medium text-gray-800">{farmer.village}, {farmer.district}, {farmer.state}</p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 pt-4 border-t">
            <button className="btn btn-primary w-full" onClick={handleSave} disabled={loading}>
              {loading ? <div className="loader"></div> : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
