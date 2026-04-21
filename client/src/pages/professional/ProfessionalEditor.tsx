import { useState, useEffect } from "react";
import { CodeEditor } from "@/components/CodeEditor";

export default function ProfessionalEditor() {

  // 🔥 DEFAULT LANGUAGE = C++
  const [language, setLanguage] = useState("cpp");

  const [code, setCode] = useState("");

  // 🔥 Boilerplate generator
  const getBoilerplate = (lang: string) => {
    switch (lang) {
      case "cpp":
        return `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello World";
    return 0;
}`;

      case "javascript":
        return `console.log("Hello World");`;

      case "python":
        return `print("Hello World")`;

      case "c":
        return `#include <stdio.h>

int main() {
    printf("Hello World");
    return 0;
}`;

      case "java":
        return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`;

      default:
        return "";
    }
  };

  // 🔥 Set initial code (C++ by default)
  useEffect(() => {
    setCode(getBoilerplate("cpp"));
  }, []);

  // 🔥 Language change
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(getBoilerplate(lang));
  };

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Code Editor
        </h1>
        <p className="text-muted-foreground">
          Practice coding in your favorite language
        </p>
      </div>

      {/* LANGUAGE SELECT */}
      <div className="flex items-center gap-4 mb-4">
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="select-field"
        >
          <option value="cpp">C++</option> {/* 🔥 FIRST */}
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="c">C</option>
          <option value="java">Java</option>
        </select>
      </div>

      {/* EDITOR */}
      <CodeEditor
        language={language}
        code={code}
        setCode={setCode}
      />

    </div>
  );
}