import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Send } from "lucide-react";
import { api } from "@/services/api";

type TestCase = {
  input: string;
  expectedOutput: string;
};

type Props = {
  language: string;
  code: string;
  setCode: (value: string) => void;
  onSubmit?: (code: string) => void; // ✅ NEW
  submitting?: boolean; // ✅ NEW
};

export function CodeEditor({
  language,
  code,
  setCode,
  onSubmit,
  submitting,
}: Props) {
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [input, setInput] = useState("");
  const [ghostText, setGhostText] = useState("");

  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "2", expectedOutput: "2" },
  ]);

  const languageMap: Record<string, string> = {
    javascript: "javascript",
    python: "python",
    cpp: "cpp",
    c: "cpp",
    java: "java",
  };

  // 🔥 SIMPLE SUGGESTION ENGINE
  const generateSuggestion = (code: string, lang: string) => {
    const last = code.split("\n").pop()?.trim();
    if (!last) return "";

    if (lang === "cpp" && last === "for")
      return ` (int i = 0; i < n; i++) {\n    \n}`;

    if (lang === "python" && last === "for")
      return ` i in range(n):\n    `;

    if (lang === "javascript" && last.includes("console"))
      return `.log("Hello");`;

    if (lang === "java" && last === "for")
      return ` (int i = 0; i < n; i++) {\n    \n}`;

    return "";
  };

  // 🔥 RUN CODE
  const handleRun = async () => {
    try {
      setRunning(true);
      setOutput("Running...\n");

      const res = await api.post("/execute", {
        code,
        language,
        input,
      });

      setOutput(res.data.output || res.data.error || "No output");
    } catch {
      setOutput("❌ Server error");
    } finally {
      setRunning(false);
    }
  };

  // 🔥 INTERNAL SUBMIT (fallback)
  const handleInternalSubmit = async () => {
    try {
      setOutput("Running Test Cases...\n");

      let results = "";

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];

        const res = await api.post("/execute", {
          code,
          language,
          input: tc.input,
        });

        const actual = res.data.output?.trim();
        const expected = tc.expectedOutput.trim();

        if (actual === expected) {
          results += `Test Case ${i + 1}: ✅ Passed\n`;
        } else {
          results += `Test Case ${i + 1}: ❌ Failed\nExpected: ${expected}\nGot: ${actual}\n\n`;
        }
      }

      setOutput(results);
    } catch {
      setOutput("❌ Submission failed");
    }
  };

  // 🔥 MAIN SUBMIT HANDLER
  const handleSubmitClick = () => {
    if (onSubmit) {
      onSubmit(code); // 🔥 external (SolveAssessment)
    } else {
      handleInternalSubmit(); // 🔥 fallback
    }
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "" }]);
  };

  return (
    <div className="flex flex-col h-[600px] border border-border rounded-lg overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between px-4 py-2 bg-[#0f172a] border-b border-gray-700">
        <span className="text-sm text-gray-300 capitalize">{language}</span>

        <div className="flex gap-2">
          <button onClick={handleRun} className="btn-primary">
            <Play className="w-4 h-4" /> Run
          </button>

          <button
            onClick={handleSubmitClick}
            disabled={submitting}
            className="bg-yellow-400 px-3 py-1 rounded text-black flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="flex flex-1">

        {/* EDITOR */}
        <div className="relative w-[60%]">
          <Editor
            height="100%"
            language={languageMap[language]}
            theme="vs-dark"
            value={code}
            onChange={(val) => {
              const v = val || "";
              setCode(v);
              setGhostText(generateSuggestion(v, language));
            }}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
            }}
          />

          {ghostText && (
            <div className="absolute top-0 left-0 p-2 text-gray-500 opacity-40 pointer-events-none whitespace-pre font-mono">
              {code + ghostText}
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[40%] flex flex-col bg-[#020617] border-l border-gray-700">

          {/* INPUT */}
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-xs text-gray-400 mb-2">Input</h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-2 bg-[#020617] border border-gray-700 text-gray-200 text-sm rounded focus:outline-none"
            />
          </div>

          {/* TEST CASES */}
          <div className="flex-1 p-3 overflow-auto">
            <button onClick={addTestCase} className="text-xs text-white mb-3">
              + Add Testcase
            </button>

            {testCases.map((tc, i) => (
              <div key={i} className="mb-3 p-2 bg-[#0f172a] rounded border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Input</p>
                <textarea
                  value={tc.input}
                  onChange={(e) => {
                    const newTC = [...testCases];
                    newTC[i].input = e.target.value;
                    setTestCases(newTC);
                  }}
                  className="w-full p-1 text-xs bg-[#020617] text-gray-200 rounded mb-2"
                />

                <p className="text-xs text-gray-400 mb-1">Expected</p>
                <textarea
                  value={tc.expectedOutput}
                  onChange={(e) => {
                    const newTC = [...testCases];
                    newTC[i].expectedOutput = e.target.value;
                    setTestCases(newTC);
                  }}
                  className="w-full p-1 text-xs bg-[#020617] text-gray-200 rounded"
                />
              </div>
            ))}
          </div>

          {/* OUTPUT */}
          <div className="p-3 bg-black text-green-400 h-[150px] overflow-auto border-t border-gray-700">
            <h3 className="text-xs text-gray-400 mb-2">Output</h3>
            <pre className="text-sm whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}