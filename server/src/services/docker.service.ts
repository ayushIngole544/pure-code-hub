import { exec } from "child_process";
import fs from "fs";
import path from "path";

export const runCodeInDocker = (
  code: string,
  language: string,
  input: string
): Promise<{ output: string; error: string | null }> => {
  return new Promise((resolve) => {
    const tempDir = path.join(__dirname, "../../temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    let filename = "";
    let dockerImage = "";
    let runCommand = "";

    if (language === "python") {
      filename = "code.py";
      dockerImage = "python:3.9-alpine";
      runCommand = "python code.py";
    } 
    else if (language === "javascript") {
      filename = "code.js";
      dockerImage = "node:18-alpine";
      runCommand = "node code.js";
    } 
    else if (language === "cpp") {
      filename = "code.cpp";
      dockerImage = "gcc:latest";
      runCommand = "g++ code.cpp -o code && ./code";
    } 
    else {
      return resolve({ output: "", error: "Unsupported language" });
    }

    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, code);

    const runCmd = `
      docker run -d
      --memory="100m"
      --cpus="0.5"
      --network=none
      -v "${tempDir}:/app"
      -w /app
      ${dockerImage}
      sh -c "echo '${input}' | ${runCommand}"
    `;

    exec(runCmd, (err, stdout) => {
      if (err) {
        return resolve({ output: "", error: err.message });
      }

      const containerId = stdout.trim();

      // 🔥 HARD TIME LIMIT (2s)
      setTimeout(() => {
        exec(`docker rm -f ${containerId}`, () => {});
      }, 2000);

      // 🔥 WAIT FOR EXECUTION
      exec(`docker wait ${containerId}`, () => {

        // 🔥 CHECK IF CONTAINER STILL EXISTS (KEY FIX)
        exec(`docker inspect ${containerId}`, (inspectErr) => {

          // If container is gone → likely killed → TLE
          if (inspectErr) {
            return resolve({
              output: "",
              error: "TIME_LIMIT_EXCEEDED",
            });
          }

          // 🔥 GET LOGS
          exec(`docker logs ${containerId}`, (logErr, logs) => {

            // Cleanup
            exec(`docker rm -f ${containerId}`, () => {});

            // Runtime error detection
            if (logs && logs.toLowerCase().includes("error")) {
              return resolve({
                output: "",
                error: logs,
              });
            }

            resolve({
              output: logs || "",
              error: null,
            });
          });
        });
      });
    });
  });
};