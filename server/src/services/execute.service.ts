import { exec } from "child_process";

export const runCode = (
  code: string,
  language: string,
  input: string
): Promise<{ output: string; error: string | null }> => {
  return new Promise((resolve) => {
    try {
      let runCommand = "";

      // =============================
      // 🔥 BASE64 ENCODE (SAFE)
      // =============================
      const encoded = Buffer.from(code).toString("base64");

      // =============================
      // 🔥 LANGUAGE COMMANDS
      // =============================

      if (language === "python") {
        runCommand = `printf "${encoded}" | base64 -d > main.py && (python3 main.py) 2>&1`;
      }

      else if (language === "javascript") {
        runCommand = `printf "${encoded}" | base64 -d > main.js && (node main.js) 2>&1`;
      }

      else if (language === "cpp") {
        runCommand = `printf "${encoded}" | base64 -d > main.cpp && (g++ main.cpp -o main && ./main) 2>&1`;
      }

      else if (language === "c") {
        runCommand = `printf "${encoded}" | base64 -d > main.c && (gcc main.c -o main && ./main) 2>&1`;
      }

      else if (language === "java") {
        runCommand = `printf "${encoded}" | base64 -d > Main.java && (javac Main.java && java Main) 2>&1`;
      }

      else {
        return resolve({
          output: "",
          error: "Unsupported language",
        });
      }

      // =============================
      // 🔥 DOCKER COMMAND
      // =============================

      const dockerCommand = `docker run --rm --memory=512m --cpus=1 --pids-limit=256 code-runner sh -c "${runCommand}"`;

      console.log("🐳 DOCKER CMD:", dockerCommand);

      // =============================
      // 🔥 EXECUTION
      // =============================

      exec(
        dockerCommand,
        {
          timeout: 10000,
          maxBuffer: 1024 * 1024,
        },
        (error, stdout, stderr) => {

          // ⏱ TIME LIMIT
          if (error && (error as any).killed) {
            return resolve({
              output: "",
              error: "TIME_LIMIT_EXCEEDED",
            });
          }

          // ❌ ERROR (compile/runtime)
          if (error) {
            return resolve({
              output: "",
              error: stderr || error.message,
            });
          }

          // ✅ SUCCESS
          resolve({
            output: stdout,
            error: null,
          });
        }
      );

    } catch (err: any) {
      resolve({
        output: "",
        error: err.message,
      });
    }
  });
};