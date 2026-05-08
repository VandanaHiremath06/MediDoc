import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomePage from "./components/HomePage";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import FamilyDashboard from "./components/FamilyDashboard";
import MemberDetail from "./components/MemberDetail";
import PrescriptionUpload from "./components/PrescriptionUpload";
import RemindersHistory from "./components/RemindersHistory";
import ExplorePage from "./components/ExplorePage";
import { isAuthenticated } from "../lib/supabase";
import { useReminders } from "../Hooks/UseReminders";
import { ThemeProvider } from "../Contexts/ThemeContext";

type Page =
  | "home"
  | "landing"
  | "auth"
  | "dashboard"
  | "member-detail"
  | "upload"
  | "history"
  | "explore";

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  nickname: string;
  mobile: string;
  index: number;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [userId, setUserId] = useState<string>("");
  const [selectedMember, setSelectedMember] =
    useState<FamilyMember | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  // Initialize reminders
  useReminders(notificationsEnabled && !!userId);

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated()) {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
        setCurrentPage("dashboard");
      }
    }
  }, []);

  const handleAuthSuccess = (id: string) => {
    setUserId(id);
    setCurrentPage("dashboard");
  };

  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setCurrentPage("member-detail");
  };

  const handleNavigate = (
    page: "upload" | "history" | "explore",
  ) => {
    setCurrentPage(page);
  };

  {
    /*const handleUploadPrescription = () => {
    setCurrentPage("upload");
  };*/
  }
  const handleUploadPrescription = () => {
    if (!selectedMember) return;

    setSelectedMember(selectedMember);
    setCurrentPage("upload");
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);

    if (!notificationsEnabled && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
        <AnimatePresence mode="wait">
          {currentPage === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* <HomePage onGetStarted={() => setCurrentPage('auth')} />*/}
              <HomePage
                onGetStarted={() => setCurrentPage("landing")}
              />
            </motion.div>
          )}

          {currentPage === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/*<LandingPage onGetStarted={() => setCurrentPage('auth')} />*/}
              <LandingPage
                onGetStarted={() => setCurrentPage("auth")}
                onGoHome={() => setCurrentPage("home")}
              />
            </motion.div>
          )}

          {currentPage === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AuthPage
                onBack={() => setCurrentPage("landing")}
                onAuthSuccess={handleAuthSuccess}
              />
            </motion.div>
          )}

          {currentPage === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FamilyDashboard
                onSelectMember={handleSelectMember}
                onNavigate={handleNavigate}
                onToggleNotifications={toggleNotifications}
                notificationsEnabled={notificationsEnabled}
                onGoHome={() => setCurrentPage("landing")}
              />
            </motion.div>
          )}

          {currentPage === "member-detail" &&
            selectedMember && (
              <motion.div
                key="member-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MemberDetail
                  member={selectedMember}
                  onBack={() => setCurrentPage("dashboard")}
                  onUploadPrescription={
                    handleUploadPrescription
                  }
                />
              </motion.div>
            )}

          {currentPage === "upload" && selectedMember && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/*<PrescriptionUpload
                memberId={selectedMember.id}
                memberName={selectedMember.nickname}
                onBack={() => setCurrentPage("member-detail")}
                onSuccess={handleUploadSuccess}
              />*/}
              {currentPage === "upload" && (
                <PrescriptionUpload
                  memberId={selectedMember.id}
                  memberName={selectedMember.name}
                  onBack={() => setCurrentPage("dashboard")}
                  onSuccess={() => setCurrentPage("dashboard")}
                />
              )}
            </motion.div>
          )}

          {currentPage === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RemindersHistory
                onBack={() => setCurrentPage("dashboard")}
              />
            </motion.div>
          )}

          {currentPage === "explore" && (
            <motion.div
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ExplorePage
                onBack={() => setCurrentPage("dashboard")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}