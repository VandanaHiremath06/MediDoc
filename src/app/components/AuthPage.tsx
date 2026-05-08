import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { API_BASE, supabase } from "../../lib/supabase.ts";

interface FamilyMember {
  name: string;
  nickname: string;
  mobile: string;
  photo?: string; // Base64 encoded photo
}

interface AuthPageProps {
  onBack: () => void;
  onAuthSuccess: (userId: string, token: string) => void;
}

export default function AuthPage({
  onBack,
  onAuthSuccess,
}: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"credentials" | "family">(
    "credentials",
  );

  // Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Family setup
  const [familyCount, setFamilyCount] = useState("");
  const [familyMembers, setFamilyMembers] = useState<
    FamilyMember[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFamilyCountSubmit = () => {
    const count = parseInt(familyCount);
    if (isNaN(count) || count < 1 || count > 20) {
      setError("Please enter a valid number between 1 and 20");
      return;
    }
    setFamilyMembers(
      Array(count)
        .fill(null)
        .map(() => ({
          name: "",
          nickname: "",
          mobile: "",
        })),
    );
    setStep("family");
  };

  const updateFamilyMember = (
    index: number,
    field: keyof FamilyMember,
    value: string,
  ) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert(
          "Image too large. Please choose an image under 2MB.",
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        updateFamilyMember(
          index,
          "photo",
          reader.result as string,
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async () => {
    // Validate family members
    const invalidMembers = familyMembers.some(
      (m) => !m.name || !m.nickname,
    );
    if (invalidMembers) {
      setError(
        "Please fill in name and nickname for all family members",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Create auth user with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              name: name,
            },
          },
        });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      const userId = authData.user.id;

      // Step 2: Auto-login to get auth token
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (loginError) {
        // Signup succeeded but auto-login failed - just show login page
        alert("Signup successful! Please login.");
        setMode("login");
        return;
      }

      // Get the access token
      const accessToken = loginData.session.access_token;

      // Step 3: Save user profile and family members to backend with auth token
      try {
        console.log("Saving profile to backend...", {
          userId,
          email,
          name,
          familyMembersCount: familyMembers.length,
        });

        const response = await fetch(
          `${API_BASE}/auth/save-profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              userId: userId,
              email: email,
              name: name,
              familyMembers: familyMembers,
            }),
          },
        );

        const data = await response.json();
        console.log("Backend save response:", data);

        if (!response.ok) {
          console.error("Failed to save profile:", data);
          throw new Error(
            data.error || "Failed to save profile data",
          );
        }

        console.log("Profile saved successfully!");
      } catch (saveError) {
        console.error("Profile save error:", saveError);
        throw saveError; // Don't continue if profile save fails
      }

      // Success - save tokens and proceed
      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("userId", loginData.user.id);
      onAuthSuccess(loginData.user.id, accessToken);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session) {
        throw new Error("Login failed - no session");
      }

      // Save tokens
      localStorage.setItem(
        "authToken",
        data.session.access_token,
      );
      localStorage.setItem("userId", data.user.id);

      onAuthSuccess(data.user.id, data.session.access_token);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 transition-colors">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {mode === "login" ? "Welcome Back" : "Get Started"}
          </h2>

          {mode === "login" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          ) : (
            <>
              {step === "credentials" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Number of Family Members
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={familyCount}
                      onChange={(e) =>
                        setFamilyCount(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="e.g., 4"
                    />
                  </div>

                  <button
                    onClick={handleFamilyCountSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90"
                  >
                    Next: Add Family Members
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      onClick={() => setMode("login")}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </div>
              )}

              {step === "family" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Family Members
                    </h3>
                    <button
                      onClick={() => setStep("credentials")}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      ← Edit Count
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {familyMembers.map((member, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
                      >
                        <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                          {member.nickname ||
                            `Member ${index + 1}`}
                        </h4>

                        {/* Profile Photo Upload */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Profile Photo
                          </label>
                          <div className="flex items-center gap-4">
                            {member.photo ? (
                              <div className="relative">
                                <img
                                  src={member.photo}
                                  alt={member.name || "Profile"}
                                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                                />
                                <button
                                  onClick={() =>
                                    updateFamilyMember(
                                      index,
                                      "photo",
                                      "",
                                    )
                                  }
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
                                {member.nickname?.[0]?.toUpperCase() ||
                                  "?"}
                              </div>
                            )}
                            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                              {member.photo
                                ? "Change Photo"
                                : "Upload Photo"}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handlePhotoUpload(e, index)
                                }
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) =>
                              updateFamilyMember(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Full Name *"
                          />
                          <input
                            type="text"
                            value={member.nickname}
                            onChange={(e) =>
                              updateFamilyMember(
                                index,
                                "nickname",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Nickname *"
                          />
                          <input
                            type="tel"
                            value={member.mobile}
                            onChange={(e) =>
                              updateFamilyMember(
                                index,
                                "mobile",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {loading
                      ? "Creating Account..."
                      : "Complete Signup"}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}