import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { StatCard } from "@/components/StatCard";
import { AssessmentCard } from "@/components/AssessmentCard";
import { useNavigate } from "react-router-dom";

import {
  FileText,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  TrendingUp,
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { assessments, submissions } = useData();
  const navigate = useNavigate();

  // 🔥 FIX 1: correct field
  const myAssessments = assessments.filter(
    (a) => a.teacherId === user?.id
  );

  const myAssessmentIds = myAssessments.map((a) => a.id);

  // 🔥 FIX 2: correct field
  const mySubmissions = submissions.filter((s) =>
    myAssessmentIds.includes(s.assignmentId)
  );

  // 🔥 STATUS handling
  const correctSubmissions = mySubmissions.filter(
    (s) => s.status === "ACCEPTED"
  ).length;

  const totalAttempts = mySubmissions.length;
  const wrongSubmissions = totalAttempts - correctSubmissions;

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your teaching activity
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <StatCard
          title="Total Assessments"
          value={myAssessments.length}
          icon={<FileText className="w-6 h-6" />}
          description="Created by you"
        />

        <StatCard
          title="Student Attempts"
          value={totalAttempts}
          icon={<Users className="w-6 h-6" />}
        />

        <StatCard
          title="Correct Submissions"
          value={correctSubmissions}
          icon={<CheckCircle className="w-6 h-6 text-easy" />}
          description={
            totalAttempts > 0
              ? `${(
                  (correctSubmissions / totalAttempts) *
                  100
                ).toFixed(0)}% success rate`
              : "0%"
          }
        />

        <StatCard
          title="Wrong Submissions"
          value={wrongSubmissions}
          icon={<XCircle className="w-6 h-6 text-error" />}
        />

      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        <button
          onClick={() => navigate("/teacher/create")}
          className="card-elevated flex items-center gap-4 hover:border-primary transition-colors"
        >
          <Plus className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-foreground font-semibold">
              Create Assessment
            </h3>
            <p className="text-muted-foreground text-sm">
              Add new questions
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/teacher/students")}
          className="card-elevated flex items-center gap-4 hover:border-primary transition-colors"
        >
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-foreground font-semibold">
              View Students
            </h3>
            <p className="text-muted-foreground text-sm">
              Monitor performance
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/teacher/workspace")}
          className="card-elevated flex items-center gap-4 hover:border-primary transition-colors"
        >
          <TrendingUp className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-foreground font-semibold">
              Workspace
            </h3>
            <p className="text-muted-foreground text-sm">
              Manage drafts
            </p>
          </div>
        </button>

      </div>

      {/* RECENT ASSESSMENTS */}
      <div>

        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Recent Assessments
          </h2>

          <button
            onClick={() =>
              navigate("/teacher/assessments")
            }
            className="text-primary hover:underline"
          >
            View all
          </button>
        </div>

        {myAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {myAssessments.slice(0, 3).map((assessment) => {

              const subs = mySubmissions.filter(
                (s) => s.assignmentId === assessment.id
              );

              const correct = subs.filter(
                (s) => s.status === "ACCEPTED"
              ).length;

              return (
                <AssessmentCard
                  key={assessment.id}
                  assessment={assessment}
                  onClick={() =>
                    navigate(`/teacher/assessments/${assessment.id}`)
                  }
                  showStats
                  attempts={subs.length}
                  correctRate={
                    subs.length > 0
                      ? (correct / subs.length) * 100
                      : 0
                  }
                />
              );
            })}

          </div>
        ) : (
          <div className="card-elevated text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />

            <p className="text-muted-foreground mb-4">
              No assessments yet
            </p>

            <button
              onClick={() =>
                navigate("/teacher/create")
              }
              className="btn-primary"
            >
              Create Assessment
            </button>
          </div>
        )}

      </div>
    </div>
  );
}