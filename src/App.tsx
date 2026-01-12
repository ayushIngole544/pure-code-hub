import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAssessments from "./pages/teacher/TeacherAssessments";
import CreateAssessment from "./pages/teacher/CreateAssessment";
import TeacherWorkspace from "./pages/teacher/TeacherWorkspace";
import TeacherStudents from "./pages/teacher/TeacherStudents";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAssessments from "./pages/student/StudentAssessments";
import SolveAssessment from "./pages/student/SolveAssessment";
import StudentProgress from "./pages/student/StudentProgress";

// Professional pages
import ProfessionalDashboard from "./pages/professional/ProfessionalDashboard";
import ProfessionalPractice from "./pages/professional/ProfessionalPractice";
import ProfessionalChallenges from "./pages/professional/ProfessionalChallenges";
import SolveChallenge from "./pages/professional/SolveChallenge";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />

              {/* Teacher routes */}
              <Route path="/teacher/dashboard" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <AppLayout><TeacherDashboard /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/teacher/assessments" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <AppLayout><TeacherAssessments /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/teacher/create" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <AppLayout><CreateAssessment /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/teacher/workspace" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <AppLayout><TeacherWorkspace /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/teacher/students" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <AppLayout><TeacherStudents /></AppLayout>
                </ProtectedRoute>
              } />

              {/* Student routes */}
              <Route path="/student/dashboard" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AppLayout><StudentDashboard /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/student/assessments" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AppLayout><StudentAssessments /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/student/assessments/:id" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SolveAssessment />
                </ProtectedRoute>
              } />
              <Route path="/student/progress" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AppLayout><StudentProgress /></AppLayout>
                </ProtectedRoute>
              } />

              {/* Professional routes */}
              <Route path="/professional/dashboard" element={
                <ProtectedRoute allowedRoles={['professional']}>
                  <AppLayout><ProfessionalDashboard /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/professional/practice" element={
                <ProtectedRoute allowedRoles={['professional']}>
                  <AppLayout><ProfessionalPractice /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/professional/challenges" element={
                <ProtectedRoute allowedRoles={['professional']}>
                  <AppLayout><ProfessionalChallenges /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/professional/challenges/:id" element={
                <ProtectedRoute allowedRoles={['professional']}>
                  <SolveChallenge />
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
