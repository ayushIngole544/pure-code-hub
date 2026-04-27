import { useState } from "react";
import {
  Loader2,
  Sparkles,
} from "lucide-react";

import { generateAIQuestion } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

export function AIGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionType, setQuestionType] = useState<"MCQ" | "NAT" | "CODING">("CODING");
  const [loading, setLoading] = useState(false);
  const [generatedProblem, setGeneratedProblem] = useState<any>(null);

  const { toast } = useToast();
  const { refreshProblems } = useData(); // 🔥 IMPORTANT

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGeneratedProblem(null);

    try {
      const res = await generateAIQuestion({
        topic,
        difficulty,
        type: questionType,
      });

      setGeneratedProblem(res.question);

      // 🔥 CRITICAL FIX → update global problems list
      if (questionType === "CODING") {
        await refreshProblems();
      }

      toast({
        title: "Success!",
        description: "AI problem generated.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-elevated">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-yellow-400" />
        <h3 className="text-lg font-semibold">AI Problem Generator</h3>
      </div>

      <div className="grid gap-4 mb-4">
        <input
          type="text"
          placeholder="Topic (e.g. Graphs, DP)"
          className="input-field"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            className="input-field"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            className="input-field"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as any)}
          >
            <option value="MCQ">MCQ</option>
            <option value="NAT">NAT</option>
            <option value="CODING">Coding</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Generate"}
        </button>
      </div>

      {generatedProblem && (
        <div className="card-elevated mt-4">
          <h4 className="font-bold mb-2">{generatedProblem.title}</h4>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {generatedProblem.description}
          </p>
        </div>
      )}
    </div>
  );
}