import { motion } from "framer-motion";
import { Pill, Calendar, Bell, Users } from "lucide-react";
import { Home } from "lucide-react";

{
  /*interface LandingPageProps {
  onGetStarted: () => void;
*/
}
interface LandingPageProps {
  onGetStarted: () => void;
  onGoHome: () => void;
}

{
  /*export default function LandingPage({ onGetStarted }: LandingPageProps)*/
}
export default function LandingPage({
  onGetStarted,
  onGoHome,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Home Button */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={onGoHome}
          className="bg-white dark:bg-gray-800 dark:text-white shadow-lg px-5 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition-all duration-300"
        >
          <Home size={20} />
          <span className="font-semibold">Home</span>
        </button>
      </div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl">
              <Pill size={48} />
            </div>
          </motion.div>

          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MediDoc
          </h1>

          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-12 font-medium">
            Your Family's Smart Medication Manager
          </p>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Upload prescriptions, get automatic reminders, and
            manage your entire family's medications in one
            place.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-blue-600" size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2 dark:text-white">
                Smart OCR
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Automatically extract medication details from
                prescriptions
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="text-purple-600" size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2 dark:text-white">
                Smart Reminders
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Never miss a dose with timely notifications
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2 dark:text-white">
                Family Care
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Manage medications for your entire family
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGetStarted}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center gap-2"
      >
        Get Started
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </motion.button>
    </div>
  );
}