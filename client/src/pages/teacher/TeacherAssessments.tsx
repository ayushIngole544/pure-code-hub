import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { AssessmentCard } from "@/components/AssessmentCard";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { publishAssessment } from "@/services/assessment";

export default function TeacherAssessments() {
  const { user } = useAuth();
  const { assessments, submissions, refreshAssessments } = useData();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ✅ FIXED: use teacherId ONLY
  const myAssessments = assessments.filter(
    (a) => a.teacherId === user?.id
  );

  const filteredAssessments = myAssessments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === "published") matchesStatus = a.isPublished === true;
    if (filterStatus === "draft") matchesStatus = a.isPublished === false;

    return matchesSearch && matchesStatus;
  });

  const handlePublish = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await publishAssessment(id);
      await refreshAssessments();
    } catch (err) {
      console.error("Failed to publish", err);
    }
  };

  return (
    <div className="page-container">
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

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="input-field mb-4"
      />

      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="input-field mb-4"
      >
        <option value="all">All</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>

      {filteredAssessments.length > 0 ? (
        filteredAssessments.map((assessment) => {
          // ✅ FIXED: assignmentId
          const subs = submissions.filter(
            (s) => s.assignmentId === assessment.id
          );

          return (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onClick={() =>
                navigate(`/teacher/assessments/${assessment.id}`)
              }
              attempts={subs.length}
              onPublish={(e) => handlePublish(e, assessment.id)}
            />
          );
        })
      ) : (
        <p>No assessments</p>
      )}
    </div>
  );
}