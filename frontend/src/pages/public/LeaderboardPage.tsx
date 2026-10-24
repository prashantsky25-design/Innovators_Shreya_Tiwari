import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { Award, Trophy, Medal, Coins, Calendar, ShieldCheck, Sparkles } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.getLeaderboard();
        if (res.success) {
          setLeaderboard(res.leaderboard);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-1">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Community Engagement Leaderboard
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Celebrating our most active participants. Ranked strictly through verified event attendance and completed milestones.
        </p>
      </div>

      {/* Opt-in Privacy Banner */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 justify-center">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Privacy-conscious: Only participants with leaderboard display enabled are ranked.</span>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">
            No participants ranked yet. Attend verified events to earn EventCoins!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {leaderboard.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 sm:p-5 transition-colors ${
                  item.isCurrentUser
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Rank & User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center font-extrabold text-base">
                    {item.rank === 1 && <Medal className="w-6 h-6 text-amber-500 mx-auto" />}
                    {item.rank === 2 && <Medal className="w-6 h-6 text-slate-400 mx-auto" />}
                    {item.rank === 3 && <Medal className="w-6 h-6 text-amber-700 mx-auto" />}
                    {item.rank > 3 && <span className="text-slate-400">#{item.rank}</span>}
                  </div>

                  <div className="flex items-center gap-3">
                    {item.avatarUrl ? (
                      <img src={item.avatarUrl} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-semibold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.organization || 'Independent Builder'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6 text-right">
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{item.eventsAttended}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Attended</div>
                  </div>

                  <div>
                    <div className="text-sm font-extrabold text-amber-500 flex items-center gap-1 justify-end">
                      <Coins className="w-4 h-4" />
                      <span>{item.totalCoins}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">EventCoins</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
