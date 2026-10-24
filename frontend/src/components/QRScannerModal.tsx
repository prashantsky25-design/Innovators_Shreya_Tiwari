import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { api } from '../services/api.js';
import { QrCode, CheckCircle2, AlertTriangle, XCircle, Volume2, Keyboard, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QRScannerModalProps {
  eventId?: string;
  onClose?: () => void;
  onSuccessCheckIn?: (data: any) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  eventId,
  onClose,
  onSuccessCheckIn,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-region');
      scannerInstanceRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          // Play audio feedback
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          } catch (e) {}

          await handleProcessTokenOrCode(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera initialization warning:', err);
      setIsCameraActive(false);
    }
  };

  const stopScanner = async () => {
    if (scannerInstanceRef.current && scannerInstanceRef.current.isScanning) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current.clear();
      } catch (e) {}
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const handleProcessTokenOrCode = async (tokenOrCode: string) => {
    if (!tokenOrCode || loading) return;
    setLoading(true);
    setScanResult(null);

    try {
      const res = await api.scanTicket({ tokenOrCode: tokenOrCode.trim(), eventId });
      setScanResult({
        type: 'success',
        data: res,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      if (onSuccessCheckIn) {
        onSuccessCheckIn(res);
      }
    } catch (err: any) {
      // Check if duplicate scan
      if (err.message && err.message.toLowerCase().includes('already checked in')) {
        setScanResult({
          type: 'duplicate',
          message: err.message,
        });
      } else {
        setScanResult({
          type: 'error',
          message: err.message || 'Verification failed. Invalid or fraudulent ticket.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) {
      handleProcessTokenOrCode(manualCode);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Official QR Ticket Scanner</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live attendance verification node</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Scanner Viewport */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 min-h-[260px] flex items-center justify-center border border-slate-800">
          <div id="qr-reader-region" className="w-full" />
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <QrCode className="w-12 h-12 text-slate-600 mb-2 stroke-1" />
              <p className="text-xs">Camera stream idle or permissions pending.</p>
              <button
                onClick={startScanner}
                className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                Start Camera
              </button>
            </div>
          )}
        </div>

        {/* Scan Result Feedback Alert */}
        {scanResult && (
          <div
            className={`p-4 rounded-xl border transition-all ${
              scanResult.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : scanResult.type === 'duplicate'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.type === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />}
              {scanResult.type === 'duplicate' && <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />}
              {scanResult.type === 'error' && <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />}

              <div className="space-y-1 text-xs">
                {scanResult.type === 'success' && (
                  <>
                    <div className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
                      Attendance Verified!
                    </div>
                    <div>Participant: <strong>{scanResult.data.participant?.name || 'Attendee'}</strong></div>
                    <div>Ticket Code: <code className="font-mono font-bold">{scanResult.data.ticketCode}</code></div>
                    <div>Checked in at: {new Date(scanResult.data.verifiedAt).toLocaleTimeString()}</div>
                    <div className="mt-2 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span>🎉 +10 EventCoins credited & Certificate issued</span>
                    </div>
                  </>
                )}

                {scanResult.type === 'duplicate' && (
                  <>
                    <div className="font-bold text-sm text-amber-700 dark:text-amber-300">
                      Duplicate Scan Detected
                    </div>
                    <div>{scanResult.message}</div>
                    <div className="text-[11px] text-amber-600 dark:text-amber-400">
                      This ticket was already scanned. Duplicate attendance prevented.
                    </div>
                  </>
                )}

                {scanResult.type === 'error' && (
                  <>
                    <div className="font-bold text-sm text-red-700 dark:text-red-300">
                      Check-in Failed
                    </div>
                    <div>{scanResult.message}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Code Input Option */}
        <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5" />
            Manual Ticket Pass Code Entry (e.g. ESP-XXXXX-XXXXX)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste ticket code or token"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono"
            />
            <button
              type="submit"
              disabled={loading || !manualCode}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
            >
              {loading ? 'Checking...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
