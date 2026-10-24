import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../services/api.js';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Keyboard,
  Camera,
  CameraOff,
  X,
  Sparkles,
} from 'lucide-react';
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
  const [activeMode, setActiveMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerId = useRef(`qr-reader-${Math.random().toString(36).substring(2, 9)}`);
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);
  const isMountedRef = useRef(true);

  const stopScanner = async () => {
    if (scannerInstanceRef.current) {
      try {
        if (scannerInstanceRef.current.isScanning) {
          await scannerInstanceRef.current.stop();
        }
        scannerInstanceRef.current.clear();
      } catch (err) {
        // Ignore stop error
      }
      scannerInstanceRef.current = null;
    }

    const container = document.getElementById(scannerId.current);
    if (container) {
      container.innerHTML = '';
    }

    if (isMountedRef.current) {
      setIsCameraRunning(false);
    }
  };

  const startScanner = async () => {
    if (isStartingRef.current || scannerInstanceRef.current?.isScanning) {
      return;
    }

    isStartingRef.current = true;
    setCameraError(null);

    // Ensure any existing instance and container are cleanly reset
    await stopScanner();

    // Check if container element exists in DOM
    const container = document.getElementById(scannerId.current);
    if (!container) {
      isStartingRef.current = false;
      return;
    }
    container.innerHTML = '';

    try {
      const html5QrCode = new Html5Qrcode(scannerId.current);
      scannerInstanceRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          // Play check-in audio beep
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

      if (isMountedRef.current) {
        setIsCameraRunning(true);
      }
    } catch (err: any) {
      console.warn('Camera initialization issue:', err);
      if (isMountedRef.current) {
        setIsCameraRunning(false);
        setCameraError(
          err.message || 'Camera access pending or not permitted. You can use manual code entry.'
        );
      }
    } finally {
      isStartingRef.current = false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (activeMode === 'camera') {
      const timer = setTimeout(() => {
        startScanner();
      }, 150);

      return () => {
        clearTimeout(timer);
        isMountedRef.current = false;
        stopScanner();
      };
    } else {
      stopScanner();
    }

    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, [activeMode]);

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
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Official QR Ticket Terminal</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Verified attendance gate verification</p>
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

      {/* Mode Switcher Tabs */}
      <div className="p-4 pb-0">
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveMode('camera');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
              activeMode === 'camera'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Camera className="w-4 h-4" />
            Live Camera Scanner
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('manual');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
              activeMode === 'manual'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual Code Entry
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeMode === 'camera' ? (
          <div className="space-y-3">
            {/* Single Clean Camera Viewport Container */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 min-h-[280px] flex items-center justify-center border border-slate-800">
              {/* Exactly one unique div ID for html5-qrcode */}
              <div id={scannerId.current} className="w-full" />

              {!isCameraRunning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3 bg-slate-950/90 z-20">
                  <div className="p-3 rounded-full bg-slate-900 border border-slate-800">
                    <CameraOff className="w-8 h-8 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-300">
                      {cameraError ? cameraError : 'Camera stream is idle.'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Ensure camera permissions are allowed in your browser.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startScanner}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    Start Camera
                  </button>
                </div>
              )}
            </div>

            {isCameraRunning && (
              <div className="flex items-center justify-between px-2 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Camera active & scanning for QR tickets...
                </span>
                <button
                  type="button"
                  onClick={stopScanner}
                  className="text-slate-400 hover:text-red-500 text-[11px] underline"
                >
                  Pause Camera
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Manual Code Entry Panel */
          <form onSubmit={handleManualSubmit} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Enter or Paste Ticket Pass Code (e.g. ESP-XXXXXX-XXXXXX)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="ESP-A1B2C3-D4E5F6"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono uppercase"
              />
              <button
                type="submit"
                disabled={loading || !manualCode}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
              >
                {loading ? 'Verifying...' : 'Check In'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Type the human-readable ticket code shown on the attendee's mobile ticket pass or email.
            </p>
          </form>
        )}

        {/* Scan Result Feedback Alert */}
        {scanResult && (
          <div
            className={`p-4 rounded-2xl border transition-all ${
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
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+10 EventCoins credited & Certificate issued</span>
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
                      This ticket was already checked in. Repeat attendance was prevented.
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
      </div>
    </div>
  );
};
