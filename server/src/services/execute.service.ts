import { exec } from "child_process";
import crypto from "crypto";

// ==========================================
// 🔒 SAFETY LIMITS
// ==========================================
const LIMITS = {
  MAX_CODE_SIZE: 64 * 1024,       // 64 KB max code size
  MAX_INPUT_SIZE: 16 * 1024,       // 16 KB max input size
  MAX_OUTPUT_SIZE: 1024 * 1024,    // 1 MB max output buffer
  EXECUTION_TIMEOUT: 10000,        // 10 seconds
  DOCKER_MEMORY: "256m",
  DOCKER_CPUS: "1",
  DOCKER_PIDS: "128",
};

// ==========================================
// 🐳 Docker availability cache
// ==========================================
let dockerAvailable: boolean | null = null;
let lastDockerCheck = 0;
const DOCKER_CHECK_INTERVAL = 30000; // 30s

async function isDockerRunning(): Promise<boolean> {
  const now = Date.now();
  if (dockerAvailable !== null && now - lastDockerCheck < DOCKER_CHECK_INTERVAL) {
    return dockerAvailable;
  }

  return new Promise((resolve) => {
    exec("docker info", { timeout: 5000 }, (error) => {
      dockerAvailable = !error;
      lastDockerCheck = now;
      resolve(!error);
    });
  });
}

// ==========================================
// 🔒 Submission Cache (code hash → result)
// ==========================================
const resultCache = new Map<string, { output: string; error: string | null }>();
const MAX_CACHE_SIZE = 500;

function getCacheKey(code: string, language: string, input: string): string {
  const hash = crypto.createHash("sha256")
    .update(`${language}:${code}:${input}`)
    .digest("hex");
  return hash;
}

// ==========================================
// 🔥 NORMALIZE OUTPUT for comparison
// ==========================================
export function normalizeOutput(output: string): string {
  return output
    .replace(/\r\n/g, "\n")   // Windows → Unix newlines
    .replace(/\r/g, "\n")     // Old Mac → Unix newlines
    .replace(/\t/g, " ")      // Tabs → spaces
    .replace(/ +\n/g, "\n")   // Trailing spaces before newline
    .replace(/\n+$/g, "")     // Trailing newlines
    .replace(/^\n+/g, "")     // Leading newlines
    .trim();
}

// ==========================================
// 🔥 RUN CODE
// ==========================================
export const runCode = async (
  code: string,
  language: string,
  input: string
): Promise<{ output: string; error: string | null }> => {

  // Validate input sizes
  if (code.length > LIMITS.MAX_CODE_SIZE) {
    return { output: "", error: "CODE_TOO_LARGE" };
  }

  if (input && input.length > LIMITS.MAX_INPUT_SIZE) {
    return { output: "", error: "INPUT_TOO_LARGE" };
  }

  // Check cache
  const cacheKey = getCacheKey(code, language, input);
  const cached = resultCache.get(cacheKey);
  if (cached) {
    return { ...cached };
  }

  // Check Docker
  const dockerRunning = await isDockerRunning();
  if (!dockerRunning) {
    return {
      output: "",
      error: "DOCKER_NOT_RUNNING: Code execution requires Docker. Please start Docker Desktop and try again.",
    };
  }

  return new Promise((resolve) => {
    try {
      let runCommand = "";

      // Base64 encode code (safe for shell)
      const encoded = Buffer.from(code).toString("base64");

      // Pipe input safely
      const inputCmd = input
        ? `echo '${Buffer.from(input).toString("base64")}' | base64 -d | `
        : "";

      // Language commands
      if (language === "python") {
        runCommand = `printf "${encoded}" | base64 -d > main.py && (${inputCmd}python3 main.py) 2>&1`;
      } else if (language === "javascript") {
        runCommand = `printf "${encoded}" | base64 -d > main.js && (${inputCmd}node main.js) 2>&1`;
      } else if (language === "cpp") {
        runCommand = `printf "${encoded}" | base64 -d > main.cpp && g++ main.cpp -o main 2>&1 && (${inputCmd}./main) 2>&1`;
      } else if (language === "c") {
        runCommand = `printf "${encoded}" | base64 -d > main.c && gcc main.c -o main 2>&1 && (${inputCmd}./main) 2>&1`;
      } else if (language === "java") {
        runCommand = `printf "${encoded}" | base64 -d > Main.java && javac Main.java 2>&1 && (${inputCmd}java Main) 2>&1`;
      } else {
        return resolve({ output: "", error: "Unsupported language" });
      }

      // Docker command with resource limits
      const dockerCommand = `docker run --rm --memory=${LIMITS.DOCKER_MEMORY} --cpus=${LIMITS.DOCKER_CPUS} --pids-limit=${LIMITS.DOCKER_PIDS} --network=none code-runner sh -c "${runCommand}"`;

      exec(
        dockerCommand,
        {
          timeout: LIMITS.EXECUTION_TIMEOUT,
          maxBuffer: LIMITS.MAX_OUTPUT_SIZE,
        },
        (error, stdout, stderr) => {
          let result: { output: string; error: string | null };

          // Time limit (process killed by timeout)
          if (error && (error as any).killed) {
            result = { output: "", error: "TIME_LIMIT_EXCEEDED" };
          }
          // Output too large
          else if (error && error.message.includes("maxBuffer")) {
            result = { output: "", error: "OUTPUT_TOO_LARGE" };
          }
          // Compile/runtime error
          else if (error) {
            result = { output: "", error: stderr || error.message };
          }
          // Success
          else {
            result = { output: stdout, error: null };
          }

          // Cache successful results and deterministic errors
          if (resultCache.size >= MAX_CACHE_SIZE) {
            // Evict oldest entry
            const firstKey = resultCache.keys().next().value;
            if (firstKey) resultCache.delete(firstKey);
          }
          resultCache.set(cacheKey, result);

          resolve(result);
        }
      );
    } catch (err: any) {
      resolve({ output: "", error: err.message });
    }
  });
};