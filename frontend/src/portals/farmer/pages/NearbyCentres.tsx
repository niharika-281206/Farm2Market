import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { commonService } from '../api/apiService';
import { MapPin, Navigation, Map as MapIcon, Building2, Store } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix for default Leaflet icon paths in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const GovtIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const PrivateIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const UserIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const NearbyCentres: React.FC = () => {
  const [centres, setCentres] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'govt' | 'private'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centresData, buyersData] = await Promise.all([
          commonService.getCentres(),
          commonService.getPrivateBuyers()
        ]);
        setCentres(centresData || []);
        setBuyers(buyersData || []);
      } catch (error) {
        toast.error('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setUserLocation([15.9129, 79.7400]); // AP Center default
        }
      );
    } else {
      setUserLocation([15.9129, 79.7400]);
    }
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const filteredCentres = viewMode === 'private' ? [] : centres;
  const filteredBuyers = viewMode === 'govt' ? [] : buyers;

  return (
    <div className="pb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <MapPin size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Nearby Procurement Options</h1>
          <p className="text-xs text-gray-500">Find Govt. AMCs and Private Buyers near you to sell your crop</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'all' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
          onClick={() => setViewMode('all')}
        >
          All Locations
        </button>
        <button 
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'govt' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
          onClick={() => setViewMode('govt')}
        >
          Govt. Centres
        </button>
        <button 
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'private' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
          onClick={() => setViewMode('private')}
        >
          Private Buyers
        </button>
      </div>

      <div className="card p-0 overflow-hidden mb-6 shadow-md border-0 ring-1 ring-black/5" style={{ height: '400px', zIndex: 0 }}>
        {loading || !userLocation ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading map and centres...</p>
          </div>
        ) : (
          <MapContainer center={userLocation} zoom={7} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={userLocation} icon={UserIcon}>
              <Popup>Your Current Location</Popup>
            </Marker>

            {filteredCentres.filter(c => c.latitude && c.longitude).map((centre) => (
              <Marker key={`c-${centre.id}`} position={[centre.latitude, centre.longitude]} icon={GovtIcon}>
                <Popup>
                  <div className="font-bold text-green-700">{centre.name} (Govt)</div>
                  <div className="text-xs text-gray-500 mt-1">{centre.address}</div>
                  <div className="text-xs font-semibold mt-2 text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded inline-block">Capacity: {centre.daily_capacity} Qtl</div>
                </Popup>
              </Marker>
            ))}

            {filteredBuyers.filter(b => b.latitude && b.longitude).map((buyer) => (
              <Marker key={`b-${buyer.id}`} position={[buyer.latitude, buyer.longitude]} icon={PrivateIcon}>
                <Popup>
                  <div className="font-bold text-purple-700">{buyer.company_name} (Private)</div>
                  <div className="text-xs text-gray-500 mt-1">{buyer.address}</div>
                  {buyer.crop_requirements && buyer.crop_requirements.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {buyer.crop_requirements.map((req: any, i: number) => (
                         <div key={i} className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded inline-block w-full">
                           Buying {req.maximum_quantity} {req.unit} @ ₹{req.procurement_rate}
                         </div>
                      ))}
                    </div>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {(filteredCentres.length === 0 && filteredBuyers.length === 0) && !loading ? (
        <div className="card border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
            <MapIcon size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Locations Found</h2>
          <p className="text-sm text-gray-500">There are currently no active buyers or centres available for this filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Private Buyers Section */}
          {filteredBuyers.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2 px-1">
                <Store size={20} /> Private Buyers
              </h2>
              <div className="flex flex-col gap-4">
                {filteredBuyers.map((buyer) => (
                  <div key={`list-b-${buyer.id}`} className="card p-4 flex flex-col sm:flex-row justify-between sm:items-center bg-white border border-purple-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 bg-purple-50 p-2 rounded-full text-purple-600 border border-purple-100">
                          <Store size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            {buyer.company_name}
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                              Private
                            </span>
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">{buyer.address}, {buyer.district}</p>
                          <p className="text-xs text-gray-400 mt-1">Owner: {buyer.owner_name}</p>
                        </div>
                      </div>
                      
                      {/* Crop Prices */}
                      {buyer.crop_requirements && buyer.crop_requirements.length > 0 && (
                        <div className="flex flex-wrap gap-2 ml-14">
                          {buyer.crop_requirements.map((req: any, i: number) => (
                            <div key={i} className="bg-gradient-to-r from-purple-50 to-white border border-purple-200 rounded-lg p-2 px-3 shadow-sm flex flex-col">
                              <span className="text-[10px] text-gray-500 font-bold uppercase">Offering Price</span>
                              <div className="flex items-end gap-1">
                                <span className="text-lg font-black text-purple-700">₹{req.procurement_rate}</span>
                                <span className="text-xs text-gray-500 mb-1">/{req.unit}</span>
                              </div>
                              <span className="text-xs font-semibold text-gray-600 mt-1">Needs up to {req.maximum_quantity} {req.unit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {userLocation && buyer.latitude && buyer.longitude && (
                      <div className="text-right flex sm:flex-col items-center sm:items-end mt-4 sm:mt-0 justify-between sm:justify-start pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                        <div className="text-lg font-black text-gray-700 tracking-tight">
                          {calculateDistance(userLocation[0], userLocation[1], buyer.latitude, buyer.longitude)} <span className="text-sm font-medium text-gray-400">km</span>
                        </div>
                        <div className="text-xs font-bold text-purple-700 flex items-center gap-1 mt-1 bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                          <Navigation size={12} /> Away
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Govt Centres Section */}
          {filteredCentres.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2 px-1">
                <Building2 size={20} /> Government AMCs
              </h2>
              <div className="flex flex-col gap-4">
                {filteredCentres.map((centre) => (
                  <div key={`list-c-${centre.id}`} className="card p-4 flex flex-col sm:flex-row justify-between sm:items-center bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <div className="flex items-start gap-4 mb-4 sm:mb-0">
                      <div className="mt-1 bg-green-50 p-2 rounded-full text-green-600 border border-green-100">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          {centre.name}
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-100 text-green-800 border border-green-200">
                            Govt
                          </span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">{centre.address}, {centre.district}</p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${centre.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {centre.active ? 'Active' : 'Closed'}
                          </span>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Cap: {centre.daily_capacity} Qtl</span>
                        </div>
                        <div className="mt-2 text-xs font-semibold text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 inline-block">
                          Standard MSP Rates Apply
                        </div>
                      </div>
                    </div>
                    {userLocation && centre.latitude && centre.longitude && (
                      <div className="text-right flex flex-col items-end pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                        <div className="text-lg font-black text-gray-700 tracking-tight">
                          {calculateDistance(userLocation[0], userLocation[1], centre.latitude, centre.longitude)} <span className="text-sm font-medium text-gray-400">km</span>
                        </div>
                        <div className="text-xs font-bold text-green-700 flex items-center gap-1 mt-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                          <Navigation size={12} /> Away
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NearbyCentres;
