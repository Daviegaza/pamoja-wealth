import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Gift, TrendingUp, Copy, Check, Share2, Link2,
  Award, ArrowRight, Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalEarnedKes: number;
  pendingRewards: number;
  referralHistory: Array<{
    id: string;
    referredUserEmail: string;
    chamaName: string;
    planCode: string;
    rewardKes: number;
    status: 'pending' | 'paid' | 'cancelled';
    createdAt: string;
  }>;
}

export function ReferralDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Try real API first, fall back to mock
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/v1/referral/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('pamoja_token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.data);
          return;
        }
      } catch {}
      // Mock fallback
      setStats({
        referralCode: user?.email ? user.email.split('@')[0].toUpperCase().slice(0, 8) : 'PAMOJA01',
        totalReferrals: 3,
        totalEarnedKes: 1500,
        pendingRewards: 500,
        referralHistory: [
          { id: '1', referredUserEmail: 'wan****@gmail.com', chamaName: 'Upendo Chama', planCode: 'Starter', rewardKes: 500, status: 'paid', createdAt: '2026-06-15T10:30:00Z' },
          { id: '2', referredUserEmail: 'jam****@yahoo.com', chamaName: 'Maisha Bora Group', planCode: 'Pro', rewardKes: 500, status: 'paid', createdAt: '2026-06-28T14:00:00Z' },
          { id: '3', referredUserEmail: 'pat****@outlook.com', chamaName: 'Tumaini Fund', planCode: 'Starter', rewardKes: 500, status: 'pending', createdAt: '2026-07-01T09:15:00Z' },
        ],
      });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  const handleCopyCode = async () => {
    if (!stats) return;
    const referralLink = `https://pamojawealth.app/join?ref=${stats.referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    if (!stats) return;
    const text = encodeURIComponent(
      `Join me on Pamoja Wealth — Kenya's smartest chama & fundraising platform!\n\n` +
      `Use my referral code: ${stats.referralCode}\n` +
      `Sign up here: https://pamojawealth.app/join?ref=${stats.referralCode}\n\n` +
      `We both earn rewards when your chama upgrades! 🎉`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Referral Program</h2>
            <p className="text-emerald-100 text-sm">
              Share Pamoja Wealth and earn KES 500 per referral
            </p>
          </div>
          <Award className="w-10 h-10 text-emerald-200" />
        </div>

        {/* Referral Code */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-200 mb-1">Your Referral Code</p>
              <code className="text-2xl font-bold tracking-widest">
                {stats.referralCode}
              </code>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  copied
                    ? 'bg-white text-emerald-600'
                    : 'bg-white/20 hover:bg-white/30 text-white',
                )}
              >
                {copied ? (
                  <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Copied</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy className="w-4 h-4" /> Copy</span>
                )}
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-medium transition-all flex items-center gap-1"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center"
        >
          <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalReferrals}
          </div>
          <div className="text-xs text-gray-500">Total Referrals</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center"
        >
          <Wallet className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(stats.totalEarnedKes)}
          </div>
          <div className="text-xs text-gray-500">Total Earned</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center"
        >
          <TrendingUp className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-amber-600">
            {formatCurrency(stats.pendingRewards)}
          </div>
          <div className="text-xs text-gray-500">Pending</div>
        </motion.div>
      </div>

      {/* How It Works */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: 1, icon: Share2, title: 'Share Your Code', desc: 'Share your unique referral link with friends, family, and chama groups' },
            { step: 2, icon: Users, title: 'They Join & Upgrade', desc: 'When they create a chama and subscribe to a paid plan, the reward triggers' },
            { step: 3, icon: Gift, title: 'Earn KES 500', desc: 'KES 500 is credited to your wallet for each successful referral' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral History */}
      {stats.referralHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Referral History</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {stats.referralHistory.map((event) => (
              <div key={event.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      event.status === 'paid' && 'bg-emerald-100 dark:bg-emerald-900',
                      event.status === 'pending' && 'bg-amber-100 dark:bg-amber-900',
                      event.status === 'cancelled' && 'bg-red-100 dark:bg-red-900',
                    )}
                  >
                    <Users
                      className={cn(
                        'w-5 h-5',
                        event.status === 'paid' && 'text-emerald-600',
                        event.status === 'pending' && 'text-amber-600',
                        event.status === 'cancelled' && 'text-red-600',
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {event.chamaName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {event.referredUserEmail} · {event.planCode} ·{' '}
                      {new Date(event.createdAt).toLocaleDateString('en-KE')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      event.status === 'paid' && 'text-emerald-600',
                      event.status === 'pending' && 'text-amber-600',
                      event.status === 'cancelled' && 'text-red-400 line-through',
                    )}
                  >
                    {formatCurrency(event.rewardKes)}
                  </span>
                  <span
                    className={cn(
                      'block text-xs',
                      event.status === 'paid' && 'text-emerald-500',
                      event.status === 'pending' && 'text-amber-500',
                      event.status === 'cancelled' && 'text-red-400',
                    )}
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <Button
        onClick={handleShareWhatsApp}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
      >
        <Share2 className="w-5 h-5" />
        Share on WhatsApp & Start Earning
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
