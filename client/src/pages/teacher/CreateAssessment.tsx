import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { generateAIQuestion } from "@/services/ai";

type Difficulty = "easy" | "medium" | "hard";
type QType = "MCQ" | "NAT" | "CODING";

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface Question {
  type: QType;
  title: string;
  description: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
  testCases?: TestCase[];
}

export default function CreateAssessment() {
  const { user } = useAuth();
  const { addAssessment } = useData();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // AI
  const [aiTopic, setAiTopic] = useState("Data Structures");
  const [aiDifficulty, setAiDifficulty] =
    useState<Difficulty>("medium");
  const [aiType, setAiType] = useState<QType>("MCQ");
  const [aiGenerating, setAiGenerating] = useState(false);

  // =========================
  // ADD QUESTION
  // =========================
  const addQuestion = (type: QType) => {
    const base: Question = {
      type,
      title: "",
      description: "",
      marks: 10,
    };

    if (type === "MCQ") {
      base.options = ["", "", "", ""];
      base.correctAnswer = "";
    }

    if (type === "NAT") {
      base.correctAnswer = "";
    }

    if (type === "CODING") {
      base.testCases = [
        { input: "", expectedOutput: "", isHidden: false },
      ];
    }

    setQuestions((prev) => [...prev, base]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, ...updates } : q
      )
    );
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // =========================
  // AI GENERATOR
  // =========================
  const generateWithAI = async () => {
    setAiGenerating(true);
    try {
      const res = await generateAIQuestion({
        topic: aiTopic,
        difficulty: aiDifficulty,
        type: aiType,
      });

      if (res?.question) {
        setQuestions((prev) => [
          ...prev,
          {
            ...res.question,
            type: aiType,
            marks: 10,
          },
        ]);
      }
    } catch (err) {
      console.error("AI failed", err);
    }
    setAiGenerating(false);
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || questions.length === 0) return;

    setSubmitting(true);

    const safeQuestions = questions.map((q) => ({
      ...q,
      marks: Number(q.marks) || 10,
      correctAnswer:
        q.type === "MCQ"
          ? q.correctAnswer || q.options?.[0]
          : q.correctAnswer,
    }));

    await addAssessment({
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      questions: safeQuestions,
    });

    setSubmitting(false);
    navigate("/teacher/assessments");
  };

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        <h1 className="section-title mb-6">
          Create Assessment
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* BASIC */}
          <div className="card-elevated">
            <h2 className="mb-4 font-semibold text-xl">
              Basic Settings
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="input-field"
                placeholder="Assessment Title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
              />

              <input
                type="datetime-local"
                className="input-field"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(e.target.value)
                }
                required
              />
            </div>

            <textarea
              className="input-field mt-4"
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </div>

          {/* AI */}
          <div className="card-elevated">
            <h2 className="mb-4 font-semibold text-xl flex gap-2">
              <Sparkles /> AI Generator
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              <input
                className="input-field"
                value={aiTopic}
                onChange={(e) =>
                  setAiTopic(e.target.value)
                }
              />

              <select
                className="input-field"
                value={aiType}
                onChange={(e) =>
                  setAiType(e.target.value as QType)
                }
              >
                <option value="MCQ">MCQ</option>
                <option value="NAT">NAT</option>
                <option value="CODING">CODING</option>
              </select>

              <select
                className="input-field"
                value={aiDifficulty}
                onChange={(e) =>
                  setAiDifficulty(
                    e.target.value as Difficulty
                  )
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <button
                type="button"
                onClick={generateWithAI}
                className="btn-secondary"
              >
                {aiGenerating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="card-elevated">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-xl">
                Questions
              </h2>

              <div className="flex gap-2">
                <button onClick={() => addQuestion("MCQ")} type="button" className="btn-outline text-xs">MCQ</button>
                <button onClick={() => addQuestion("NAT")} type="button" className="btn-outline text-xs">NAT</button>
                <button onClick={() => addQuestion("CODING")} type="button" className="btn-outline text-xs">CODING</button>
              </div>
            </div>

            {questions.map((q, i) => (
              <div key={i} className="border p-5 rounded mb-4 relative">

                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="absolute top-3 right-3"
                >
                  <Trash2 size={16} />
                </button>

                <input
                  className="input-field mb-2"
                  placeholder="Title"
                  value={q.title}
                  onChange={(e) =>
                    updateQuestion(i, {
                      title: e.target.value,
                    })
                  }
                />

                <textarea
                  className="input-field mb-2"
                  placeholder="Description"
                  value={q.description}
                  onChange={(e) =>
                    updateQuestion(i, {
                      description: e.target.value,
                    })
                  }
                />

                {/* MCQ */}
                {q.type === "MCQ" &&
                  q.options?.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 mb-1">
                      <input
                        type="radio"
                        checked={q.correctAnswer === opt}
                        onChange={() =>
                          updateQuestion(i, {
                            correctAnswer: opt,
                          })
                        }
                      />
                      <input
                        className="input-field"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(q.options || [])];
                          newOpts[idx] = e.target.value;
                          updateQuestion(i, {
                            options: newOpts,
                          });
                        }}
                      />
                    </div>
                  ))}

                {/* NAT */}
                {q.type === "NAT" && (
                  <input
                    className="input-field"
                    placeholder="Answer"
                    value={q.correctAnswer}
                    onChange={(e) =>
                      updateQuestion(i, {
                        correctAnswer: e.target.value,
                      })
                    }
                  />
                )}

                {/* CODING */}
                {q.type === "CODING" &&
                  q.testCases?.map((tc, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
                      <textarea
                        className="input-field"
                        placeholder="Input"
                        value={tc.input}
                        onChange={(e) => {
                          const t = [...(q.testCases || [])];
                          t[idx].input = e.target.value;
                          updateQuestion(i, { testCases: t });
                        }}
                      />
                      <textarea
                        className="input-field"
                        placeholder="Output"
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const t = [...(q.testCases || [])];
                          t[idx].expectedOutput =
                            e.target.value;
                          updateQuestion(i, { testCases: t });
                        }}
                      />
                    </div>
                  ))}
              </div>
            ))}
          </div>

          <button className="btn-primary w-full">
            {submitting
              ? "Saving..."
              : "Save Assessment"}
          </button>
        </form>
      </div>
    </div>
  );
}