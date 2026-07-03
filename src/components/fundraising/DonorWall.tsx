import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trophy, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface Donor {
  id: string;
  name: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  timestamp: string;
}

interface DonorWallProps {
  donors: Donor[];
  totalRaised: number;
  targetAmount: number;
  donorCount: number;
  className?: string;
}

export function DonorWall({ donors, totalRaised, targetAmount, donorCount, className }: DonorWallProps) {
  const progressPct = targetAmount > 0 ? Math.min((totalRaised / targetAmount) * 100, 100) : 0;

  // Sort donors by amount (highest first) for the wall
  const sortedDonors = useMemo(
    () => [...donors].sort((a, b) => b.amount - a.amount),
    [donors],
  );

  // Top donors (top 5)
  const topDonors = sortedDonors.slice(0, 5);

  // Recent donors (last 10)
  const recentDonors = [...donors]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalRaised)}
          </div>
          <div className="text-sm text-gray-500">Raised of {formatCurrency(targetAmount)}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <Users className="w-5 h-5 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {donorCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Donors</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <Trophy className="w-5 h-5 text-amber-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {topDonors[0]?.name || '—'}
          </div>
          <div className="text-sm text-gray-500">Top Donor</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <Heart className="w-5 h-5 text-rose-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(progressPct)}%
          </div>
          <div className="text-sm text-gray-500">Funded</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Campaign Progress
          </span>
          <span className="text-sm font-bold text-emerald-600">
            {Math.round(progressPct)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{formatCurrency(totalRaised)} raised</span>
          <span>{formatCurrency(targetAmount - totalRaised)} remaining</span>
        </div>
      </div>

      {/* Top Donors Leaderboard */}
      {topDonors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Supporters
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {topDonors.map((donor, index) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-750"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      index === 0 && 'bg-amber-100 text-amber-700',
                      index === 1 && 'bg-gray-200 text-gray-600',
                      index === 2 && 'bg-orange-100 text-orange-700',
                      index > 2 && 'bg-gray-100 text-gray-500',
                    )}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {donor.isAnonymous ? 'Anonymous' : donor.name}
                    </p>
                    {donor.message && (
                      <p className="text-xs text-gray-500 line-clamp-1">"{donor.message}"</p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-emerald-600 text-sm">
                  {formatCurrency(donor.amount)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Donations Feed */}
      {recentDonors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Donations</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
            {recentDonors.map((donor) => (
              <div
                key={donor.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {donor.isAnonymous ? 'Anonymous Donor' : donor.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(donor.timestamp).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-600 text-sm">
                    {formatCurrency(donor.amount)}
                  </span>
                  {donor.message && (
                    <p className="text-xs text-gray-500 italic max-w-[200px] truncate">
                      "{donor.message}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
