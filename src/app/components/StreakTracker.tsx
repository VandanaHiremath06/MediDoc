import { motion } from 'framer-motion';
import { Flame, Award, Target, TrendingUp, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDosesTaken: number;
  perfectDays: number;
}

interface StreakTrackerProps {
  memberId: string;
  memberName: string;
}

// Simulated data - in production, fetch from backend
const streakData: StreakData = {
  currentStreak: 7,
  longestStreak: 14,
  totalDosesTaken: 42,
  perfectDays: 5,
};

const badges = [
  { id: '3day', name: '3-Day Starter', icon: '🌟', requirement: 3, unlocked: true },
  { id: '7day', name: '7-Day Champion', icon: '🏆', requirement: 7, unlocked: true },
  { id: '14day', name: 'Two-Week Warrior', icon: '⚡', requirement: 14, unlocked: false },
  { id: '30day', name: 'Monthly Master', icon: '👑', requirement: 30, unlocked: false },
  { id: 'perfect', name: 'Perfect Week', icon: '💎', requirement: 7, unlocked: true },
  { id: 'century', name: '100 Doses', icon: '💯', requirement: 100, unlocked: false },
];

export default function StreakTracker({ memberId: _memberId, memberName: _memberName }: StreakTrackerProps) {
  const handleBadgeClick = (badge: typeof badges[0]) => {
    if (badge.unlocked) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const streakPercentage = Math.min((streakData.currentStreak / 30) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
          <Flame size={32} className="text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold dark:text-white">Health Streak</h3>
          <p className="text-gray-600 dark:text-gray-400">Keep the momentum going!</p>
        </div>
      </div>

      {/* Current Streak - Hero Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-32 translate-y-32 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 text-center">
          <Flame size={64} className="mx-auto mb-4" />
          <p className="text-7xl font-bold mb-2">{streakData.currentStreak}</p>
          <p className="text-2xl font-semibold mb-6">Day Streak! 🔥</p>

          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Progress to 30 days</span>
              <span className="font-bold">{Math.round(streakPercentage)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${streakPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-white h-full rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center"
        >
          <Trophy className="mx-auto mb-2 text-yellow-500" size={32} />
          <p className="text-3xl font-bold mb-1 dark:text-white">{streakData.longestStreak}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center"
        >
          <Target className="mx-auto mb-2 text-blue-500" size={32} />
          <p className="text-3xl font-bold mb-1 dark:text-white">{streakData.totalDosesTaken}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Doses</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center"
        >
          <Award className="mx-auto mb-2 text-green-500" size={32} />
          <p className="text-3xl font-bold mb-1 dark:text-white">{streakData.perfectDays}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Perfect Days</p>
        </motion.div>
      </div>

      {/* Badges & Achievements */}
      <div>
        <h4 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
          <Award className="text-yellow-500" size={24} />
          Achievements
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge, idx) => (
            <motion.button
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleBadgeClick(badge)}
              className={`${
                badge.unlocked
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              } rounded-2xl p-6 text-center transform transition-all hover:scale-105 ${
                badge.unlocked ? 'shadow-xl' : 'opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <p className={`font-semibold text-sm ${badge.unlocked ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                {badge.name}
              </p>
              {!badge.unlocked && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {badge.requirement} {badge.id.includes('day') ? 'days' : 'doses'}
                </p>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-start gap-4">
          <TrendingUp size={32} className="flex-shrink-0" />
          <div>
            <h4 className="font-bold text-lg mb-2">🎉 Amazing Progress!</h4>
            <p className="text-sm opacity-90">
              {streakData.currentStreak >= 7
                ? `You've been consistent for ${streakData.currentStreak} days! Keep up the fantastic work!`
                : `You're ${7 - streakData.currentStreak} days away from your first week badge!`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Daily Checklist Preview */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
        <h5 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Today's Status</h5>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
            <span className="text-blue-800 dark:text-blue-400">Morning dose (9:00 AM)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
            <span className="text-blue-800 dark:text-blue-400">Afternoon dose (2:00 PM)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs">◯</div>
            <span className="text-gray-600 dark:text-gray-400">Evening dose (8:00 PM) - Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
