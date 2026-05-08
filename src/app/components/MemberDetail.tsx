import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Pill, Calendar, CheckCircle } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../../lib/supabase';
import ThemeToggle from './ThemeToggle';

interface Prescription {
  id: string;
  hospitalName: string;
  doctorName: string;
  patientName: string;
  medicines: any[];
  uploadDate: string;
  status: string;
}

interface MemberDetailProps {
  member: any;
  onBack: () => void;
  onUploadPrescription: () => void;
}

export default function MemberDetail({ member, onBack, onUploadPrescription }: MemberDetailProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, [member.id]);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`${API_BASE}/prescription/member/${member.id}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (response.ok) {
        setPrescriptions(data.prescriptions);
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const activePrescriptions = prescriptions.filter(p => p.status === 'active');
  const completedPrescriptions = prescriptions.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6"
        >
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-blue-400 to-purple-400 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {member.nickname.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{member.nickname}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">{member.name}</p>
              {member.mobile && (
                <p className="text-gray-500 dark:text-gray-500">{member.mobile}</p>
              )}
            </div>
            <button
              onClick={onUploadPrescription}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
            >
              <Upload size={20} />
              Upload Prescription
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Active Medications */}
            {activePrescriptions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Pill className="text-blue-600 dark:text-blue-400" />
                  Active Medications
                </h3>
                <div className="space-y-4">
                  {activePrescriptions.map((prescription) => (
                    <motion.div
                      key={prescription.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{prescription.hospitalName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Dr. {prescription.doctorName}</p>
                        </div>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                          Active
                        </span>
                      </div>

                      <div className="space-y-2">
                        {prescription.medicines.map((med, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Pill size={18} className="text-gray-400 dark:text-gray-500" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{med.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {med.dosage} • {med.frequencyPerDay}x daily • {med.days} days
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar size={14} className="inline mr-2" />
                        Uploaded: {new Date(prescription.uploadDate).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Medications */}
            {completedPrescriptions.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <CheckCircle className="text-green-600 dark:text-green-400" />
                  Completed
                </h3>
                <div className="space-y-4">
                  {completedPrescriptions.map((prescription) => (
                    <motion.div
                      key={prescription.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 opacity-75"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{prescription.hospitalName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Dr. {prescription.doctorName}</p>
                        </div>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                          Completed
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {prescription.medicines.length} medicine(s) • Completed
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {prescriptions.length === 0 && (
              <div className="text-center py-16">
                <Pill size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Prescriptions Yet</h3>
                <p className="text-gray-500 dark:text-gray-500 mb-6">Upload a prescription to get started</p>
                <button
                  onClick={onUploadPrescription}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
                >
                  Upload First Prescription
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
