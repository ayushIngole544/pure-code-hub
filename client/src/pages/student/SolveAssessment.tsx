import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { CodeEditor } from "@/components/CodeEditor";
import { Loader2 } from "lucide-react";

export default function SolveAssessment() {
  const { id } = useParams<{ id: string }>();
  const { getAssessmentWithQuestions } = useData();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [codes, setCodes] = useState<Record<string, string>>({});

  // ================================
  // 🔥 FETCH ASSESSMENT
  // ================================
  useEffect(() => {
    if (!id) return;

    getAssessmentWithQuestions(id)
      .then((data) => {
        // ✅ data is already normalized (fixed in service)
        setAssessment(data);

        const initialAnswers: Record<string, string> = {};
        const initialCodes: Record<string, string> = {};

        data?.questions?.forEach((q: any) => {
          if (q.type === "CODING") {
            initialCodes[q.id] = "";
          } else {
            initialAnswers[q.id] = "";
          }
        });

        setAnswers(initialAnswers);
        setCodes(initialCodes);
      })
      .catch((err) => {
        console.error("Error loading assessment:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ================================
  // 🔥 SAFETY (NO WHITE SCREEN)
  // ================================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!assessment) {
    return <div>No assessment found</div>;
  }

  if (!assessment.questions || assessment.questions.length === 0) {
    return <div>No questions available</div>;
  }

  const currentQuestion = assessment.questions[currentIndex];

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  // ================================
  // 🔥 HANDLERS
  // ================================
  const handleNext = () => {
    if (currentIndex < assessment.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // ================================
  // 🔥 RENDER
  // ================================
  return (
    <div className="h-screen flex flex-col">
      {/* HEADER */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">{assessment.title}</h1>
        <p>
          Question {currentIndex + 1} / {assessment.questions.length}
        </p>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* QUESTION PANEL */}
        <div className="w-full md:w-1/2 p-6 overflow-auto">
          <h2 className="text-lg font-semibold mb-2">
            {currentQuestion.title}
          </h2>

          <p className="mb-4">{currentQuestion.description}</p>

          {/* MCQ */}
          {currentQuestion.type === "MCQ" &&
            currentQuestion.options?.map((opt: string) => (
              <label key={opt} className="block mb-2">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={opt}
                  checked={answers[currentQuestion.id] === opt}
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [currentQuestion.id]: opt,
                    }))
                  }
                />
                <span className="ml-2">{opt}</span>
              </label>
            ))}

          {/* NAT */}
          {currentQuestion.type === "NAT" && (
            <input
              type="text"
              value={answers[currentQuestion.id] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentQuestion.id]: e.target.value,
                }))
              }
              className="border p-2 w-full"
              placeholder="Enter your answer"
            />
          )}

          {/* NAV BUTTONS */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 border rounded"
            >
              Prev
            </button>

            <button
              onClick={handleNext}
              disabled={
                currentIndex === assessment.questions.length - 1
              }
              className="px-4 py-2 border rounded"
            >
              Next
            </button>
          </div>
        </div>

        {/* CODE EDITOR */}
        {currentQuestion.type === "CODING" && (
          <div className="w-full md:w-1/2 border-l">
            <CodeEditor
              code={codes[currentQuestion.id] || ""}
              setCode={(val: string) =>
                setCodes((prev) => ({
                  ...prev,
                  [currentQuestion.id]: val,
                }))
              }
              language="javascript"
            />
          </div>
        )}
      </div>
    </div>
  );
}