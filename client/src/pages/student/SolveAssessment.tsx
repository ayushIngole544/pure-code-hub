import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { CodeEditor } from "@/components/CodeEditor";
import { Loader2 } from "lucide-react";
import { submitQuestion } from "@/services/submission";

export default function SolveAssessment() {
  const { id } = useParams<{ id: string }>();
  const { getAssessmentWithQuestions } = useData();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState("javascript");

  const [results, setResults] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // FETCH ASSESSMENT
  // =========================
  useEffect(() => {
    if (!id) return;

    getAssessmentWithQuestions(id)
      .then((res: any) => {
        const a = res.assignment || res;
        setAssessment(a);

        const ansMap: any = {};
        const codeMap: any = {};

        a.questions?.forEach((q: any) => {
          if (q.type === "CODING") codeMap[q.id] = "";
          else ansMap[q.id] = "";
        });

        setAnswers(ansMap);
        setCodes(codeMap);
      })
      .catch((err) => {
        console.error("Error loading assessment:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // =========================
  // EXPIRED CHECK
  // =========================
  if (assessment?.dueDate && new Date() > new Date(assessment.dueDate)) {
    return (
      <div className="page-container text-center">
        <h1 className="text-2xl font-bold text-red-500">
          Assessment Expired
        </h1>
      </div>
    );
  }

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!assessment) return <div>No assessment found</div>;
  if (!assessment.questions?.length)
    return <div>No questions available</div>;

  const q = assessment.questions[currentIndex];
  console.log("FULL QUESTION:", q);
console.log("PROBLEM:", q?.problem);
console.log("TESTCASES:", q?.problem?.testCases);

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const allResults: Record<string, any> = {};

      for (const ques of assessment.questions) {
        let res;

        if (ques.type === "CODING") {
          if (!codes[ques.id]) continue;

          res = await submitQuestion(assessment.id, ques.id, {
            code: codes[ques.id],
            language,
          });
        } else {
          if (!answers[ques.id]) continue;

          res = await submitQuestion(assessment.id, ques.id, {
            answer: answers[ques.id],
          });
        }

        allResults[ques.id] = res;
      }

      setResults(allResults);
    } catch (err: any) {
      alert(err.message || "Submission failed");
    }

    setSubmitting(false);
  };

  // =========================
  // NAVIGATION
  // =========================
  const next = () =>
    setCurrentIndex((i) =>
      i < assessment.questions.length - 1 ? i + 1 : i
    );

  const prev = () =>
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));

  // =========================
  // UI
  // =========================
  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="card-elevated p-4 mb-4">
        <h1 className="text-xl font-bold">{assessment.title}</h1>
        <p className="text-muted-foreground">
          Question {currentIndex + 1}/{assessment.questions.length}
        </p>
      </div>

      <div className="grid md:grid-cols-[40%_60%] gap-4">

        {/* QUESTION PANEL */}
        <div className="card-elevated p-6 overflow-auto max-h-[75vh]">

          <h2 className="text-lg font-semibold mb-2">
            {q.title}
          </h2>

          <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
            {q.description}
          </p>

          {/* =========================
              MCQ (FIXED KEY BUG)
          ========================= */}
          {q.type === "MCQ" &&
            q.options?.map((opt: string, idx: number) => (
              <label key={`${q.id}-${idx}`} className="block mb-2">
                <input
                  type="radio"
                  checked={answers[q.id] === opt}
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.id]: opt,
                    }))
                  }
                />
                <span className="ml-2">{opt}</span>
              </label>
            ))}

          {/* NAT */}
          {q.type === "NAT" && (
            <input
              value={answers[q.id]}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [q.id]: e.target.value,
                }))
              }
              className="input-field"
              placeholder="Enter answer"
            />
          )}

          {/* RESULT */}
          {results[q.id] && (
            <div className="mt-6">

              <div className="p-3 rounded bg-muted mb-4">
                <p className="font-semibold">
                  Status:{" "}
                  <span
                    className={
                      results[q.id].status === "ACCEPTED"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {results[q.id].status}
                  </span>
                </p>

                <p>Score: {results[q.id].score}</p>
              </div>

              {results[q.id].results && (
                <div className="space-y-3">
                  {results[q.id].results.map(
                    (tc: any, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded border ${
                          tc.passed
                            ? "border-green-500 bg-green-500/10"
                            : "border-red-500 bg-red-500/10"
                        }`}
                      >
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">
                            Test Case {index + 1}
                          </span>
                          <span>
                            {tc.passed ? "✅ Passed" : "❌ Failed"}
                          </span>
                        </div>

                        {!tc.isHidden ? (
                          <>
                            <p className="text-sm">
                              <strong>Expected:</strong>{" "}
                              <span className="text-green-400">
                                {tc.expected}
                              </span>
                            </p>

                            <p className="text-sm">
                              <strong>Your Output:</strong>{" "}
                              <span className="text-yellow-400">
                                {tc.actual}
                              </span>
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Hidden Test Case
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* NAV */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className="btn-secondary"
            >
              Prev
            </button>

            <button
              onClick={next}
              disabled={
                currentIndex === assessment.questions.length - 1
              }
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        </div>

        {/* CODE EDITOR */}
        {q.type === "CODING" && (
          <div className="card-elevated p-2">

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mb-2 input-field"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
            </select>

            <CodeEditor
  code={codes[q.id]}
  setCode={(val) =>
    setCodes((prev) => ({
      ...prev,
      [q.id]: val,
    }))
  }
  language={language}

  // 🔥 REAL TESTCASES FROM DB
  testCases={
  (q.problem?.testCases ||
    q.problem?.testcases ||   // fallback
    q.testCases ||            // fallback
    []
  ).map((tc: any) => ({
    input: tc.input,
    expectedOutput: tc.expectedOutput || tc.output,
  }))
}
/>
          </div>
        )}
      </div>

      {/* SUBMIT */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary px-6 py-2"
        >
          {submitting ? "Submitting..." : "Submit Assessment"}
        </button>
      </div>
    </div>
  );
}