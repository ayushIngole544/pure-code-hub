import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { StatCard } from '@/components/StatCard';
import { AssessmentCard } from '@/components/AssessmentCard';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, CheckCircle, XCircle, Plus, TrendingUp } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { getTeacherAssessments, getAssessmentSubmissions } = useData();
  const navigate = useNavigate();

  const myAssessments = user ? getTeacherAssessments(user.id) : [];
  
  // Calculate stats
  const totalAttempts = myAssessments.reduce((acc, a) => {
    return acc + getAssessmentSubmissions(a.id).length;
  }, 0);

  const allSubmissions = myAssessments.flatMap(a => getAssessmentSubmissions(a.id));
  const correctSubmissions = allSubmissions.filter(s => s.isCorrect).length;
  const wrongSubmissions = allSubmissions.length - correctSubmissions;

  return (
    <div className="page-container">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your teaching activity
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Assessments"
          value={myAssessments.length}
          icon={<FileText className="w-6 h-6" />}
          description="Created by you"
        />
        <StatCard
          title="Student Attempts"
          value={totalAttempts}
          icon={<Users className="w-6 h-6" />}
          trend="up"
          trendValue="12% this week"
        />
        <StatCard
          title="Correct Submissions"
          value={correctSubmissions}
          icon={<CheckCircle className="w-6 h-6" />}
          description={`${allSubmissions.length > 0 ? ((correctSubmissions / allSubmissions.length) * 100).toFixed(0) : 0}% success rate`}
        />
        <StatCard
          title="Wrong Submissions"
          value={wrongSubmissions}
          icon={<XCircle className="w-6 h-6" />}
          description="Need review"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate('/teacher/create')}
          className="card-elevated flex items-center gap-4 hover:border-primary transition-colors text-left"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Create Assessment</h3>
            <p className="text-sm text-muted-foreground">Add new questions for students</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/teacher/students')}
          className="card-elevated flex items-center gap-4 hover:border-primary transition-colors text-left"
        >
          <div className="w-12 h-12 bg-info-light rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">View Students</h3>
            <p className="text-sm text-muted-foreground">Monitor student performance</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/teacher/workspace')}
          className="card-elevated flex items-center gap-4 hover:border-primary transition-colors text-left"
        >
          <div className="w-12 h-12 bg-warning-light rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">My Workspace</h3>
            <p className="text-sm text-muted-foreground">Manage your private content</p>
          </div>
        </button>
      </div>

      {/* Recent assessments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recent Assessments</h2>
          <button
            onClick={() => navigate('/teacher/assessments')}
            className="text-sm text-primary font-medium hover:underline"
          >
            View all
          </button>
        </div>

        {myAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAssessments.slice(0, 3).map((assessment) => {
              const submissions = getAssessmentSubmissions(assessment.id);
              const correct = submissions.filter(s => s.isCorrect).length;
              return (
                <AssessmentCard
                  key={assessment.id}
                  assessment={assessment}
                  onClick={() => navigate(`/teacher/assessments/${assessment.id}`)}
                  showStats
                  attempts={submissions.length}
                  correctRate={submissions.length > 0 ? (correct / submissions.length) * 100 : 0}
                />
              );
            })}
          </div>
        ) : (
          <div className="card-elevated text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No assessments yet</h3>
            <p className="text-muted-foreground mb-4">Create your first assessment to get started</p>
            <button
              onClick={() => navigate('/teacher/create')}
              className="btn-primary"
            >
              Create Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
