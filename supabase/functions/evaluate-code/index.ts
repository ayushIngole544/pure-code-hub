import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, test_cases } = await req.json();

    if (!code || !language || !test_cases?.length) {
      return new Response(JSON.stringify({ error: 'Code, language, and test_cases are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const languageMap: Record<string, { language: string; version: string }> = {
      javascript: { language: 'javascript', version: '18.15.0' },
      python: { language: 'python', version: '3.10.0' },
      java: { language: 'java', version: '15.0.2' },
      'c++': { language: 'c++', version: '10.2.0' },
      cpp: { language: 'c++', version: '10.2.0' },
      c: { language: 'c', version: '10.2.0' },
      go: { language: 'go', version: '1.16.2' },
      rust: { language: 'rust', version: '1.68.2' },
      typescript: { language: 'typescript', version: '5.0.3' },
    };

    const langConfig = languageMap[language.toLowerCase()];
    if (!langConfig) {
      return new Response(JSON.stringify({ error: `Unsupported language: ${language}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];
    let passedCount = 0;
    const startTime = Date.now();

    for (const tc of test_cases) {
      // Wrap the user's code with test case input
      const wrappedCode = wrapCodeWithInput(code, language, tc.input);

      try {
        const pistonResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: langConfig.language,
            version: langConfig.version,
            files: [{ content: wrappedCode }],
            run_timeout: 10000,
            compile_timeout: 10000,
            run_memory_limit: 256000000,
          }),
        });

        if (!pistonResponse.ok) {
          results.push({
            input: tc.input,
            expected: tc.expectedOutput,
            actual: 'Execution service unavailable',
            passed: false,
            error: true,
          });
          continue;
        }

        const result = await pistonResponse.json();
        const output = (result.run?.output || result.compile?.output || '').trim();
        const stderr = result.run?.stderr || result.compile?.stderr || '';
        const expected = tc.expectedOutput.trim();
        const passed = output === expected;

        if (passed) passedCount++;

        results.push({
          input: tc.input,
          expected,
          actual: output,
          passed,
          error: stderr ? stderr.trim() : null,
        });
      } catch (err) {
        results.push({
          input: tc.input,
          expected: tc.expectedOutput,
          actual: 'Execution failed',
          passed: false,
          error: err.message,
        });
      }
    }

    const totalTime = Date.now() - startTime;
    const totalCases = test_cases.length;
    const score = totalCases > 0 ? Math.round((passedCount / totalCases) * 100) : 0;

    return new Response(JSON.stringify({
      passed: passedCount,
      total: totalCases,
      score,
      is_correct: passedCount === totalCases,
      execution_time_ms: totalTime,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function wrapCodeWithInput(code: string, language: string, input: string): string {
  // The code is expected to read from stdin or process input
  // We'll prepend the input as a variable or pipe it
  const lang = language.toLowerCase();

  if (lang === 'javascript' || lang === 'typescript') {
    return `${code}\n\n// Auto-injected test runner\nconst __input = ${JSON.stringify(input)};\ntry {\n  if (typeof solution === 'function') {\n    console.log(solution(__input));\n  }\n} catch(e) { console.error(e.message); }`;
  }

  if (lang === 'python') {
    return `${code}\n\n# Auto-injected test runner\n__input = ${JSON.stringify(input)}\ntry:\n    if callable(solution):\n        print(solution(__input))\nexcept Exception as e:\n    print(str(e))`;
  }

  // For compiled languages, just run the code as-is with stdin simulation
  return code;
}
