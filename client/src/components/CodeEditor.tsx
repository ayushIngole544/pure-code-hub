// ONLY CHANGES: FIXED BOILERPLATE SWITCHING

import { useState, useEffect, useRef } from "react";
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
  onSubmit?: (code: string) => void;
  submitting?: boolean;
  testCases?: TestCase[];
};

export function CodeEditor({
  language,
  code,
  setCode,
  onSubmit,
  submitting,
  testCases = [],
}: Props) {
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [input, setInput] = useState("");

  // =========================
  // 🔥 BOILERPLATES
  // =========================
  const boilerplates: Record<string, string> = {
    javascript: `function solve(input) {
  
}

const input = require("fs").readFileSync(0, "utf-8");
console.log(solve(input));`,

    python: `def solve():
    pass

if __name__ == "__main__":
    solve()`,

    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    
    return 0;
}`,

    c: `#include <stdio.h>

int main() {
    
    return 0;
}`,

    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        
    }
}`,
  };

  // =========================
  // 🔥 FIXED LANGUAGE SWITCH
  // =========================
  const prevLang = useRef(language);

  useEffect(() => {
    if (prevLang.current !== language) {
      setCode(boilerplates[language] || "");
      prevLang.current = language;
    }
  }, [language]);

  // =========================
  // LANGUAGE MAP
  // =========================
  const languageMap: Record<string, string> = {
    javascript: "javascript",
    python: "python",
    cpp: "cpp",
    c: "c", // 🔥 FIX (you had cpp here before)
    java: "java",
  };

  // =========================
  // RUN
  // =========================
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

  const handleSubmitClick = () => {
    if (onSubmit) onSubmit(code);
  };

  return (
    <div className="flex flex-col h-[650px] border border-border rounded-lg overflow-hidden">

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
        <div className="relative w-[70%]">
          <Editor
            height="100%"
            language={languageMap[language]}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>

        {/* TESTCASES */}
        <div className="w-[30%] bg-[#020617] border-l border-gray-700 flex flex-col">

          <div className="p-3 border-b border-gray-700">
            <h3 className="text-xs text-gray-400">Test Cases</h3>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-3">
            {testCases.map((tc, i) => (
              <div key={i} className="p-2 bg-[#0f172a] rounded border border-gray-700">
                <p className="text-xs text-gray-400">Input</p>
                <pre className="text-xs text-white">{tc.input}</pre>

                <p className="text-xs text-gray-400 mt-2">Expected</p>
                <pre className="text-xs text-green-400">{tc.expectedOutput}</pre>
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