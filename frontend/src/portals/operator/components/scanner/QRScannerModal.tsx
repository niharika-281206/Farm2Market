import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useQueue } from '../../context/QueueContext';
import { bookingService } from '../../services/bookingService';
import { QueueItem } from '../../types';
import { QueueBadge } from '../common/Badge';
import { QrCode, Camera, CheckCircle2, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { maskName } from '../../utils/privacy';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';

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
          () => {}
        );
      } else {
        throw new Error('No cameras found on this device.');
      }
    }).then(() => {
      isInitializingRef.current = false;
    }).catch((err) => {
      setError('Camera error: ' + (err.message || 'Permissions not granted.'));
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
      toast.success(`${updated.farmerName} (${updated.token}) marked as ARRIVED!`, { duration: 4000 });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to mark farmer arrived.';
      setError(msg);
      toast.error(msg);
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
      onClose={() => { resetScanner(); onClose(); }}
      title="Gate Arrival — QR Scanner"
      subtitle="Scan farmer booking QR or enter token manually"
      maxWidth="lg"
    >
      <div className="space-y-5">

        {/* Camera Area */}
        <div className="relative rounded-xl bg-slate-100 border border-slate-200 overflow-hidden min-h-[180px] flex flex-col items-center justify-center">
          {cameraActive ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
              <div id="qr-reader" className="w-full h-full" style={{ minHeight: '180px' }} />
            </div>
          ) : (
            <div className="text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 border border-green-100 mx-auto flex items-center justify-center">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-700 text-sm">Camera Scanner</h4>
                <p className="text-xs text-slate-500 mt-0.5">Point camera at farmer QR or use token lookup below</p>
              </div>
              <button
                type="button"
                onClick={() => setCameraActive(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all"
              >
                <Camera className="w-4 h-4 text-green-600" />
                Open Camera
              </button>
            </div>
          )}
        </div>

        {/* Quick Test Tokens */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Token Lookup</span>
          <div className="flex flex-wrap gap-2">
            {['TK-1047', 'TK-1048', 'TK-1049', 'TK-1050', 'TK-1044'].map(t => (
              <button
                key={t}
                onClick={() => { setManualToken(t); handleFetchBooking(t); }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700 text-slate-600 text-xs font-mono font-bold transition-all"
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <input
              type="text"
              value={manualToken}
              onChange={e => setManualToken(e.target.value)}
              placeholder="Enter Token (e.g. TK-1047)"
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-green-500"
            />
            <button
              onClick={() => handleFetchBooking(manualToken)}
              disabled={loading || !manualToken.trim()}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs disabled:opacity-50 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'FETCH'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {scannedItem && (
          <div className="p-5 rounded-xl bg-green-50 border border-green-200 space-y-4">
            <div className="flex items-center justify-between border-b border-green-200 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-green-600 uppercase">Match Found</span>
                <h3 className="text-xl font-extrabold text-slate-800 font-mono">{scannedItem.token}</h3>
              </div>
              <QueueBadge status={scannedItem.status} size="lg" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Farmer:</span>
                <strong className="text-slate-800">{maskName(scannedItem.farmerName, privacyMode)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Farmer ID:</span>
                <strong className="text-slate-700 font-mono">{scannedItem.farmerId}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Crop:</span>
                <strong className="text-slate-700">{scannedItem.crop}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Quantity:</span>
                <strong className="text-green-700">{scannedItem.bookedQuantity} Quintals</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Slot:</span>
                <strong className="text-slate-700">{scannedItem.slot}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Phone:</span>
                <strong className="text-slate-700 font-mono">{scannedItem.farmerPhone}</strong>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetScanner}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Scan Another
              </button>

              {scannedItem.status !== 'ARRIVED' && scannedItem.status !== 'PROCESSING' && scannedItem.status !== 'COMPLETED' && scannedItem.status !== 'WAITING' ? (
                <button
                  type="button"
                  onClick={handleConfirmArrived}
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  MARK AS ARRIVED
                </button>
              ) : (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Already Checked In
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
