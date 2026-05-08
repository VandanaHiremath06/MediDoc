import { useEffect, useState, useRef } from 'react';
import { API_BASE, getAuthHeaders } from '../lib/supabase';

interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  timings: string[];
  memberId: string;
  status: string;
}

export function useReminders(enabled: boolean) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const checkIntervalRef = useRef<number | null>(null);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      return;
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Fetch reminders
    fetchReminders();

    // Check every minute
    checkIntervalRef.current = window.setInterval(() => {
      checkAndNotify();
    }, 60000);

    // Initial check
    checkAndNotify();

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [enabled]);

  const fetchReminders = async () => {
    try {
      const response = await fetch(`${API_BASE}/reminders/active`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (response.ok) {
        setReminders(data.reminders);
      }
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    }
  };

  const checkAndNotify = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    reminders.forEach((reminder) => {
      reminder.timings.forEach((time) => {
        const notificationKey = `${reminder.id}:${time}:${now.toDateString()}`;

        if (time === currentTime && !notifiedRef.current.has(notificationKey)) {
          showNotification(reminder, time);
          notifiedRef.current.add(notificationKey);

          // Clean up old notifications (keep only today's)
          const today = now.toDateString();
          notifiedRef.current.forEach((key) => {
            if (!key.endsWith(today)) {
              notifiedRef.current.delete(key);
            }
          });
        }
      });
    });
  };

  const showNotification = (reminder: Reminder, time: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('MediDoc Reminder', {
        body: `Time to take ${reminder.medicineName} (${reminder.dosage}) at ${time}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: reminder.id,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        handleNotificationAction(reminder.id, 'taken');
        notification.close();
      };

      // Auto-close after 30 seconds
      setTimeout(() => notification.close(), 30000);
    }
  };

  const handleNotificationAction = async (reminderId: string, action: 'taken' | 'snoozed' | 'ignored') => {
    try {
      await fetch(`${API_BASE}/reminders/log`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          reminderId,
          action,
          timestamp: new Date().toISOString(),
        }),
      });

      // Refresh reminders
      fetchReminders();
    } catch (err) {
      console.error('Failed to log reminder action:', err);
    }
  };

  return {
    reminders,
    handleNotificationAction,
  };
}
