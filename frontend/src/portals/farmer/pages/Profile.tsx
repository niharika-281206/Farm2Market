import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { farmerService } from '../api/apiService';
import { User, MapPin, Phone, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { farmer, updateFarmer } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    mobile: '',
    village: '',
    mandal: '',
    district: '',
    state: '',
    pincode: '',
    land_area: '',
    primary_crops: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (farmer) {
      setFormData({
        name: farmer.name || '',
        mobile: farmer.mobile || '',
        village: farmer.village || '',
        mandal: farmer.mandal || '',
        district: farmer.district || '',
        state: farmer.state || '',
        pincode: farmer.pincode || '',
        land_area: farmer.land_area || '',
        primary_crops: farmer.primary_crops || ''
      });
    }
  }, [farmer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await farmerService.updateProfile(formData);
      updateFarmer(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!farmer) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Farmer Profile</h1>

      <div className="card mb-6 overflow-hidden shadow-lg border-0" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #166534 100%)', color: 'white' }}>
        <div className="flex items-center gap-5 p-2">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary shadow-inner">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{farmer.name}</h2>
            <p className="opacity-90 flex items-center gap-1 mt-2 text-sm bg-white/20 px-3 py-1 rounded-full inline-flex">
              <Hash size={14} /> ID: {farmer.farmer_id}
            </p>
          </div>
        </div>
      </div>

      <div className="card shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">Personal Details</h3>
          {!isEditing ? (
            <button className="text-primary font-semibold text-sm bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full transition-colors" onClick={() => setIsEditing(true)}>Edit Profile</button>
          ) : (
            <button className="text-gray-500 hover:text-gray-700 font-semibold text-sm px-4 py-2 transition-colors" onClick={() => setIsEditing(false)}>Cancel</button>
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

          <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Phone size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mobile Number</p>
              {isEditing ? (
                <input type="tel" name="mobile" className="form-input mt-1 border-gray-200 focus:border-primary focus:ring focus:ring-primary/20" value={formData.mobile} onChange={handleChange} />
              ) : (
                <p className="font-medium text-gray-800 mt-1">+91 {farmer.mobile}</p>
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
                  <input type="text" name="mandal" className="form-input" value={formData.mandal} onChange={handleChange} placeholder="Mandal" />
                  <input type="text" name="district" className="form-input" value={formData.district} onChange={handleChange} placeholder="District" />
                  <input type="text" name="state" className="form-input" value={formData.state} onChange={handleChange} placeholder="State" />
                  <input type="text" name="pincode" className="form-input" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
                </div>
              ) : (
                <p className="font-medium text-gray-800">
                  {farmer.village}{farmer.mandal ? `, ${farmer.mandal}` : ''}, {farmer.district}, {farmer.state} {farmer.pincode ? `- ${farmer.pincode}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22 22 2"/><path d="M14 2 22 2 22 10"/><path d="M10 22 2 22 2 14"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Land Area (Acres)</p>
              {isEditing ? (
                <input type="number" name="land_area" className="form-input mt-1" value={formData.land_area} onChange={handleChange} placeholder="e.g. 5.5" />
              ) : (
                <p className="font-medium text-gray-800 mt-1">{farmer.land_area || 'Not provided'} Acres</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M12 22c-3.3 0-6-2.7-6-6 0-3.3 3.3-8 6-12 2.7 4 6 8.7 6 12 0 3.3-2.7 6-6 6Z"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Primary Crops</p>
              {isEditing ? (
                <input type="text" name="primary_crops" className="form-input mt-1" value={formData.primary_crops} onChange={handleChange} placeholder="e.g. Paddy, Maize" />
              ) : (
                <p className="font-medium text-gray-800 mt-1">{farmer.primary_crops || 'Not provided'}</p>
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
