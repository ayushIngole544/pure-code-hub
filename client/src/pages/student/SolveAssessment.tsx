import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { CodeEditor } from "@/components/CodeEditor";
import { Loader2 } from "lucide-react";
import { submitQuestion } from "@/services/submission";
import { getAssignmentLeaderboard } from "@/services/assessment";
import { useAuth } from "@/contexts/AuthContext";

export default function SolveAssessment() {
  const { id } = useParams<{ id: string }>();
  const { getAssessmentWithQuestions } = useData();
  const { user } = useAuth();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState("javascript");

  const [results, setResults] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // 🔥 NEW STATES
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [rank, setRank] = useState<number | null>(null);

  // =========================
  // FETCH ASSESSMENT
  // =========================
  useEffect(() => {
    if (!id) return;

    getAssessmentWithQuestions(id)
      .then(async (res: any) => {
        const a = res.assignment || res;

        setAssessment(a);

        // 🔥 LOCK DATA
        setAlreadySubmitted(res.alreadySubmitted || false);
        setMyScore(res.myScore || 0);

        const ansMap: any = {};
        const codeMap: any = {};

        a.questions?.forEach((q: any) => {
          if (q.type === "CODING") codeMap[q.id] = "";
          else ansMap[q.id] = "";
        });

        setAnswers(ansMap);
        setCodes(codeMap);

        // 🔥 FETCH RANK IF SUBMITTED
        if (res.alreadySubmitted) {
          const lb = await getAssignmentLeaderboard(id);
          const my = lb.leaderboard.find(
            (x: any) => x.userId === user?.id
          );

          if (my) setRank(my.rank);
        }
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

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    if (alreadySubmitted) {
      alert("You have already submitted this assessment");
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitQuestion(assessment.id, "FINAL", {
        answers,
        codes,
        language,
      });

      alert("Assessment submitted successfully!");
      setAlreadySubmitted(true);
      setMyScore(res.score || 0);

      // 🔥 FETCH RANK AFTER SUBMIT
      const lb = await getAssignmentLeaderboard(id);
      const my = lb.leaderboard.find(
        (x: any) => x.userId === user?.id
      );

      if (my) setRank(my.rank);

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

      {/* 🔥 SUBMISSION STATUS */}
      {alreadySubmitted && (
        <div className="card-elevated p-4 mb-6 text-center">
          <h2 className="text-lg font-semibold text-green-500">
            You have already submitted this assessment
          </h2>
          <p className="text-sm mt-1">
            Score: {myScore}
          </p>
          {rank && (
            <p className="text-sm text-yellow-500 mt-1">
              Rank: #{rank}
            </p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-[40%_60%] gap-4">

        {/* QUESTION PANEL */}
        <div className="card-elevated p-6 overflow-auto max-h-[75vh]">

          <h2 className="text-lg font-semibold mb-2">
            {q.title}
          </h2>

          <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
            {q.description}
          </p>

          {/* MCQ */}
          {q.type === "MCQ" &&
            q.options?.map((opt: string, idx: number) => (
              <label key={`${q.id}-${idx}`} className="block mb-2">
                <input
                  type="radio"
                  checked={answers[q.id] === opt}
                  disabled={alreadySubmitted}
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
              disabled={alreadySubmitted}
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

          {/* NAV */}
          <div className="mt-6 flex gap-2">
            <button onClick={prev} disabled={currentIndex === 0} className="btn-secondary">
              Prev
            </button>

            <button
              onClick={next}
              disabled={currentIndex === assessment.questions.length - 1}
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
              disabled={alreadySubmitted}
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
              testCases={
                (q.problem?.testCases || []).map((tc: any) => ({
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
          disabled={submitting || alreadySubmitted}
          className="btn-primary px-6 py-2"
        >
          {alreadySubmitted
            ? "Already Submitted"
            : submitting
            ? "Submitting..."
            : "Submit Assessment"}
        </button>
      </div>
    </div>
  );
}