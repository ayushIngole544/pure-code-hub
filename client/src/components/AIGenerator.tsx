import { useState } from "react";
import {
  Bot,
  Loader2,
  Sparkles,
  Code,
  BrainCircuit,
} from "lucide-react";

import { generateAIQuestion } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

export function AIGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionType, setQuestionType] = useState<"MCQ" | "NAT" | "CODING">("CODING");
  const [loading, setLoading] = useState(false);
  const [generatedProblem, setGeneratedProblem] = useState<any>(null);

  const { toast } = useToast();

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
    <div className="bg-[#0f172a] rounded-xl border border-gray-700 overflow-hidden shadow-lg">
      {/* HEADER */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-700 bg-[#020617]">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">
          AI Problem Generator
        </h3>
      </div>

      {/* FORM */}
      <div className="p-6">
        <div className="grid gap-4 mb-6">
          <input
            type="text"
            placeholder="Topic (e.g. Graphs, DP)"
            className="bg-[#020617] border border-gray-600 p-3 rounded text-white"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              className="bg-[#020617] border border-gray-600 p-2 rounded text-white"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              className="bg-[#020617] border border-gray-600 p-2 rounded text-white"
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
            className="bg-yellow-400 text-black py-2 rounded font-medium hover:bg-yellow-300"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* RESULT */}
        {generatedProblem && (
          <div className="bg-black border border-gray-700 p-5 rounded">
            <h4 className="text-xl font-bold text-white mb-3">
              {generatedProblem.title}
            </h4>
            <p className="text-gray-300 mb-4 whitespace-pre-wrap">
              {generatedProblem.description}
            </p>
            {generatedProblem.type === "CODING" && generatedProblem.testCases && (
               <pre className="bg-[#020617] p-4 rounded text-green-400 text-sm overflow-x-auto">
                 {JSON.stringify(generatedProblem.testCases, null, 2)}
               </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}