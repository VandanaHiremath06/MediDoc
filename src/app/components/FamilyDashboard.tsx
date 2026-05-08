import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Upload,
  History,
  Compass,
  LogOut,
  Bell,
  BellOff,
  Home,
} from "lucide-react";
import {
  API_BASE,
  getAuthHeaders,
  logout,
} from "../../lib/supabase";
import Logo from "./Logo";

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  nickname: string;
  mobile: string;
  index: number;
  photo?: string; // Base64 encoded profile photo
}

interface FamilyDashboardProps {
  onSelectMember: (member: FamilyMember) => void;
  onNavigate: (page: "upload" | "history" | "explore") => void;
  onToggleNotifications: () => void;
  notificationsEnabled: boolean;
  onGoHome: () => void;
}

export default function FamilyDashboard({
  onSelectMember,
  onNavigate,
  onToggleNotifications,
  notificationsEnabled,
  onGoHome,
}: FamilyDashboardProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      console.log("Fetching family members...");
      console.log("API_BASE:", API_BASE);
      console.log("Auth headers:", getAuthHeaders());

      const response = await fetch(
        `${API_BASE}/family/members`,
        {
          headers: getAuthHeaders(),
        },
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.members) {
        console.log("Members found:", data.members.length);
        setMembers(
          data.members.sort(
            (a: FamilyMember, b: FamilyMember) =>
              a.index - b.index,
          ),
        );
      } else {
        console.warn("No members returned or error:", data);
        setMembers([]);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo
            size="md"
            onClick={() => window.location.reload()}
          />
          <div className="flex items-center gap-3">
            {/* <ThemeToggle /> */}
            <button
              onClick={onGoHome}
              className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
              title="Home"
            >
              <Home size={20} />
            </button>
            <button
              onClick={onToggleNotifications}
              className={`p-2 rounded-lg ${
                notificationsEnabled
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
              title={
                notificationsEnabled
                  ? "Notifications enabled"
                  : "Notifications disabled"
              }
            >
              {notificationsEnabled ? (
                <Bell size={20} />
              ) : (
                <BellOff size={20} />
              )}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (members.length > 0) {
                onSelectMember(members[0]);
                onNavigate("upload");
              }
            }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl flex items-center gap-4 transition-colors"
          >
            <div className="bg-blue-100 p-3 rounded-full">
              <Upload className="text-blue-600" size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Upload Prescription
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add new medication
              </p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("history")}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl flex items-center gap-4 transition-colors"
          >
            <div className="bg-purple-100 p-3 rounded-full">
              <History className="text-purple-600" size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">History</h3>
              <p className="text-sm text-gray-600">
                View past reminders
              </p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("explore")}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl flex items-center gap-4 transition-colors"
          >
            <div className="bg-green-100 p-3 rounded-full">
              <Compass className="text-green-600" size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Explore</h3>
              <p className="text-sm text-gray-600">
                Health & wellness
              </p>
            </div>
          </motion.button>
        </div>

        {/* Family Members */}
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Family Members
        </h2>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : members.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center"
          >
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-yellow-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Backend Not Deployed Yet
            </h3>
            <p className="text-gray-700 mb-4 max-w-lg mx-auto">
              To save family member data and use all features,
              you need to deploy the Supabase Edge Function.
            </p>
            <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto mb-4">
              <p className="font-semibold mb-2">
                How to Deploy:
              </p>
              <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
                <li>Click the Settings icon in Figma Make</li>
                <li>Go to the Supabase section</li>
                <li>Click "Deploy Edge Function"</li>
                <li>
                  Wait for deployment to complete (~30 seconds)
                </li>
                <li>Refresh this page</li>
              </ol>
            </div>
            <p className="text-sm text-gray-600">
              For now, you can explore the UI and features
              without data persistence.
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => onSelectMember(member)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl p-6 cursor-pointer border border-transparent dark:border-gray-700"
              >
                {/* Header with Nickname */}
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {member.nickname}
                  </h3>
                </div>

                <div className="flex flex-col items-center gap-3">
                  {/* Profile Photo */}
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.nickname}
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-400 dark:border-purple-500 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {member.nickname.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Member Details */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {member.name}
                    </p>
                    {member.mobile && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.mobile}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Click to view medications
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}