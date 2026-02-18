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
    const { difficulty, language, reference } = await req.json();

    // Try to use Lovable AI Gateway
    const apiKey = Deno.env.get('LOVABLE_API_KEY');

    if (apiKey) {
      const prompt = `Generate a coding problem for a ${difficulty} difficulty level in ${language}, inspired by ${reference} style problems. 
      
      Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
      {
        "title": "problem title",
        "description": "detailed problem description with examples",
        "starter_code": "starter code template in ${language}",
        "language": "${language}",
        "test_cases": [
          {"input": "example input", "expectedOutput": "expected output"},
          {"input": "example input 2", "expectedOutput": "expected output 2"}
        ]
      }`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        
        if (content) {
          try {
            // Try to parse the JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const question = JSON.parse(jsonMatch[0]);
              return new Response(JSON.stringify({ question }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
          }
        }
      }
    }

    // Fallback: return a pre-built question
    const questions: Record<string, any> = {
      easy: {
        title: 'Sum of Array Elements',
        description: 'Given an array of integers, return the sum of all elements.\n\nExample:\nInput: [1, 2, 3, 4, 5]\nOutput: 15\n\nConstraints:\n- 1 <= arr.length <= 1000\n- -1000 <= arr[i] <= 1000',
        test_cases: [
          { input: '[1, 2, 3, 4, 5]', expectedOutput: '15' },
          { input: '[10, -5, 3]', expectedOutput: '8' },
        ],
      },
      medium: {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
        test_cases: [
          { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
          { input: '[3,2,4], 6', expectedOutput: '[1,2]' },
        ],
      },
      hard: {
        title: 'Merge Intervals',
        description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.\n\nReturn an array of the non-overlapping intervals that cover all the intervals in the input.\n\nExample:\nInput: [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]',
        test_cases: [
          { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
          { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]' },
        ],
      },
    };

    const templates: Record<string, string> = {
      JavaScript: `function solution(input) {\n  // Write your code here\n}`,
      Python: `def solution(input):\n    # Write your code here\n    pass`,
      Java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
      'C++': `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
    };

    const q = questions[difficulty] || questions.medium;
    const question = {
      ...q,
      language,
      starter_code: templates[language] || templates.JavaScript,
    };

    return new Response(JSON.stringify({ question }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
