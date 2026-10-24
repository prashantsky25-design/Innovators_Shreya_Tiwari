import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { Award, Palette, QrCode, Check, Eye } from 'lucide-react';

export const CertificateEditorPage: React.FC = () => {
  const [name, setName] = useState('TechInnovate Official Certificate Template');
  const [title, setTitle] = useState('CERTIFICATE OF EXCELLENCE');
  const [subtitle, setSubtitle] = useState('THIS IS PROUDLY PRESENTED TO');
  const [bodyText, setBodyText] = useState(
    'for demonstrated technical excellence, active engagement, and verified attendance at'
  );
  const [signatureName, setSignatureName] = useState('Marcus Vance');
  const [signatureTitle, setSignatureTitle] = useState('Lead Convener & Program Director');
  const [primaryColor, setPrimaryColor] = useState('#4338ca');
  const [accentColor, setAccentColor] = useState('#d97706');
  const [showQr, setShowQr] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await api.saveCertificateTemplate({
        name,
        title,
        subtitle,
        bodyText,
        signatureName,
        signatureTitle,
        primaryColor,
        accentColor,
        showQr,
        isDefault: true,
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Certificate Template Designer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure dynamic fields and custom styling. Deterministic vector PDFs will be generated automatically for attendees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Editor Controls Form */}
        <form
          onSubmit={handleSave}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
        >
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              Certificate template saved successfully as default!
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Template Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Certificate Header Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Certificate Body Text</label>
            <textarea
              rows={2}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Signer Name</label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Signer Title</label>
              <input
                type="text"
                value={signatureTitle}
                onChange={(e) => setSignatureTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
                />
                <span className="text-xs font-mono">{primaryColor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Accent Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
                />
                <span className="text-xs font-mono">{accentColor}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Embed Verification QR Code
            </div>
            <input
              type="checkbox"
              checked={showQr}
              onChange={(e) => setShowQr(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
          >
            {saving ? 'Saving...' : 'Save & Set as Default Template'}
          </button>
        </form>

        {/* Real-time Visual Template Preview */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-500" />
            Live Layout Preview (A4 Vector Projection)
          </div>

          <div
            className="w-full aspect-[1.414/1] rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-center shadow-2xl relative overflow-hidden transition-all"
            style={{
              backgroundColor: '#fafafa',
              border: `4px solid ${accentColor}`,
            }}
          >
            {/* Inner border */}
            <div
              className="absolute inset-3 rounded-2xl pointer-events-none"
              style={{ border: `1.5px solid ${primaryColor}` }}
            />

            {/* Header */}
            <div className="relative space-y-1 pt-2">
              <div
                className="w-8 h-8 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: primaryColor }}
              >
                ES
              </div>
              <h2
                className="text-lg sm:text-xl font-extrabold tracking-wide"
                style={{ color: primaryColor }}
              >
                {title}
              </h2>
              <p className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {subtitle}
              </p>
            </div>

            {/* Recipient */}
            <div className="relative space-y-1 my-2">
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                Aarav Sharma
              </div>
              <div
                className="w-36 h-0.5 mx-auto rounded"
                style={{ backgroundColor: accentColor }}
              />
              <p className="text-[10px] sm:text-[11px] text-slate-600 max-w-sm mx-auto leading-relaxed pt-1">
                {bodyText}
              </p>
              <div
                className="font-bold text-xs sm:text-sm pt-0.5"
                style={{ color: primaryColor }}
              >
                "Hyperlocal AI & Generative Tech Summit"
              </div>
            </div>

            {/* Footer with Signatures & QR */}
            <div className="relative flex items-end justify-between pt-2 px-2 text-left">
              {showQr ? (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-slate-900 rounded p-1 flex items-center justify-center text-white">
                    <QrCode className="w-10 h-10" />
                  </div>
                  <div className="text-[9px] text-slate-400">
                    <div>Scan to Verify</div>
                    <div className="font-mono text-slate-600 font-bold">CERT-2026-XXXX</div>
                  </div>
                </div>
              ) : (
                <div />
              )}

              <div className="text-right space-y-0.5">
                <div className="w-28 h-0.5 bg-slate-300 ml-auto" />
                <div className="text-xs font-bold text-slate-900">{signatureName}</div>
                <div className="text-[9px] text-slate-500">{signatureTitle}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
