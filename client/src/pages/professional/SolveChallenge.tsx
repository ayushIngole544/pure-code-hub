import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CodeEditor } from "@/components/CodeEditor";

import { submitCode, getSubmission } from "@/services/submission";

export default function SolveChallenge() {
  const { id } = useParams();

  const [question, setQuestion] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    // TODO: replace with real API
    setQuestion({
      id,
      title: "Two Sum",
      description: "Find two numbers...",
      language: "cpp",
      starter_code: "",
    });
  }, [id]);

  const handleSubmit = async (code: string) => {
    setSubmitting(true);

    try {
      const res = await submitCode(question.id, code, question.language);

      const submissionId = res.submissionId;

      const interval = setInterval(async () => {
        const result = await getSubmission(submissionId);

        if (result.submission.status !== "PENDING") {
          clearInterval(interval);

          setResult(
            JSON.stringify(result.submission, null, 2)
          );

          setSubmitting(false);
        }
      }, 2000);
    } catch {
      setSubmitting(false);
    }
  };

  if (!question) return <div>Loading...</div>;

  return (
    <div className="h-screen flex">

      {/* LEFT */}
      <div className="w-1/2 p-4">
        <h1 className="text-xl font-bold">
          {question.title}
        </h1>
        <p>{question.description}</p>
      </div>

      {/* RIGHT */}
      <div className="w-1/2">
        <CodeEditor
          initialCode={question.starter_code}
          language={question.language}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>

    </div>
  );
}