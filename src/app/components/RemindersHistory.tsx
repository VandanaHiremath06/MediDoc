import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../../lib/supabase';
import ThemeToggle from './ThemeToggle';

interface RemindersHistoryProps {
  onBack: () => void;
}

export default function RemindersHistory({ onBack }: RemindersHistoryProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedMemberId) {
      fetchHistory();
    }
  }, [selectedMemberId]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE}/family/members`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (response.ok && data.members.length > 0) {
        const sorted = data.members.sort((a: any, b: any) => a.index - b.index);
        setMembers(sorted);
        setSelectedMemberId(sorted[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/reminders/history/${selectedMemberId}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (response.ok) {
        setReminders(data.reminders);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'taken':
        return <CheckCircle size={16} className="text-green-600 dark:text-green-400" />;
      case 'snoozed':
        return <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />;
      case 'ignored':
        return <XCircle size={16} className="text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'taken':
        return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'snoozed':
        return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'ignored':
        return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reminders History
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : (
            <>
              {/* Member Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Family Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  aria-label = "Select Family Memeber"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.nickname}
                    </option>
                  ))}
                </select>
              </div>

              {/* History */}
              {reminders.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  No reminder history for this member yet
                </div>
              ) : (
                <div className="space-y-6">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{reminder.medicineName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{reminder.dosage}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          reminder.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {reminder.status}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Schedule:</strong> {reminder.frequencyPerDay}x daily for {reminder.totalDays} days
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Times:</strong> {reminder.timings.join(', ')}
                        </p>
                      </div>

                      {reminder.history.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white">History:</p>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {reminder.history.map((entry: any, idx: number) => (
                              <div
                                key={idx}
                                className={`flex items-center gap-3 p-2 rounded-lg ${getActionColor(entry.action)}`}
                              >
                                {getActionIcon(entry.action)}
                                <span className="text-sm capitalize">{entry.action}</span>
                                <span className="text-xs ml-auto">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
