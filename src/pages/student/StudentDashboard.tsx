import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { StatCard } from '@/components/StatCard';
import { AssessmentCard } from '@/components/AssessmentCard';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Target, TrendingUp, BookOpen } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { assessments, getStudentSubmissions } = useData();
  const navigate = useNavigate();

  const mySubmissions = user ? getStudentSubmissions(user.id) : [];
  const correctSubmissions = mySubmissions.filter(s => s.is_correct).length;
  const uniqueAssessments = new Set(mySubmissions.map(s => s.assessment_id)).size;
  const accuracy = mySubmissions.length > 0 ? (correctSubmissions / mySubmissions.length) * 100 : 0;

  const availableAssessments = assessments.filter(a => a.is_published).slice(0, 6);

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground mt-1">Track your progress and continue learning</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Questions Solved" value={mySubmissions.length} icon={<CheckCircle className="w-6 h-6" />} description="Total submissions" />
        <StatCard title="Assessments Completed" value={uniqueAssessments} icon={<BookOpen className="w-6 h-6" />} description="Unique assessments" />
        <StatCard title="Correct Answers" value={correctSubmissions} icon={<Target className="w-6 h-6" />} trend="up" trendValue="Keep it up!" />
        <StatCard title="Accuracy" value={`${accuracy.toFixed(0)}%`} icon={<TrendingUp className="w-6 h-6" />} description={accuracy >= 70 ? 'Excellent!' : accuracy >= 40 ? 'Good progress' : 'Keep practicing'} />
      </div>

      <div className="card-elevated mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Your Progress</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Accuracy</span>
              <span className="font-medium text-foreground">{accuracy.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${accuracy}%` }} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center"><p className="text-2xl font-bold text-easy">{correctSubmissions}</p><p className="text-sm text-muted-foreground">Correct</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-error">{mySubmissions.length - correctSubmissions}</p><p className="text-sm text-muted-foreground">Incorrect</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-foreground">{mySubmissions.length}</p><p className="text-sm text-muted-foreground">Total</p></div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Available Assessments</h2>
          <button onClick={() => navigate('/student/assessments')} className="text-sm text-primary font-medium hover:underline">View all</button>
        </div>
        {availableAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableAssessments.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} onClick={() => navigate(`/student/assessments/${assessment.id}`)} />
            ))}
          </div>
        ) : (
          <div className="card-elevated text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No assessments available</h3>
            <p className="text-muted-foreground">Check back later for new assessments</p>
          </div>
        )}
      </div>
    </div>
  );
}
