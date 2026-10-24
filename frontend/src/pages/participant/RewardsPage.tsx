import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import {
  Coins,
  Award,
  Trophy,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const RewardsPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await api.getRewardsDashboard();
        if (res.success) {
          setData(res);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Wallet Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-100 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              EventCoins Virtual Economy Wallet
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black">{data?.balance || 0}</span>
              <span className="text-lg font-bold text-amber-100">EventCoins Available</span>
            </div>
          </div>

          {/* Level Badge */}
          <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-center sm:text-right">
            <div className="text-[10px] text-amber-100 uppercase font-semibold">Current Tier</div>
            <div className="text-base font-extrabold flex items-center gap-1.5 justify-center sm:justify-end">
              <span>{data?.levelBadge}</span>
              <span>{data?.level}</span>
            </div>
          </div>
        </div>

        {/* 100-Coin Centurion Milestone Progress Bar */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span>Progress toward 100-Coin Centurion Milestone</span>
            <span>{data?.totalEarned || 0} / 100 Coins ({data?.centurionProgress || 0}%)</span>
          </div>
          <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${data?.centurionProgress || 0}%` }}
            />
          </div>
          <div className="text-[11px] text-amber-100">
            Earn +10 EventCoins for each verified event attendance. Unlocks special badges and rewards!
          </div>
        </div>
      </div>

      {/* Milestone Achievements Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Community Milestone Badges
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unlock badges automatically by attending verified hyperlocal events
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.achievements?.map((ach: any) => (
            <div
              key={ach._id}
              className={`p-5 rounded-2xl border transition-all ${
                ach.isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-3 rounded-xl ${
                    ach.isUnlocked
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {ach.isUnlocked ? <Trophy className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    ach.isUnlocked
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {ach.tier}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{ach.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {ach.description}
              </p>

              {/* Progress bar inside card */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Progress</span>
                  <span className="font-semibold">{ach.currentMetric} / {ach.threshold}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${ach.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coin Transaction Ledger */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Coin Transaction Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable audit trail of credited EventCoins and reasons
          </p>
        </div>

        {data?.transactions?.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No coin transactions recorded yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {data?.transactions?.map((tx: any) => (
              <div key={tx._id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {tx.reason}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    +{tx.amount} Coins
                  </div>
                  <div className="text-[10px] text-slate-400">Balance: {tx.balanceAfter}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
