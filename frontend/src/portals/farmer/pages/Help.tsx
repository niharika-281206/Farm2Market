import React from 'react';
import { HelpCircle, Phone, Mail, FileText } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="pb-8 animate-fade-in max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight mb-6">Help & Support</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Need Assistance?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Our support team is available to help you with slot booking, token issues, and payment inquiries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center hover:bg-gray-100 transition-colors cursor-pointer">
            <Phone size={24} className="text-primary mb-3" />
            <h3 className="font-bold text-gray-800">Call Support</h3>
            <p className="text-sm text-gray-500 mt-1">1800-123-4567</p>
            <p className="text-xs text-gray-400 mt-1">(Toll Free)</p>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center hover:bg-gray-100 transition-colors cursor-pointer">
            <Mail size={24} className="text-primary mb-3" />
            <h3 className="font-bold text-gray-800">Email Us</h3>
            <p className="text-sm text-gray-500 mt-1">support@farm2market.com</p>
            <p className="text-xs text-gray-400 mt-1">Reply within 24 hours</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center hover:bg-gray-100 transition-colors cursor-pointer">
            <FileText size={24} className="text-primary mb-3" />
            <h3 className="font-bold text-gray-800">FAQ</h3>
            <p className="text-sm text-gray-500 mt-1">Read our guidelines</p>
            <p className="text-xs text-gray-400 mt-1">Find quick answers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
