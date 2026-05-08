import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { API_BASE } from '../../lib/supabase';

interface FamilyMember {
  name: string;
  nickname: string;
  mobile: string;
}

interface SetupProfileProps {
  userId: string;
  accessToken: string;
  onComplete: () => void;
}

export default function SetupProfile({ userId, accessToken, onComplete }: SetupProfileProps) {
  const [familyCount, setFamilyCount] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [step, setStep] = useState<'count' | 'members'>('count');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCountSubmit = () => {
    const count = parseInt(familyCount);
    if (isNaN(count) || count < 1 || count > 20) {
      setError('Please enter a valid number between 1 and 20');
      return;
    }
    setFamilyMembers(
      Array(count)
        .fill(null)
        .map(() => ({
          name: '',
          nickname: '',
          mobile: '',
        }))
    );
    setStep('members');
  };

  const updateMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const handleSave = async () => {
    const invalidMembers = familyMembers.some((m) => !m.name || !m.nickname);
    if (invalidMembers) {
      setError('Please fill in name and nickname for all family members');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/save-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: userId,
          email: '',
          name: '',
          familyMembers: familyMembers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save profile');
      }

      onComplete();
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Complete Your Profile
          </h2>
          <p className="text-gray-600">Add your family members to get started</p>
        </div>

        {step === 'count' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                How many family members do you want to track?
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={familyCount}
                onChange={(e) => setFamilyCount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 4"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleCountSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Family Members</h3>
              <button
                onClick={() => setStep('count')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Change Count
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-4">
              {familyMembers.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Member {index + 1}</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Full Name *"
                    />
                    <input
                      type="text"
                      value={member.nickname}
                      onChange={(e) => updateMember(index, 'nickname', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Nickname *"
                    />
                    <input
                      type="tel"
                      value={member.mobile}
                      onChange={(e) => updateMember(index, 'mobile', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Mobile (optional)"
                    />
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
