import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default function StudentProgress() {
  const { user } = useAuth();
  const { getStudentSubmissions, assessments } = useData();

  const mySubmissions = user ? getStudentSubmissions(user.id) : [];
  
  // Group submissions by date
  const submissionsByDate = mySubmissions.reduce((acc, sub) => {
    const date = new Date(sub.submittedAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(sub);
    return acc;
  }, {} as Record<string, typeof mySubmissions>);

  // Calculate streaks and stats
  const correctSubmissions = mySubmissions.filter(s => s.isCorrect).length;
  const accuracy = mySubmissions.length > 0 ? (correctSubmissions / mySubmissions.length) * 100 : 0;

  // Get assessment titles for submissions
  const getAssessmentTitle = (assessmentId: string) => {
    return assessments.find(a => a.id === assessmentId)?.title || 'Unknown Assessment';
  };

  return (
    <div className="page-container">
      <h1 className="section-title">My Progress</h1>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mySubmissions.length}</p>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-easy" />
            </div>
            <div>
              <p className="text-2xl font-bold text-easy">{correctSubmissions}</p>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-error-light rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-error" />
            </div>
            <div>
              <p className="text-2xl font-bold text-error">{mySubmissions.length - correctSubmissions}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{accuracy.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="card-elevated">
        <h2 className="text-lg font-semibold text-foreground mb-6">Submission History</h2>

        {mySubmissions.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(submissionsByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, subs]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {date}
                  </h3>
                  <div className="space-y-2 ml-6">
                    {subs.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {sub.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-easy" />
                          ) : (
                            <XCircle className="w-5 h-5 text-error" />
                          )}
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {getAssessmentTitle(sub.assessmentId)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(sub.submittedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          sub.isCorrect ? 'bg-success-light text-easy' : 'bg-error-light text-error'
                        }`}>
                          {sub.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No submissions yet. Start solving assessments!</p>
          </div>
        )}
      </div>
    </div>
  );
}
