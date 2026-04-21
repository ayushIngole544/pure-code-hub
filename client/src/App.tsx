import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

// Teacher
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAssessments from "./pages/teacher/TeacherAssessments";
import CreateAssessment from "./pages/teacher/CreateAssessment";
import TeacherWorkspace from "./pages/teacher/TeacherWorkspace";
import TeacherStudents from "./pages/teacher/TeacherStudents";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAssessments from "./pages/student/StudentAssessments";
import SolveAssessment from "./pages/student/SolveAssessment";
import StudentProgress from "./pages/student/StudentProgress";

// Professional
import ProfessionalDashboard from "./pages/professional/ProfessionalDashboard";
import ProfessionalPractice from "./pages/professional/ProfessionalPractice";
import ProfessionalChallenges from "./pages/professional/ProfessionalChallenges";
import SolveChallenge from "./pages/professional/SolveChallenge";
import ProfessionalEditor from "./pages/professional/ProfessionalEditor"; // ✅ NEW

// Notes
import NotesManager from "./pages/teacher/NotesManager";
import StudentNotes from "./pages/student/StudentNotes";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />

            <Routes>
              {/* ================= PUBLIC ================= */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />

              {/* ================= SHARED ================= */}
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Leaderboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Leaderboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* ================= TEACHER ================= */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <AppLayout>
                      <TeacherDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teacher/assessments"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <AppLayout>
                      <TeacherAssessments />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teacher/create"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <AppLayout>
                      <CreateAssessment />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teacher/workspace"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <AppLayout>
                      <TeacherWorkspace />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teacher/students"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <AppLayout>
                      <TeacherStudents />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/notes"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <AppLayout>
                      <NotesManager />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* ================= STUDENT ================= */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <AppLayout>
                      <StudentDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student/assessments"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <AppLayout>
                      <StudentAssessments />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student/assessments/:id"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <AppLayout>
                      <SolveAssessment />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student/progress"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <AppLayout>
                      <StudentProgress />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/notes"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <AppLayout>
                      <StudentNotes />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* ================= PROFESSIONAL ================= */}
              <Route
                path="/professional/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["professional"]}>
                    <AppLayout>
                      <ProfessionalDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/professional/practice"
                element={
                  <ProtectedRoute allowedRoles={["professional"]}>
                    <AppLayout>
                      <ProfessionalPractice />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* 🔥 NEW EDITOR ROUTE */}
              <Route
                path="/professional/editor"
                element={
                  <ProtectedRoute allowedRoles={["professional"]}>
                    <AppLayout>
                      <ProfessionalEditor />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/professional/challenges"
                element={
                  <ProtectedRoute allowedRoles={["professional"]}>
                    <AppLayout>
                      <ProfessionalChallenges />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/professional/challenges/:id"
                element={
                  <ProtectedRoute allowedRoles={["professional"]}>
                    <AppLayout>
                      <SolveChallenge />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* ================= 404 ================= */}
              <Route path="*" element={<NotFound />} />
            </Routes>

          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}