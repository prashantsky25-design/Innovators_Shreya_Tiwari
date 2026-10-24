import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { CertificateItem } from '../../types/index.js';
import { Award, Download, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.getMyCertificates();
        if (res.success) {
          setCertificates(res.certificates || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Verified Certificates of Completion
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Official, cryptographically signed credentials generated upon on-site verified attendance
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <Award className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No certificates issued yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Attend your registered events in person and scan your QR ticket pass to automatically receive your credentials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & Issued
                  </div>
                  <span className="font-mono text-xs text-slate-400 font-semibold">{cert.certificateId}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {cert.eventTitle}
                </h3>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>Presented to: <strong>{cert.participantName}</strong></div>
                  <div>Issued Date: {new Date(cert.issuedAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <a
                  href={cert.pdfPath}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center inline-flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
                <a
                  href={`/certificates/verify/${cert.certificateId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-indigo-500 text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5"
                  title="Open Public Verification Link"
                >
                  <ExternalLink className="w-4 h-4" />
                  Verify
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
