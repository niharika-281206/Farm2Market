import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../api/apiService';
import toast from 'react-hot-toast';

const BookSlot: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    crop: '',
    quantity: '',
    centre: '',
    date: ''
  });
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: number}[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadSlots = async () => {
    if (!formData.centre || !formData.date) return;
    setLoading(true);
    try {
      const slots = await bookingService.getAvailableSlots(formData.centre, formData.date);
      setAvailableSlots(slots);
      setStep(2);
    } catch (error) {
      toast.error('Failed to load slots. Backend might be down.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }
    setLoading(true);
    try {
      await bookingService.bookSlot({
        ...formData,
        quantity: Number(formData.quantity),
        timeSlot: selectedSlot
      });
      toast.success('Slot booked successfully!');
      navigate('/my-token');
    } catch (error) {
      toast.error('Failed to book slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Book Procurement Slot</h1>
      
      <div className="card">
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="form-group">
              <label className="form-label">Crop Type</label>
              <select name="crop" className="form-input" value={formData.crop} onChange={handleInputChange}>
                <option value="">Select Crop</option>
                <option value="Paddy">Paddy</option>
                <option value="Wheat">Wheat</option>
                <option value="Maize">Maize</option>
                <option value="Mirchi">Mirchi</option>
                <option value="Groundnuts">Groundnuts</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Expected Quantity (Quintals)</label>
              <input type="number" name="quantity" className="form-input" value={formData.quantity} onChange={handleInputChange} placeholder="e.g. 50" />
            </div>

            <div className="form-group">
              <label className="form-label">Procurement Centre</label>
              <select name="centre" className="form-input" value={formData.centre} onChange={handleInputChange}>
                <option value="">Select Nearest Centre</option>
                <option value="AMC Guntur">AMC Guntur</option>
                <option value="AMC Tenali">AMC Tenali</option>
                <option value="Mandal Centre">Local Mandal Centre</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Date</label>
              <input type="date" name="date" className="form-input" value={formData.date} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} />
            </div>

            <button 
              className="btn btn-primary" 
              onClick={loadSlots} 
              disabled={!formData.crop || !formData.quantity || !formData.centre || !formData.date || loading}
            >
              {loading ? <div className="loader"></div> : 'Check Availability'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="font-semibold mb-4">Select Time Slot for {formData.date}</h3>
            <div className="flex flex-col gap-3 mb-6">
              {availableSlots.map((slot, idx) => {
                const isFull = slot.available === 0;
                return (
                  <button
                    key={idx}
                    disabled={isFull}
                    onClick={() => setSelectedSlot(slot.time)}
                    style={{
                      padding: '1rem',
                      border: `2px solid ${selectedSlot === slot.time ? 'var(--color-primary)' : '#E5E7EB'}`,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isFull ? '#F3F4F6' : 'white',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: isFull ? 0.6 : 1
                    }}
                  >
                    <span className="font-semibold text-gray-800">{slot.time}</span>
                    <span className={`badge ${isFull ? 'badge-danger' : 'badge-success'}`}>
                      {isFull ? 'Full' : `Available: ${slot.available}`}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-4">
              <button className="btn btn-outline flex-1" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary flex-1" onClick={handleBook} disabled={loading || !selectedSlot}>
                {loading ? <div className="loader"></div> : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSlot;
