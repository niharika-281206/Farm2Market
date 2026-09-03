import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService, commonService } from '../api/apiService';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Wheat, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

const BookSlot: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    crop: '',
    quantity: '',
    centre: '',
    date: ''
  });
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [centresList, setCentresList] = useState<any[]>([]);
  const [cropsList, setCropsList] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [centres, crops] = await Promise.all([
          commonService.getCentres(),
          commonService.getCrops()
        ]);
        setCentresList(centres || []);
        setCropsList(crops || []);
      } catch (error) {
        toast.error('Failed to load form data');
      }
    };
    fetchInitialData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadSlots = async () => {
    if (!formData.centre || !formData.date) return;
    setLoading(true);
    try {
      // The API returns all slots for a centre. We filter by selected date in the frontend.
      const slots = await commonService.getAvailableSlots(formData.centre);
      const dateSlots = slots.filter((s: any) => s.date.startsWith(formData.date));
      setAvailableSlots(dateSlots);
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
        crop_id: Number(formData.crop),
        expected_quantity: Number(formData.quantity),
        centre_id: Number(formData.centre),
        slot_id: selectedSlot
      });
      toast.success('Slot booked successfully!');
      navigate('/farmer/my-token');
    } catch (error) {
      toast.error('Failed to book slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-8 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Calendar size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Book Procurement Slot</h1>
          <p className="text-xs text-gray-500">Schedule your visit to the mandi</p>
        </div>
      </div>
      
      <div className="card shadow-lg border-0 ring-1 ring-gray-100 p-0 overflow-hidden">
        {/* Progress Bar */}
        <div className="flex">
          <div className={`h-1.5 flex-1 ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`h-1.5 flex-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        </div>

        <div className="p-6 md:p-8">
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2">Crop Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Wheat size={16} className="text-primary" /> Crop Type
                  </label>
                  <select name="crop" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50" value={formData.crop} onChange={handleInputChange}>
                    <option value="">Select Crop</option>
                    {cropsList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} (MSP: ₹{c.rate}/Qtl)</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Expected Quantity (Qtl)</label>
                  <input type="number" name="quantity" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50" value={formData.quantity} onChange={handleInputChange} placeholder="e.g. 50" min="1" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2 mt-8">Centre & Schedule</h2>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <MapPin size={16} className="text-primary" /> Procurement Centre
                </label>
                <select name="centre" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50" value={formData.centre} onChange={handleInputChange}>
                  <option value="">Select Nearest Centre</option>
                  {centresList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.district})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Calendar size={16} className="text-primary" /> Preferred Date
                </label>
                <input type="date" name="date" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50" value={formData.date} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} />
              </div>

              <div className="pt-6 mt-2">
                <button 
                  className="w-full btn btn-primary py-3.5 text-lg font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={loadSlots} 
                  disabled={!formData.crop || !formData.quantity || !formData.centre || !formData.date || loading}
                >
                  {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
                    <>Check Availability <ArrowRight size={20} /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-100">
                <Clock size={20} />
                <div>
                  <h3 className="font-bold">Select Time Slot</h3>
                  <p className="text-sm opacity-90">{new Date(formData.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              
              {availableSlots.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 mb-6">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-semibold text-gray-700">No slots available for this date.</p>
                  <p className="text-sm text-gray-500 mt-1">Please go back and select a different date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {availableSlots.map((slot) => {
                    const isFull = slot.booked_count >= slot.capacity;
                    const isSelected = selectedSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        disabled={isFull}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : isFull 
                              ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
                              : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                            {slot.start_time} - {slot.end_time}
                          </span>
                          {isSelected && <CheckCircle size={18} className="text-primary" />}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {isFull ? 'Fully Booked' : 'Available'}
                          </span>
                          {!isFull && (
                            <span className="text-xs text-gray-500 font-medium">
                              {slot.capacity - slot.booked_count} spots left
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 flex-1 py-3.5 font-bold flex items-center justify-center gap-2" onClick={() => setStep(1)}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button 
                  className="btn btn-primary flex-[2] py-3.5 font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50" 
                  onClick={handleBook} 
                  disabled={loading || !selectedSlot}
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
                    <>Confirm Booking <CheckCircle size={18} /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookSlot;
