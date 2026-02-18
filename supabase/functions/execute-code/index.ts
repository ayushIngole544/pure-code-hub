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
    const { code, language } = await req.json();

    if (!code || !language) {
      return new Response(JSON.stringify({ error: 'Code and language are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map language names to Piston API format
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

    const startTime = Date.now();

    // Call Piston API (free, no API key needed)
    const pistonResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: code }],
        run_timeout: 10000, // 10 second timeout
        compile_timeout: 10000,
        compile_memory_limit: 256000000, // 256MB
        run_memory_limit: 256000000,
      }),
    });

    const executionTime = Date.now() - startTime;

    if (!pistonResponse.ok) {
      return new Response(JSON.stringify({
        error: 'Code execution service unavailable',
        output: 'The code execution service is currently unavailable. Please try again later.',
        executionTime,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await pistonResponse.json();

    const output = result.run?.output || result.compile?.output || 'No output';
    const stderr = result.run?.stderr || result.compile?.stderr || '';
    const exitCode = result.run?.code ?? result.compile?.code ?? -1;

    return new Response(JSON.stringify({
      output: output.trim(),
      stderr: stderr.trim(),
      exitCode,
      executionTime,
      language: langConfig.language,
      version: langConfig.version,
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
