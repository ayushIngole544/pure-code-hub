import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function TeacherViewAssessment() {
  const { id } = useParams<{ id: string }>();
  const { getAssessmentWithQuestions } = useData();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getAssessmentWithQuestions(id)
      .then((res: any) => {
        setAssessment(res?.assignment || res);
      })
      .catch((err) => {
        console.error("Error loading assessment:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="page-container text-center">
        <h1 className="text-xl font-bold text-red-500">
          Assessment not found
        </h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="card-elevated p-6 mb-6">
          <h1 className="text-2xl font-bold">
            {assessment.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {assessment.description}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Due: {new Date(assessment.dueDate).toLocaleString()}
          </p>
        </div>

        {/* QUESTIONS */}
        <div className="space-y-4">
          {assessment.questions?.map((q: any, idx: number) => (
            <div
              key={q.id}
              className="card-elevated p-5"
            >
              <h2 className="font-semibold text-lg mb-2">
                Q{idx + 1}. {q.title}
              </h2>

              <p className="text-muted-foreground mb-3">
                {q.description}
              </p>

              {/* MCQ */}
              {q.type === "MCQ" && (
                <ul className="list-disc pl-5">
                  {q.options?.map((opt: string, i: number) => (
                    <li key={i}>
                      {opt}
                      {opt === q.correctAnswer && (
                        <span className="text-green-500 ml-2">
                          ✔
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* NAT */}
              {q.type === "NAT" && (
                <p>
                  Answer:{" "}
                  <span className="text-green-500">
                    {q.correctAnswer}
                  </span>
                </p>
              )}

              {/* CODING */}
              {q.type === "CODING" && (
                <div>
                  <p className="mb-2 font-medium">
                    Test Cases:
                  </p>

                  {q.testCases?.map((tc: any, i: number) => (
                    <div
                      key={i}
                      className="border p-2 rounded mb-2"
                    >
                      <p><strong>Input:</strong> {tc.input}</p>
                      <p>
                        <strong>Output:</strong>{" "}
                        {tc.expectedOutput || tc.output}
                      </p>
                      {tc.isHidden && (
                        <span className="text-xs text-yellow-500">
                          Hidden
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}