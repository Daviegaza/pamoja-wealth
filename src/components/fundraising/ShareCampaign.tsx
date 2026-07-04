import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Copy, Check, MessageCircle,
  Link2, Smartphone, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareCampaignProps {
  campaignTitle: string;
  campaignUrl: string;
  referralCode: string;
  amountRaised: number;
  targetAmount: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareCampaign({
  campaignTitle,
  campaignUrl,
  referralCode,
  amountRaised,
  targetAmount,
  isOpen,
  onClose,
}: ShareCampaignProps) {
  const [copied, setCopied] = useState(false);

  const progressPct = targetAmount > 0 ? Math.round((amountRaised / targetAmount) * 100) : 0;

  const shareText = encodeURIComponent(
    `Support "${campaignTitle}" on Pamoja Wealth! ${progressPct}% raised so far. Every contribution counts ❤️`,
  );

  const referralUrl = `${campaignUrl}?ref=${referralCode}`;
  const shortMessage = encodeURIComponent(
    `Join me in supporting "${campaignTitle}" on Pamoja Wealth!\n\n` +
    `Donate here: ${referralUrl}\n\n` +
    `Use referral code: ${referralCode}`,
  );

  const shareLinks = [
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${shortMessage}`,
    },
    {
      label: 'Twitter / X',
      icon: X,
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(referralUrl)}`,
    },
    {
      label: 'Facebook',
      icon: Share2,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
    },
    {
      label: 'SMS',
      icon: Smartphone,
      color: 'bg-orange-500 hover:bg-orange-600',
      url: `sms:?body=${encodeURIComponent(`Support "${campaignTitle}" on Pamoja Wealth: ${referralUrl}`)}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Share Campaign
                  </h3>
                  <p className="text-sm text-gray-500">Spread the word and earn rewards</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Campaign Summary */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                <p className="font-medium text-emerald-800 dark:text-emerald-200">
                  {campaignTitle}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-emerald-200 dark:bg-emerald-800 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {progressPct}%
                  </span>
                </div>
              </div>

              {/* Referral Code */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Your Referral Code
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-lg font-bold text-amber-700 dark:text-amber-300 tracking-wider">
                    {referralCode}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      copied
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200',
                    )}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Earn KES 500 when someone uses your code to create a chama
                </p>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {shareLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium text-sm transition-all hover:scale-105',
                      link.color,
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all',
                  copied
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Copy Campaign Link
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
