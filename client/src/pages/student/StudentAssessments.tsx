import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { AssessmentCard } from "@/components/AssessmentCard";
import { useNavigate } from "react-router-dom";

export default function StudentAssessments() {
  const { assessments } = useData();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  // ✅ ONLY use camelCase (clean fix)
  const published = assessments.filter((a) => a.isPublished);

  const filtered = published.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <h1 className="section-title">All Assessments</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search assessments..."
        className="input-field mb-4"
      />

      <p className="text-sm mb-4">
        Showing {filtered.length} assessment
        {filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onClick={() =>
                navigate(`/student/assessments/${assessment.id}`)
              }
            />
          ))}
        </div>
      ) : (
        <p>No assessments found</p>
      )}
    </div>
  );
}