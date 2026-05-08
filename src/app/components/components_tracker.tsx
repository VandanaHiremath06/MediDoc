import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';

interface AdherenceTrackerProps {
  memberId: string;
  memberName: string;
}

// Simulated data - in production, fetch from backend
const adherenceData = [
  { date: 'Mon', percentage: 100 },
  { date: 'Tue', percentage: 90 },
  { date: 'Wed', percentage: 100 },
  { date: 'Thu', percentage: 85 },
  { date: 'Fri', percentage: 100 },
  { date: 'Sat', percentage: 95 },
  { date: 'Sun', percentage: 100 },
];

export default function AdherenceTracker({ memberName }: AdherenceTrackerProps) {
  const overallAdherence = 95;
  const weeklyCompletion = 100;
  const currentStreak = 7;
  const longestStreak = 14;

  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 90) return '#10B981'; // green
    if (percentage >= 70) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const getAdherenceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 70) return 'Good';
    return 'Needs Improvement';
  };

  const adherenceLabelClass =
    overallAdherence >= 90
      ? 'text-emerald-500'
      : overallAdherence >= 70
      ? 'text-amber-500'
      : 'text-rose-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold mb-1 dark:text-white">Medicine Adherence</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Tracking treatment adherence for {memberName}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Overall Adherence */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <h4 className="font-semibold mb-4 dark:text-white">Overall Adherence</h4>
          <div className="w-32 h-32 mx-auto mb-4">
            <CircularProgressbar
              value={overallAdherence}
              text={`${overallAdherence}%`}
              styles={buildStyles({
                textColor: getAdherenceColor(overallAdherence),
                pathColor: getAdherenceColor(overallAdherence),
                trailColor: '#E5E7EB',
                textSize: '20px',
              })}
            />
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium ${adherenceLabelClass}`}>
              {getAdherenceLabel(overallAdherence)}
            </p>
          </div>
        </motion.div>

        {/* Weekly Completion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Target size={20} />
            This Week
          </h4>
          <div className="text-center">
            <p className="text-6xl font-bold mb-2">{weeklyCompletion}%</p>
            <p className="text-sm opacity-90">Completion Rate</p>
          </div>
          <div className="mt-4 bg-white/20 rounded-lg p-3">
            <p className="text-xs">All doses taken on time! 🎉</p>
          </div>
        </motion.div>

        {/* Current Streak */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white"
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Award size={20} />
            Current Streak
          </h4>
          <div className="text-center">
            <p className="text-6xl font-bold mb-2">{currentStreak}</p>
            <p className="text-sm opacity-90">Days 🔥</p>
          </div>
          <div className="mt-4 bg-white/20 rounded-lg p-3 text-center">
            <p className="text-xs">Longest: {longestStreak} days</p>
          </div>
        </motion.div>
      </div>

      {/* Adherence Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
          <h4 className="font-semibold text-lg dark:text-white">7-Day Adherence Trend</h4>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={adherenceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Badges & Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
      >
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Award size={20} />
          Achievements Unlocked
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🏆', label: '7-Day Streak', unlocked: true },
            { icon: '⭐', label: 'Perfect Week', unlocked: true },
            { icon: '💪', label: '90% Adherence', unlocked: true },
            { icon: '🎯', label: '30-Day Goal', unlocked: false },
          ].map((badge, idx) => (
            <div
              key={idx}
              className={`${
                badge.unlocked ? 'bg-white/20' : 'bg-white/10 opacity-50'
              } rounded-xl p-4 text-center`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className="text-xs font-medium">{badge.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
        <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">💡 Pro Tip</h4>
        <p className="text-sm text-blue-800 dark:text-blue-400">
          Set alarms on your phone 5 minutes before each dose time to maintain your streak!
        </p>
      </div>
    </div>
  );
}
