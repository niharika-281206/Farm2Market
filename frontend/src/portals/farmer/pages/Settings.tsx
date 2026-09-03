import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSetting = (setter: React.Dispatch<React.SetStateAction<boolean>>, name: string) => {
    setter(prev => {
      const newState = !prev;
      toast.success(`${name} ${newState ? 'enabled' : 'disabled'}`);
      return newState;
    });
  };

  return (
    <div className="pb-8 animate-fade-in max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight mb-6">Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <SettingsIcon className="text-gray-400" />
          <h2 className="text-lg font-bold text-gray-800">Account Preferences</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {/* Notifications */}
          <div 
            className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => toggleSetting(setNotifications, 'Notifications')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <p className="text-sm text-gray-500">Manage SMS and push notifications</p>
              </div>
            </div>
            <div>
              {notifications ? <ToggleRight size={32} className="text-primary" /> : <ToggleLeft size={32} className="text-gray-400" />}
            </div>
          </div>
          
          {/* Security */}
          <div 
            className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => toggleSetting(setTwoFactor, 'Two-Factor Authentication')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <div>
              {twoFactor ? <ToggleRight size={32} className="text-primary" /> : <ToggleLeft size={32} className="text-gray-400" />}
            </div>
          </div>

          {/* Display */}
          <div 
            className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => toggleSetting(setDarkMode, 'Dark Mode')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Dark Mode</h3>
                <p className="text-sm text-gray-500">Switch to dark theme</p>
              </div>
            </div>
            <div>
              {darkMode ? <ToggleRight size={32} className="text-primary" /> : <ToggleLeft size={32} className="text-gray-400" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
