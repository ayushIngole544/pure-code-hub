import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Navbar } from "@/components/Navbar";

import {
  User,
  Mail,
  Shield,
  Save,
  CheckCircle,
  TrendingUp,
  Code,
  Target,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "@/services/user";

export default function Profile() {
  const { user } = useAuth();
  const { submissions, assessments } = useData();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  // 🔥 FILTER USER SUBMISSIONS
  const mySubmissions = submissions.filter(
    (s) => s.student_id === user?.id
  );

  const correctSubmissions = mySubmissions.filter(
    (s) => s.status === "ACCEPTED"
  ).length;

  const uniqueAssessments = new Set(
    mySubmissions.map((s) => s.assessment_id)
  ).size;

  const accuracy =
    mySubmissions.length > 0
      ? (correctSubmissions / mySubmissions.length) * 100
      : 0;

  // 🔥 SAVE PROFILE
  const handleSave = async () => {
    if (!user || !name.trim()) return;

    setSaving(true);

    try {
      await updateProfile(name.trim());

      // update local storage user
      const updatedUser = { ...user, name };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast({
        title: "Profile updated",
        description: "Your name has been updated successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  // 🔥 LANGUAGE STATS
  const languageStats = mySubmissions.reduce((acc, s) => {
    const lang = s.language || "Unknown";

    if (!acc[lang]) acc[lang] = { total: 0, correct: 0 };

    acc[lang].total++;
    if (s.status === "ACCEPTED") acc[lang].correct++;

    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  return (
    <>

      <div className="page-container">
        <h1 className="text-2xl font-bold text-white mb-6">
          My Profile
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* PROFILE */}
          <div className="card-elevated">

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-yellow-400">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>

              <span className="px-3 py-1 bg-gray-700 rounded-full text-sm capitalize text-white">
                {user?.role}
              </span>
            </div>

            <div className="space-y-4">

              <div>
                <label className="flex gap-2 text-sm text-gray-300">
                  <User className="w-4 h-4" /> Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="flex gap-2 text-sm text-gray-300">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input
                  value={user?.email || ""}
                  readOnly
                  className="input-field opacity-60"
                />
              </div>

              <div>
                <label className="flex gap-2 text-sm text-gray-300">
                  <Shield className="w-4 h-4" /> Role
                </label>
                <input
                  value={user?.role || ""}
                  readOnly
                  className="input-field opacity-60"
                />
              </div>

              <button
                onClick={handleSave}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </button>

            </div>
          </div>

          {/* STATS */}
          <div className="lg:col-span-2 space-y-6">

            {/* CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="stat-card text-center">
                <Code className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-xl text-white">
                  {mySubmissions.length}
                </p>
                <p className="text-gray-400 text-sm">
                  Submissions
                </p>
              </div>

              <div className="stat-card text-center">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-xl text-green-400">
                  {correctSubmissions}
                </p>
                <p className="text-gray-400 text-sm">
                  Solved
                </p>
              </div>

              <div className="stat-card text-center">
                <Target className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-xl text-white">
                  {accuracy.toFixed(0)}%
                </p>
                <p className="text-gray-400 text-sm">
                  Accuracy
                </p>
              </div>

              <div className="stat-card text-center">
                <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-xl text-white">
                  {uniqueAssessments}
                </p>
                <p className="text-gray-400 text-sm">
                  Assessments
                </p>
              </div>

            </div>

            {/* LANGUAGE */}
            <div className="card-elevated">
              <h2 className="text-white mb-4">
                Language Breakdown
              </h2>

              {Object.keys(languageStats).length > 0 ? (
                <div className="space-y-3">

                  {Object.entries(languageStats).map(
                    ([lang, stats]) => {
                      const pct =
                        (stats.correct / stats.total) * 100;

                      return (
                        <div key={lang}>
                          <div className="flex justify-between text-sm text-gray-300 mb-1">
                            <span>{lang}</span>
                            <span>
                              {stats.correct}/{stats.total}
                            </span>
                          </div>

                          <div className="h-2 bg-gray-700 rounded">
                            <div
                              className="h-2 bg-yellow-400 rounded"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}

                </div>
              ) : (
                <p className="text-gray-400 text-center py-6">
                  No submissions yet
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}