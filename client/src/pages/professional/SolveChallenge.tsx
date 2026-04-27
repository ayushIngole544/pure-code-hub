import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CodeEditor } from "@/components/CodeEditor";
import { getProblemById } from "@/services/problems";
import { submitCode } from "@/services/submission";
import { Loader2 } from "lucide-react";

const difficultyColors: Record<string, string> = {
  EASY: "text-green-400",
  MEDIUM: "text-yellow-400",
  HARD: "text-red-400",
};

export default function SolveChallenge() {
  const { id } = useParams();

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!id) return;

    getProblemById(id)
      .then((data) => setProblem(data))
      .catch((err) => console.error("Error loading problem:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (submittedCode: string) => {
    if (!problem) return;

    setSubmitting(true);
    setResult("");

    try {
      const res = await submitCode(problem.id, submittedCode, language);

      let output = `Status: ${res.status}\nScore: ${res.score}%\n\n`;

      if (res.results?.length) {
        output += "Test Cases:\n";
        res.results.forEach((tc: any, i: number) => {
          const icon = tc.passed ? "✅" : "❌";
          output += `  ${icon} Test ${i + 1}: ${tc.passed ? "Passed" : "Failed"}`;

          if (!tc.isHidden && !tc.passed) {
            output += `\n     Expected: ${tc.expected}\n     Got: ${tc.actual}`;
          }

          output += "\n";
        });
      }

      setResult(output);
    } catch (err: any) {
      setResult("❌ " + (err.message || "Submission failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Problem not found</p>
      </div>
    );
  }

  const diffColor =
    difficultyColors[problem.difficulty?.toUpperCase()] ||
    "text-yellow-400";

  return (
    <div className="h-screen flex flex-col">

      {/* HEADER */}
      <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-foreground">
            {problem.title}
          </h1>

          <span className={`text-sm font-medium ${diffColor}`}>
            {problem.difficulty}
          </span>
        </div>

        {/* LANGUAGE SELECTOR */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="input-field w-36 text-sm"
        >
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="c">C</option>
          <option value="java">Java</option>
        </select>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">

        {/* 🔥 LEFT (SMALLER) */}
        <div className="w-[35%] min-w-[320px] max-w-[500px] p-4 overflow-auto border-r border-border bg-card">

          <h2 className="text-lg font-semibold mb-3">Description</h2>

          <p className="text-muted-foreground whitespace-pre-wrap mb-6">
            {problem.description}
          </p>

          {/* TEST CASES */}
          {problem.testCases?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Examples</h3>

              {problem.testCases.map((tc: any, i: number) => (
                <div
                  key={tc.id || i}
                  className="mb-3 p-3 bg-secondary rounded-lg"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    Input:
                  </div>

                  <pre className="text-sm mb-2 whitespace-pre-wrap">
                    {tc.input}
                  </pre>

                  <div className="text-xs text-muted-foreground mb-1">
                    Output:
                  </div>

                  <pre className="text-sm whitespace-pre-wrap">
                    {tc.expectedOutput}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* RESULT */}
          {result && (
            <div className="mt-6 p-4 bg-secondary rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Result</h3>
              <pre className="text-sm text-green-400 whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
        </div>

        {/* 🔥 RIGHT (BIGGER EDITOR) */}
        <div className="flex-1">
          <CodeEditor
            language={language}
            code={code}
            setCode={setCode}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}