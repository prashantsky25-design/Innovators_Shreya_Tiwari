import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Radio } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                ES
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                EventSphere
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Hyperlocal event discovery, verified QR attendance, automated certificates, and community gamification platform built for modern creators, developers, and local builders.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Hyperlocal Node Active • Live Verification Engine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/events" className="hover:text-indigo-600 dark:hover:text-indigo-400">Explore Events</Link></li>
              <li><Link to="/leaderboard" className="hover:text-indigo-600 dark:hover:text-indigo-400">Community Leaderboard</Link></li>
              <li><Link to="/participant/rewards" className="hover:text-indigo-600 dark:hover:text-indigo-400">EventCoins & Badges</Link></li>
              <li><Link to="/organizer/events/new" className="hover:text-indigo-600 dark:hover:text-indigo-400">Host an Event</Link></li>
            </ul>
          </div>

          {/* Tech & Verification */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              Security & Trust
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Tamper-Proof QR Tickets</li>
              <li>Deterministic Vector PDF Certificates</li>
              <li>MongoDB Atomic Ledgers</li>
              <li>Privacy-Conscious Opt-In</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div>
            © {new Date().getFullYear()} EventSphere Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" /> for the Hyperlocal Community
          </div>
        </div>
      </div>
    </footer>
  );
};
