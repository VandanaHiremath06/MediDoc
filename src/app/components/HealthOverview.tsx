import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../../lib/supabase';

interface FamilyMemberHealth {
  memberId: string;
  nickname: string;
  name: string;
  status: 'urgent' | 'ongoing' | 'completed' | 'none';
  activeMeds: number;
  missedDoses: number;
  adherenceRate: number;
  lastDoseTaken: string | null;
  totalPrescriptions: number;
  completedPrescriptions: number;
}

interface HealthOverviewProps {
  userId: string;
}

export default function HealthOverview({ userId }: HealthOverviewProps) {
  const [healthData, setHealthData] = useState<FamilyMemberHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthOverview();
  }, [userId]);

  const fetchHealthOverview = async () => {
    try {
      // Fetch family members
      const membersResponse = await fetch(`${API_BASE}/family/members`, {
        headers: getAuthHeaders(),
      });
      const membersData = await membersResponse.json();

      if (membersResponse.ok && membersData.members) {
        const healthPromises = membersData.members.map(async (member: any) => {
          // Fetch prescriptions for each member
          const presResponse = await fetch(`${API_BASE}/prescription/member/${member.id}`, {
            headers: getAuthHeaders(),
          });
          const presData = await presResponse.json();

          const prescriptions = presData.prescriptions || [];
          const activePres = prescriptions.filter((p: any) => p.status === 'active');
          const completedPres = prescriptions.filter((p: any) => p.status === 'completed');

          // Calculate total active medicines
          const activeMeds = activePres.reduce((acc: number, p: any) =>
            acc + (p.medicines?.length || 0), 0);

          // Determine status
          let status: 'urgent' | 'ongoing' | 'completed' | 'none' = 'none';
          let adherenceRate = 100;

          if (activeMeds > 0) {
            status = 'ongoing';
            // TODO: Calculate real adherence from reminder history
            adherenceRate = Math.floor(Math.random() * 30) + 70; // Simulated for now

            if (adherenceRate < 70) {
              status = 'urgent';
            }
          } else if (completedPres.length > 0) {
            status = 'completed';
          }

          return {
            memberId: member.id,
            nickname: member.nickname,
            name: member.name,
            status,
            activeMeds,
            missedDoses: Math.floor((100 - adherenceRate) / 10),
            adherenceRate,
            lastDoseTaken: null,
            totalPrescriptions: prescriptions.length,
            completedPrescriptions: completedPres.length,
          };
        });

        const healthResults = await Promise.all(healthPromises);
        setHealthData(healthResults);
      }
    } catch (err) {
      console.error('Failed to fetch health overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent':
        return 'from-red-500 to-red-600';
      case 'ongoing':
        return 'from-yellow-500 to-yellow-600';
      case 'completed':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'urgent':
        return <AlertCircle size={24} className="text-white" />;
      case 'ongoing':
        return <Clock size={24} className="text-white" />;
      case 'completed':
        return <CheckCircle size={24} className="text-white" />;
      default:
        return <Activity size={24} className="text-white" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'urgent':
        return 'Needs Attention';
      case 'ongoing':
        return 'Active Treatment';
      case 'completed':
        return 'All Complete';
      default:
        return 'No Active Meds';
    }
  };

  const urgentCount = healthData.filter(h => h.status === 'urgent').length;
  const ongoingCount = healthData.filter(h => h.status === 'ongoing').length;
  const completedCount = healthData.filter(h => h.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertCircle size={32} />
            <span className="text-4xl font-bold">{urgentCount}</span>
          </div>
          <p className="text-sm opacity-90">🔴 Urgent</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock size={32} />
            <span className="text-4xl font-bold">{ongoingCount}</span>
          </div>
          <p className="text-sm opacity-90">🟡 Ongoing</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={32} />
            <span className="text-4xl font-bold">{completedCount}</span>
          </div>
          <p className="text-sm opacity-90">🟢 Completed</p>
        </motion.div>
      </div>

      {/* Member Cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {healthData.map((member, index) => (
            <motion.div
              key={member.memberId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Status Header */}
              <div className={`bg-gradient-to-r ${getStatusColor(member.status)} p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(member.status)}
                  <div>
                    <h3 className="text-white font-bold text-lg">{member.nickname}</h3>
                    <p className="text-white text-sm opacity-90">{getStatusLabel(member.status)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-2xl font-bold">{member.adherenceRate}%</p>
                  <p className="text-white text-xs opacity-90">Adherence</p>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active Medications</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{member.activeMeds}</p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Prescriptions</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{member.totalPrescriptions}</p>
                  </div>
                </div>

                {member.status === 'urgent' && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                      ⚠️ {member.missedDoses} missed doses - Please check reminders
                    </p>
                  </div>
                )}

                {member.status === 'ongoing' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <TrendingUp size={16} className="text-green-500" />
                    <span>On track with treatment</span>
                  </div>
                )}

                {member.status === 'completed' && (
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 rounded">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      ✅ {member.completedPrescriptions} prescription(s) completed successfully!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
