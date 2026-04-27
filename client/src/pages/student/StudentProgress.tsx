import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default function StudentProgress() {
  const { user } = useAuth();

  // 🔥 FIX: use submissions directly
  const { submissions, assessments } = useData();

  const mySubmissions = user
    ? submissions.filter((s) => s.userId === user.id)
    : [];

  const submissionsByDate = mySubmissions.reduce((acc, sub) => {
    const date = new Date(sub.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(sub);
    return acc;
  }, {} as Record<string, typeof mySubmissions>);

  const correctSubmissions = mySubmissions.filter(
    (s) => s.status === 'ACCEPTED'
  ).length;

  const accuracy =
    mySubmissions.length > 0
      ? (correctSubmissions / mySubmissions.length) * 100
      : 0;

  const getAssessmentTitle = (assessmentId: string) => {
    return (
      assessments.find((a) => a.id === assessmentId)?.title ||
      'Unknown Assessment'
    );
  };

  return (
    <div className="page-container">
      <h1 className="section-title">My Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <p className="text-2xl font-bold">{mySubmissions.length}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>

        <div className="stat-card">
          <p className="text-2xl font-bold text-easy">
            {correctSubmissions}
          </p>
          <p className="text-sm text-muted-foreground">Correct</p>
        </div>

        <div className="stat-card">
          <p className="text-2xl font-bold text-error">
            {mySubmissions.length - correctSubmissions}
          </p>
          <p className="text-sm text-muted-foreground">Incorrect</p>
        </div>

        <div className="stat-card">
          <p className="text-2xl font-bold">
            {accuracy.toFixed(0)}%
          </p>
          <p className="text-sm text-muted-foreground">Accuracy</p>
        </div>
      </div>

      <div className="card-elevated">
        <h2 className="text-lg font-semibold mb-6">
          Submission History
        </h2>

        {mySubmissions.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(submissionsByDate).map(([date, subs]) => (
              <div key={date}>
                <h3 className="text-sm text-muted-foreground mb-2">
                  {date}
                </h3>

                {subs.map((sub) => (
                  <div key={sub.id} className="p-3 bg-secondary rounded mb-2">
                    <div className="flex justify-between">
                      <span>
                        {getAssessmentTitle(sub.assignmentId)}
                      </span>
                      <span>
                        {sub.status === 'ACCEPTED' ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No submissions yet
          </p>
        )}
      </div>
    </div>
  );
}