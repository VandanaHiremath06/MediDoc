import { motion } from "framer-motion";
import {
  Shield,
  Heart,
  Bell,
  Users,
  Lock,
  Smartphone,
  TrendingUp,
  Award,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

interface HomePageProps {
  onGetStarted: () => void;
}

export default function HomePage({
  onGetStarted,
}: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Logo */}
      <div className="fixed top-6 left-6 z-50">
        <Logo size="md" />
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-5xl mx-auto mb-20"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-3xl shadow-2xl">
              <Heart size={64} className="text-white" />
            </div>
          </div>

          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MediDoc
          </h1>

          <p className="text-3xl text-gray-700 dark:text-gray-300 mb-6 font-medium">
            Your Family's Smart Health Companion
          </p>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Manage prescriptions, track medications, never miss
            a dose, and keep your entire family's health records
            secure—all in one intelligent platform.
          </p>

          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
          >
            Start Your Health Journey
          </button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            {
              icon: Shield,
              title: "AES-256 Encrypted",
              description:
                "Bank-level security for all your health data",
              color: "blue",
            },
            {
              icon: Bell,
              title: "Smart Reminders",
              description:
                "Never miss a medication with intelligent alerts",
              color: "purple",
            },
            {
              icon: Users,
              title: "Family Tracking",
              description:
                "Manage health for your entire family",
              color: "green",
            },
            {
              icon: TrendingUp,
              title: "Health Analytics",
              description:
                "Track adherence and see your progress",
              color: "orange",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              {/*<div className={`bg-${feature.color}-100 dark:bg-${feature.color}-900 w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}>*/}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  feature.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-900"
                    : feature.color === "purple"
                      ? "bg-purple-100 dark:bg-purple-900"
                      : feature.color === "green"
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-orange-100 dark:bg-orange-900"
                }`}
              >
                <feature.icon
                  className={`text-${feature.color}-600`}
                  size={32}
                />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Key Features */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">
            Everything You Need for Family Health
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                icon: Smartphone,
                title: "AI-Powered OCR",
                description:
                  "Advanced deep learning automatically extracts prescription details from photos—hospital names, doctor information, medicines, dosages, and timing—with high accuracy.",
                features: [
                  "Named Entity Recognition",
                  "Smart Data Extraction",
                  "Auto-Fill Forms",
                ],
              },
              {
                icon: Lock,
                title: "Emergency QR Codes",
                description:
                  "Generate secure QR codes for each family member. In emergencies, doctors can scan to access complete health history instantly.",
                features: [
                  "Instant Access",
                  "Encrypted Data",
                  "Share Securely",
                ],
              },
              {
                icon: Award,
                title: "Gamified Health Tracking",
                description:
                  "Stay motivated with streaks, adherence percentages, and achievement badges. Make health management engaging for the whole family.",
                features: [
                  "Daily Streaks",
                  "Adherence Stats",
                  "Family Leaderboard",
                ],
              },
              {
                icon: TrendingUp,
                title: "Doctor Memory System",
                description:
                  "Track which doctor prescribed what medication, when, and from which hospital. Build a complete medical history over time.",
                features: [
                  "Source Tracking",
                  "Pattern Recognition",
                  "Historical Insights",
                ],
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{
                  opacity: 0,
                  x: idx % 2 === 0 ? -20 : 20,
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-2xl flex-shrink-0">
                    <item.icon
                      className="text-white"
                      size={32}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {item.description}
                    </p>
                    <ul className="space-y-2">
                      {item.features.map((feat, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white text-center"
        >
          <Lock size={48} className="mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">
            Your Privacy is Our Priority
          </h2>
          <p className="text-xl mb-6 max-w-3xl mx-auto opacity-90">
            All data is encrypted with AES-256 encryption at
            rest and in transit. We never share your health
            information with third parties.
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <div>✓ HIPAA Compliant Design</div>
            <div>✓ End-to-End Encryption</div>
            <div>✓ Secure Cloud Storage</div>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-20">
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all inline-flex items-center gap-3"
          >
            Get Started Free
            <svg
              className="w-6 h-6"
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
          </button>
          <p className="text-gray-600 dark:text-gray-300 mt-4">
            No credit card required • Set up in 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}