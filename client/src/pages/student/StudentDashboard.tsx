import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { AssessmentCard } from "@/components/AssessmentCard";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { assessments, submissions } = useData();
  const navigate = useNavigate();

  // 🔥 ONLY PUBLISHED ASSIGNMENTS
  const availableAssessments = assessments.filter(
    (a) => a.isPublished === true
  );

  // 🔥 STUDENT SUBMISSIONS
  const mySubmissions = submissions.filter(
    (s) => s.userId === user?.id
  );

  const correct = mySubmissions.filter(
    (s) => s.status === "ACCEPTED"
  ).length;

  const total = mySubmissions.length;
  const incorrect = total - correct;

  const accuracy =
    total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and solve assessments
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">
            Total submissions
          </p>
          <p className="text-2xl font-bold">{total}</p>
        </div>

        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">
            Unique assessments
          </p>
          <p className="text-2xl font-bold">
            {new Set(
              mySubmissions.map((s) => s.assignmentId)
            ).size}
          </p>
        </div>

        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">
            Accuracy
          </p>
          <p className="text-2xl font-bold text-green-500">
            {accuracy}%
          </p>
        </div>

        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">
            Incorrect
          </p>
          <p className="text-2xl font-bold text-red-500">
            {incorrect}
          </p>
        </div>

      </div>

      {/* PROGRESS */}
      <div className="card-elevated p-6 mb-8">
        <h2 className="text-lg font-semibold mb-2">
          Your Progress
        </h2>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${accuracy}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-green-500">
            {correct} Correct
          </span>
          <span className="text-red-500">
            {incorrect} Incorrect
          </span>
          <span>{total} Total</span>
        </div>
      </div>

      {/* AVAILABLE ASSESSMENTS */}
      <div>

        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Available Assessments
          </h2>

          <button
            onClick={() => navigate("/student/assessments")}
            className="text-primary hover:underline"
          >
            View all
          </button>
        </div>

        {availableAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {availableAssessments.slice(0, 3).map((assessment) => {

              const subs = mySubmissions.filter(
                (s) => s.assignmentId === assessment.id
              );

              const correctSubs = subs.filter(
                (s) => s.status === "ACCEPTED"
              ).length;

              return (
                <AssessmentCard
                  key={assessment.id}
                  assessment={assessment}
                  onClick={() =>
                    navigate(`/student/assessments/${assessment.id}`)
                  }
                  showStats
                  attempts={subs.length}
                  correctRate={
                    subs.length > 0
                      ? (correctSubs / subs.length) * 100
                      : 0
                  }
                />
              );
            })}

          </div>
        ) : (
          <div className="card-elevated text-center py-12">
            <p className="text-muted-foreground">
              No assessments available
            </p>
          </div>
        )}

      </div>
    </div>
  );
}