import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { AssessmentCard } from "@/components/AssessmentCard";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useState } from "react";
import { publishAssessment } from "@/services/assessment";

export default function TeacherAssessments() {
  const { user } = useAuth();
  const { assessments, submissions, refreshAssessments } = useData();
  const navigate = useNavigate();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const myAssessments = assessments.filter(
    (a) => a.teacherId === user?.id
  );

  const handlePublish = async (
    e: React.MouseEvent,
    id: string
  ) => {
    e.stopPropagation();
    try {
      setLoadingId(id);
      await publishAssessment(id);
      await refreshAssessments();
    } catch (err) {
      console.error("Publish failed", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">My Assessments</h1>

        <button
          onClick={() => navigate("/teacher/create")}
          className="btn-primary flex gap-2"
        >
          <Plus className="w-4 h-4" />
          Create
        </button>
      </div>

      {/* LIST */}
      {myAssessments.length > 0 ? (
        <div className="grid gap-4">

          {myAssessments.map((assessment) => {

            const subs = submissions.filter(
              (s) => s.assignmentId === assessment.id
            );

            return (
              <div
                key={assessment.id}
                className="card-elevated p-4 flex justify-between items-center cursor-pointer hover:scale-[1.01] transition"
                onClick={() =>
                  navigate(`/teacher/assessments/${assessment.id}`)
                }
              >
                {/* LEFT */}
                <div>
                  <h2 className="text-lg font-semibold">
                    {assessment.title}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Attempts: {subs.length}
                  </p>

                  {/* STATUS */}
                  <span
                    className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                      assessment.isPublished
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {assessment.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex gap-2">

                  {/* EDIT (ONLY IF DRAFT) */}
                  {!assessment.isPublished && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teacher/create?edit=${assessment.id}`);
                      }}
                      className="btn-secondary text-sm"
                    >
                      Edit
                    </button>
                  )}

                  {/* PUBLISH */}
                  {!assessment.isPublished && (
                    <button
                      onClick={(e) =>
                        handlePublish(e, assessment.id)
                      }
                      disabled={loadingId === assessment.id}
                      className="btn-primary text-sm"
                    >
                      {loadingId === assessment.id
                        ? "Publishing..."
                        : "Publish"}
                    </button>
                  )}

                </div>
              </div>
            );
          })}

        </div>
      ) : (
        <div className="card-elevated text-center py-10">
          <p className="text-muted-foreground">
            No assessments yet
          </p>
        </div>
      )}
    </div>
  );
}