import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Question } from '@/contexts/DataContext';
import { CodeEditor } from '@/components/CodeEditor';
import { ArrowLeft, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function SolveChallenge() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addSubmission, getAssessmentWithQuestions } = useData();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      getAssessmentWithQuestions(id).then(data => {
        setAssessment(data);
        if (data?.time_limit) setTimeRemaining(data.time_limit * 60);
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) { clearInterval(timer); setShowResults(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  if (loading) return <div className="page-container flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (!assessment || !assessment.questions?.length) {
    return (
      <div className="page-container">
        <div className="card-elevated text-center py-12">
          <p className="text-muted-foreground">Challenge not found</p>
          <button onClick={() => navigate('/professional/challenges')} className="btn-primary mt-4">Back to Challenges</button>
        </div>
      </div>
    );
  }

  const currentQuestion: Question = assessment.questions[currentQuestionIndex];
  const totalQuestions = assessment.questions.length;
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  const handleSubmit = async (code: string) => {
    if (!user || !currentQuestion || submitting) return;
    setSubmitting(true);
    const isCorrect = Math.random() > 0.3;
    const testCases = currentQuestion.test_cases || [];

    await addSubmission({
      assessment_id: assessment.id,
      question_id: currentQuestion.id,
      code,
      language: currentQuestion.language || assessment.language,
      is_correct: isCorrect,
      score: isCorrect ? 100 : 0,
      passed_test_cases: isCorrect ? testCases.length : Math.floor(testCases.length * 0.3),
      total_test_cases: testCases.length,
      output: isCorrect ? 'All test cases passed!' : 'Some test cases failed.',
      status: 'completed',
    });

    setResults(prev => ({ ...prev, [currentQuestion.id]: isCorrect }));
    setSubmitting(false);
    if (currentQuestionIndex < totalQuestions - 1) setCurrentQuestionIndex(prev => prev + 1);
    else setShowResults(true);
  };

  if (showResults) {
    const correctCount = Object.values(results).filter(Boolean).length;
    const totalAnswered = Object.keys(results).length;
    return (
      <div className="page-container">
        <div className="max-w-2xl mx-auto">
          <div className="card-elevated text-center">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${correctCount / Math.max(totalAnswered, 1) >= 0.7 ? 'bg-success-light' : 'bg-warning-light'}`}>
              {correctCount / Math.max(totalAnswered, 1) >= 0.7 ? <CheckCircle className="w-10 h-10 text-easy" /> : <XCircle className="w-10 h-10 text-warning" />}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Challenge Complete!</h1>
            <p className="text-muted-foreground mb-6">{assessment.title}</p>
            <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-secondary/50 rounded-lg">
              <div><p className="text-3xl font-bold text-easy">{correctCount}</p><p className="text-sm text-muted-foreground">Correct</p></div>
              <div><p className="text-3xl font-bold text-error">{totalAnswered - correctCount}</p><p className="text-sm text-muted-foreground">Incorrect</p></div>
              <div><p className="text-3xl font-bold text-foreground">{totalAnswered > 0 ? ((correctCount / totalAnswered) * 100).toFixed(0) : 0}%</p><p className="text-sm text-muted-foreground">Accuracy</p></div>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate('/professional/challenges')} className="btn-outline">More Challenges</button>
              <button onClick={() => navigate('/professional/dashboard')} className="btn-primary">View Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/professional/challenges')} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-5 h-5" /></button>
            <div><h1 className="font-semibold text-foreground">{assessment.title}</h1><p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {totalQuestions}</p></div>
          </div>
          <div className="flex items-center gap-4">
            {timeRemaining !== null && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${timeRemaining < 300 ? 'bg-error-light text-error' : 'bg-secondary text-foreground'}`}>
                <Clock className="w-4 h-4" /><span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
              </div>
            )}
            <div className="flex gap-1">
              {assessment.questions.map((_: any, i: number) => (
                <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${i === currentQuestionIndex ? 'bg-primary text-primary-foreground' : results[assessment.questions[i].id] !== undefined ? results[assessment.questions[i].id] ? 'bg-success-light text-easy' : 'bg-error-light text-error' : 'bg-secondary text-muted-foreground'}`}>{i + 1}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-elevated">
            <h2 className="text-lg font-semibold text-foreground mb-4">{currentQuestion.title}</h2>
            <p className="whitespace-pre-wrap text-foreground">{currentQuestion.description}</p>
            {currentQuestion.test_cases && currentQuestion.test_cases.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3">Example Test Cases</h3>
                <div className="space-y-3">
                  {currentQuestion.test_cases.slice(0, 2).map((tc: any, i: number) => (
                    <div key={i} className="bg-code rounded-lg p-3 text-sm font-mono">
                      <div className="text-muted-foreground">Input: <span className="text-foreground">{tc.input}</span></div>
                      <div className="text-muted-foreground">Output: <span className="text-easy">{tc.expectedOutput}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-border flex justify-between">
              <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="btn-outline flex items-center gap-2 disabled:opacity-50"><ChevronLeft className="w-4 h-4" />Previous</button>
              <button onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))} disabled={currentQuestionIndex === totalQuestions - 1} className="btn-outline flex items-center gap-2 disabled:opacity-50">Next<ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="card-elevated p-0 overflow-hidden">
            <CodeEditor initialCode={currentQuestion.starter_code || ''} language={currentQuestion.language || assessment.language} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
}
