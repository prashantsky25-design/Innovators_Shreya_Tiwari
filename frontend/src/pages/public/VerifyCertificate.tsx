import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ShieldCheck, CheckCircle2, XCircle, Download, Calendar, MapPin, Award } from 'lucide-react';

export const VerifyCertificate: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certData, setCertData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!certificateId) return;
      try {
        const res = await api.verifyCertificate(certificateId);
        if (res.success) {
          setCertData(res.certificate);
        }
      } catch (err: any) {
        setError(err.message || 'Invalid or revoked certificate ID.');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [certificateId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8 text-center">
      <div className="space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-1">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Certificate Verification
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Official Elevate Hyperlocal Cryptographic Verification Registry
        </p>
      </div>

      {loading ? (
        <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
          <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center space-y-3">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="font-bold text-red-700 dark:text-red-300 text-base">Verification Failed</h3>
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-left">
          {/* Status Seal */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                Official & Verified Certificate
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                Issued by Elevate with server-validated attendance timestamp.
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-4 border-t border-b border-slate-100 dark:border-slate-800 py-6 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Recipient Name</span>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {certData.participantName}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Event Title</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-right max-w-xs">
                {certData.eventTitle}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Event Date</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(certData.eventDate).toLocaleDateString('en-US', { dateStyle: 'long' })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Certificate Serial ID</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {certData.certificateId}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Issuance Timestamp</span>
              <span className="text-slate-600 dark:text-slate-400 font-mono">
                {new Date(certData.issuedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={certData.pdfPath}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center inline-flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              Download Verified PDF Certificate
            </a>
            <Link
              to="/events"
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-center"
            >
              Explore More Events
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
