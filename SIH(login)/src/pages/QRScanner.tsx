import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

const QRScanner: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScan = (result: any) => {
    console.log('Scanner result:', result);
    if (result) {
      if (Array.isArray(result) && result.length > 0 && result[0].rawValue) {
        setScanResult(result[0].rawValue);
      } else if (typeof result === 'string') {
        setScanResult(result);
      } else if (result.text) {
        setScanResult(result.text);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scan Token QR Code</h1>
      
      <div className="card mb-4 bg-white p-4">
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <Scanner 
            onScan={handleScan}
            formats={['qr_code']}
          />
        </div>
        <p className="text-center text-muted text-sm mt-3">Point your camera at a Farmer's Token QR code.</p>
      </div>

      {scanResult && (
        <div className="card bg-green-50 border-green-200">
          <h2 className="text-lg font-bold text-green-800 mb-2">Scanned Data Successfully:</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-3 rounded-lg border border-green-100 text-gray-800">
            {scanResult}
          </pre>
          <button 
            className="btn btn-primary w-full mt-4" 
            onClick={() => setScanResult(null)}
          >
            Scan Another QR
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
