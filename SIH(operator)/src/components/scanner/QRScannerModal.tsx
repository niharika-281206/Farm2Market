import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useQueue } from '../../context/QueueContext';
import { bookingService } from '../../services/bookingService';
import { QueueItem } from '../../types';
import { QueueBadge } from '../common/Badge';
import { QrCode, Camera, CheckCircle2, AlertCircle, RefreshCw, Sparkles, UserCheck } from 'lucide-react';
import { maskName } from '../../utils/privacy';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const { markFarmerArrived, privacyMode } = useQueue();
  const [manualToken, setManualToken] = useState<string>('TK-1047');
  const [scannedItem, setScannedItem] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const handleFetchBooking = async (token: string) => {
    if (!token.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const item = await bookingService.getBookingByToken(token.trim());
      setScannedItem(item);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking token not found.';
      setError(msg);
      setScannedItem(null);
    } finally {
      setLoading(false);
    }
  };

  const isInitializingRef = useRef(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Initialize camera feed when modal opens
  useEffect(() => {
    if (!isOpen || !cameraActive) {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        }).catch(() => {
           scannerRef.current?.clear();
           scannerRef.current = null;
        });
      }
      return;
    }

    if (isInitializingRef.current || scannerRef.current) return;
    
    isInitializingRef.current = true;
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        // Use the last camera in the list (usually the back camera on mobile)
        // or the only camera on a laptop.
        const cameraId = devices.length > 1 ? devices[devices.length - 1].id : devices[0].id;
        
        return scanner.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (decodedText) {
              setManualToken(decodedText);
              handleFetchBooking(decodedText);
              setCameraActive(false);
            }
          },
          (errorMessage) => {
            // Continuously prints errors when no QR is found.
            // We ignore this to avoid console spam.
          }
        );
      } else {
        throw new Error('No cameras found on this device.');
      }
    }).then(() => {
      isInitializingRef.current = false;
    }).catch((err) => {
      console.warn('Camera access error:', err);
      setError('Camera error: ' + (err.message || 'Permissions not granted or camera unavailable.'));
      setCameraActive(false);
      isInitializingRef.current = false;
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        }).catch(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cameraActive]);

  const handleConfirmArrived = async () => {
    if (!scannedItem) return;
    try {
      setLoading(true);
      const updated = await markFarmerArrived(scannedItem.token);
      setScannedItem(updated);
      alert(`Farmer ${updated.farmerName} (${updated.token}) successfully marked as ARRIVED at Procurement Centre Gate!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to mark farmer arrived.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedItem(null);
    setError(null);
    setManualToken('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetScanner();
        onClose();
      }}
      title="Gate Arrival QR Code Scanner"
      subtitle="Scan farmer booking QR code to fetch details and confirm arrival at procurement centre"
      maxWidth="lg"
    >
      <div className="space-y-6">
        
        {/* Camera Feed or Simulated Scanner Box */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden min-h-[220px] flex flex-col items-center justify-center p-4">
          
          {cameraActive ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center">
              <div id="qr-reader" className="w-full h-full" style={{ minHeight: '220px' }}></div>
            </div>
          ) : (
            <div className="text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Browser Camera Scanner</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Point camera at farmer QR pass or use quick code lookup below
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCameraActive(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Turn On Live WebCam</span>
              </button>
            </div>
          )}

        </div>

        {/* Quick Test QR Code Preset Selector */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Simulated QR Test Code Selector</span>
            </span>
            <span className="text-slate-500 text-[11px]">Instant Lookup</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {['TK-1047', 'TK-1048', 'TK-1049', 'TK-1050', 'TK-1044'].map(t => (
              <button
                key={t}
                onClick={() => {
                  setManualToken(t);
                  handleFetchBooking(t);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 text-xs font-mono font-bold transition-all"
              >
                Scan {t}
              </button>
            ))}
          </div>

          {/* Manual Input Search */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={manualToken}
              onChange={e => setManualToken(e.target.value)}
              placeholder="Enter Token Number (e.g. TK-1047)"
              className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleFetchBooking(manualToken)}
              disabled={loading || !manualToken.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'FETCH'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scanned Farmer Result Preview */}
        {scannedItem && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/40 space-y-4 glow-emerald">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                  QR SCAN RESULT MATCHED
                </span>
                <h3 className="text-xl font-extrabold text-white font-mono">
                  {scannedItem.token}
                </h3>
              </div>
              <QueueBadge status={scannedItem.status} size="lg" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Farmer Name:</span>
                <strong className="text-white text-sm">
                  {maskName(scannedItem.farmerName, privacyMode)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Farmer ID:</span>
                <strong className="text-slate-200 font-mono">{scannedItem.farmerId}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Crop & Variety:</span>
                <strong className="text-slate-200">{scannedItem.crop}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Booked Quantity:</span>
                <strong className="text-emerald-400 text-sm">{scannedItem.bookedQuantity} Quintals</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Booked Slot:</span>
                <strong className="text-slate-200">{scannedItem.slot}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Phone Number:</span>
                <strong className="text-slate-200 font-mono">{scannedItem.farmerPhone}</strong>
              </div>
            </div>

            {/* Arrive Confirmation Action */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetScanner}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Scan Another Code
              </button>
              
              {scannedItem.status !== 'ARRIVED' && scannedItem.status !== 'PROCESSING' && scannedItem.status !== 'COMPLETED' ? (
                <button
                  type="button"
                  onClick={handleConfirmArrived}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg glow-emerald flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>MARK FARMER AS ARRIVED</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Farmer Already Checked In
                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};
