// ==========================================
// 🤖 Hybrid AI Question Generator Service
// Uses OpenAI if OPENAI_API_KEY exists, else returns structured mock
// ==========================================

interface AIQuestionRequest {
  topic: string;
  difficulty: string;
  type: "MCQ" | "NAT" | "CODING";
}

interface AIQuestionResponse {
  title: string;
  difficulty: string;
  description: string;
  constraints?: string;
  examples?: { input: string; output: string; explanation: string }[];
  options?: string[];
  correctAnswer?: string;
  starterCode?: Record<string, string>;
  testCases?: { input: string; output: string; isHidden?: boolean }[];
}

// ==========================================
// 🔥 MOCK GENERATOR (fallback)
// ==========================================
function generateMockQuestion(req: AIQuestionRequest): AIQuestionResponse {
  const { topic, difficulty, type } = req;

  // 🔥 Random helpers
  const rand = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  const randomNum = () => Math.floor(Math.random() * 50) + 1;

  if (type === "MCQ") {
    const questions = [
      `Which of the following is true about ${topic}?`,
      `What is a key property of ${topic}?`,
      `Which statement best describes ${topic}?`,
      `Which of these is correct regarding ${topic}?`,
    ];

    const correctOptions = [
      `${topic} can be implemented efficiently`,
      `${topic} optimizes certain operations`,
      `${topic} is widely used in algorithms`,
      `${topic} improves performance in some cases`,
    ];

    const wrongOptions = [
      `${topic} always runs in O(1) time`,
      `${topic} cannot be used in real applications`,
      `${topic} is never recursive`,
      `${topic} always uses FIFO`,
      `${topic} always uses LIFO`,
    ];

    const correct = rand(correctOptions);

    const options = [
      correct,
      rand(wrongOptions),
      rand(wrongOptions),
      rand(wrongOptions),
    ].sort(() => Math.random() - 0.5);

    return {
      title: `${topic} MCQ (${difficulty}) #${randomNum()}`, // 🔥 UNIQUE TITLE
      difficulty,
      description: rand(questions),
      options,
      correctAnswer: correct,
    };
  }

  if (type === "NAT") {
    const n = randomNum();

    return {
      title: `${topic} NAT (${difficulty}) #${n}`,
      difficulty,
      description: `If a problem size is ${n}, what is log2(n) (approx)?`,
      correctAnswer: Math.ceil(Math.log2(n)).toString(),
    };
  }

  // CODING
  const size = randomNum();

  return {
    title: `${topic} Coding (${difficulty}) #${size}`,
    difficulty,
    description: `Given an array of size ${size}, sort it using ${topic}.`,
    constraints: `1 <= N <= ${size}`,
    examples: [
      {
        input: `${size}\n${Array.from({ length: size }, () =>
          Math.floor(Math.random() * 100)
        ).join(" ")}`,
        output: "Sorted array",
        explanation: "Sort the array",
      },
    ],
    starterCode: {
      cpp: "// C++ starter",
      java: "// Java starter",
      python: "# Python starter",
      c: "// C starter",
    },
    testCases: [
      {
        input: `${size}\n${Array.from({ length: size }, () =>
          Math.floor(Math.random() * 100)
        ).join(" ")}`,
        output: "sorted output",
        isHidden: false,
      },
      {
        input: `1\n42`,
        output: "42",
        isHidden: true,
      },
    ],
  };
}

// ==========================================
// 🔥 OPENAI GENERATOR (FIXED FOR v6)
// ==========================================
async function generateWithOpenAI(
  req: AIQuestionRequest
): Promise<AIQuestionResponse> {
  let OpenAI: any;

  try {
    OpenAI = (await import("openai")).default;
  } catch {
    throw new Error("openai package not installed. Run: pnpm add openai");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const systemPrompt = `
You are an expert programming question generator.

Return ONLY valid JSON (no markdown, no extra text).

Format strictly:

${
  req.type === "CODING"
    ? `{
  "title": "string",
  "difficulty": "${req.difficulty}",
  "description": "string",
  "constraints": "string",
  "examples": [{"input": "string", "output": "string", "explanation": "string"}],
  "starterCode": {"cpp": "string", "java": "string", "python": "string", "c": "string"},
  "testCases": [{"input": "string", "output": "string", "isHidden": boolean}]
}`
    : req.type === "MCQ"
    ? `{
  "title": "string",
  "difficulty": "${req.difficulty}",
  "description": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": "string"
}`
    : `{
  "title": "string",
  "difficulty": "${req.difficulty}",
  "description": "string",
  "correctAnswer": "string"
}`
}
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate a ${req.difficulty} ${req.type} question about: ${req.topic}`,
      },
    ],
    temperature: 0.7,
    max_output_tokens: 2000,
  });

  const content = response.output_text?.trim();

  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  let jsonStr = content;

  // Remove markdown if present
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");
  }

  try {
    return JSON.parse(jsonStr) as AIQuestionResponse;
  } catch {
    throw new Error("Invalid JSON from OpenAI: " + content.slice(0, 200));
  }
}

// ==========================================
// 🔥 MAIN EXPORT
// ==========================================
export async function generateAIQuestion(
  req: AIQuestionRequest
): Promise<AIQuestionResponse> {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateWithOpenAI(req);
    } catch (error: any) {
      console.error("OpenAI failed, fallback:", error.message);
      return generateMockQuestion(req);
    }
  }

  return generateMockQuestion(req);
}