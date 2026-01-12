import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Question } from '@/contexts/DataContext';
import { Plus, Trash2, Sparkles, Loader2, CheckCircle } from 'lucide-react';

export default function CreateAssessment() {
  const { user } = useAuth();
  const { addAssessment } = useData();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [language, setLanguage] = useState('JavaScript');
  const [timeLimit, setTimeLimit] = useState<number | undefined>();
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([]);

  // AI generation states
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiLanguage, setAiLanguage] = useState('JavaScript');
  const [aiReference, setAiReference] = useState('LeetCode');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  const languages = ['JavaScript', 'Python', 'Java', 'C++', 'C', 'Go', 'Rust', 'TypeScript'];
  const references = ['LeetCode', 'HackerRank', 'CodeChef', 'Codeforces', 'GeeksForGeeks'];

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: '',
        description: '',
        difficulty: 'easy',
        language,
        starterCode: getStarterCode(language),
        testCases: [{ input: '', expectedOutput: '' }],
      },
    ]);
  };

  const getStarterCode = (lang: string) => {
    const templates: Record<string, string> = {
      JavaScript: `function solution(input) {\n  // Write your code here\n  \n}`,
      Python: `def solution(input):\n    # Write your code here\n    pass`,
      Java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
      'C++': `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
    };
    return templates[lang] || templates.JavaScript;
  };

  const updateQuestion = (index: number, updates: Partial<Omit<Question, 'id'>>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const generateWithAI = async () => {
    setAiGenerating(true);
    
    // Simulated AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const generatedQuestion: Omit<Question, 'id'> = {
      title: `${aiDifficulty === 'easy' ? 'Sum of Array' : aiDifficulty === 'medium' ? 'Two Sum Problem' : 'Merge Intervals'}`,
      description: aiDifficulty === 'easy' 
        ? 'Given an array of integers, return the sum of all elements.'
        : aiDifficulty === 'medium'
        ? 'Given an array of integers and a target, return indices of two numbers that add up to the target.'
        : 'Given a collection of intervals, merge all overlapping intervals.',
      difficulty: aiDifficulty,
      language: aiLanguage,
      starterCode: getStarterCode(aiLanguage),
      testCases: [
        { input: aiDifficulty === 'easy' ? '[1, 2, 3]' : '[2, 7, 11, 15], 9', expectedOutput: aiDifficulty === 'easy' ? '6' : '[0, 1]' },
        { input: aiDifficulty === 'easy' ? '[10, 20, 30]' : '[3, 2, 4], 6', expectedOutput: aiDifficulty === 'easy' ? '60' : '[1, 2]' },
      ],
    };

    setQuestions([...questions, generatedQuestion]);
    setAiGenerating(false);
    setAiSuccess(true);
    setTimeout(() => setAiSuccess(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || questions.length === 0) return;

    addAssessment({
      title,
      description,
      difficulty,
      language,
      timeLimit,
      questions: questions.map((q, i) => ({ ...q, id: `q-${i}` })),
      createdBy: user.id,
    });

    navigate('/teacher/assessments');
  };

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        <h1 className="section-title">Create Assessment</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="card-elevated">
            <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label-text">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., JavaScript Fundamentals"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-text">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Describe what this assessment covers..."
                  required
                />
              </div>

              <div>
                <label className="label-text">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="select-field"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="label-text">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="select-field"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">Time Limit (minutes, optional)</label>
                <input
                  type="number"
                  value={timeLimit || ''}
                  onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="input-field"
                  placeholder="No limit"
                  min={5}
                  max={180}
                />
              </div>
            </div>
          </div>

          {/* AI Generation */}
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Questions</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className="flex items-center gap-2 btn-secondary"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Generate
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-2 btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Manual
                </button>
              </div>
            </div>

            {/* AI Panel */}
            {showAIPanel && (
              <div className="bg-secondary/50 rounded-lg p-4 mb-6 border border-border">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Question Generator
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="label-text">Difficulty</label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                      className="select-field"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Language</label>
                    <select
                      value={aiLanguage}
                      onChange={(e) => setAiLanguage(e.target.value)}
                      className="select-field"
                    >
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Reference Style</label>
                    <select
                      value={aiReference}
                      onChange={(e) => setAiReference(e.target.value)}
                      className="select-field"
                    >
                      {references.map((ref) => (
                        <option key={ref} value={ref}>{ref}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={generateWithAI}
                  disabled={aiGenerating}
                  className="btn-primary flex items-center gap-2"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : aiSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Generated!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Question
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Questions list */}
            {questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No questions added yet. Use the buttons above to add questions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-foreground">Question {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-muted-foreground hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <label className="label-text">Question Title</label>
                        <input
                          type="text"
                          value={question.title}
                          onChange={(e) => updateQuestion(index, { title: e.target.value })}
                          className="input-field"
                          placeholder="e.g., Reverse a String"
                          required
                        />
                      </div>

                      <div>
                        <label className="label-text">Description</label>
                        <textarea
                          value={question.description}
                          onChange={(e) => updateQuestion(index, { description: e.target.value })}
                          className="input-field min-h-[80px] resize-none"
                          placeholder="Describe the problem..."
                          required
                        />
                      </div>

                      <div>
                        <label className="label-text">Starter Code</label>
                        <textarea
                          value={question.starterCode}
                          onChange={(e) => updateQuestion(index, { starterCode: e.target.value })}
                          className="input-field font-mono text-sm min-h-[120px] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/teacher/assessments')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title || !description || questions.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
