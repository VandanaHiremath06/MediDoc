import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Clock, Ban } from 'lucide-react';

interface ReminderNotification {
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
}

interface ReminderNotificationPanelProps {
  notifications: ReminderNotification[];
  onAction: (reminderId: string, action: 'taken' | 'snoozed' | 'ignored') => void;
  onClose: (reminderId: string) => void;
}

export default function ReminderNotificationPanel({
  notifications,
  onAction,
  onClose,
}: ReminderNotificationPanelProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl p-4 border-l-4 border-blue-600"
          >
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Bell className="text-blue-600" size={20} />
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Medication Reminder
                </h4>
                <p className="text-sm text-gray-700 mb-1">
                  {notification.medicineName}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {notification.dosage} • {notification.time}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => onAction(notification.id, 'taken')}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-1"
                  >
                    <Check size={16} />
                    Taken
                  </button>

                  <button
                    onClick={() => onAction(notification.id, 'snoozed')}
                    className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 flex items-center justify-center gap-1"
                  >
                    <Clock size={16} />
                    Snooze
                  </button>

                  <button
                    onClick={() => onAction(notification.id, 'ignored')}
                    className="flex-1 bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-500 flex items-center justify-center gap-1"
                  >
                    <Ban size={16} />
                    Ignore
                  </button>
                </div>
              </div>

              <button
                onClick={() => onClose(notification.id)}
                aria-label = "Remove Image"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
