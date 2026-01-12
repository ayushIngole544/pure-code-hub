import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { StatCard } from '@/components/StatCard';
import { AssessmentCard } from '@/components/AssessmentCard';
import { useNavigate } from 'react-router-dom';
import { Code, Target, Zap, Award } from 'lucide-react';

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const { assessments, getStudentSubmissions } = useData();
  const navigate = useNavigate();

  const mySubmissions = user ? getStudentSubmissions(user.id) : [];
  const correctSubmissions = mySubmissions.filter(s => s.isCorrect).length;

  // Calculate skill level based on submissions
  const getSkillLevel = () => {
    if (correctSubmissions >= 50) return { level: 'Expert', color: 'text-primary' };
    if (correctSubmissions >= 20) return { level: 'Advanced', color: 'text-easy' };
    if (correctSubmissions >= 5) return { level: 'Intermediate', color: 'text-warning' };
    return { level: 'Beginner', color: 'text-muted-foreground' };
  };

  const skill = getSkillLevel();

  // Get challenging assessments (medium/hard)
  const challenges = assessments.filter(a => a.difficulty !== 'easy').slice(0, 6);

  return (
    <div className="page-container">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Sharpen your skills with professional-level challenges
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Problems Solved"
          value={mySubmissions.length}
          icon={<Code className="w-6 h-6" />}
          description="Keep coding!"
        />
        <StatCard
          title="Success Rate"
          value={`${mySubmissions.length > 0 ? ((correctSubmissions / mySubmissions.length) * 100).toFixed(0) : 0}%`}
          icon={<Target className="w-6 h-6" />}
          trend="up"
          trendValue="Improving!"
        />
        <StatCard
          title="Current Streak"
          value={`${Math.floor(Math.random() * 10) + 1} days`}
          icon={<Zap className="w-6 h-6" />}
          description="Don't break it!"
        />
        <StatCard
          title="Skill Level"
          value={skill.level}
          icon={<Award className="w-6 h-6" />}
          description={`${50 - correctSubmissions > 0 ? `${50 - correctSubmissions} more to Expert` : 'You made it!'}`}
        />
      </div>

      {/* Skill progress */}
      <div className="card-elevated mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Skill Progress</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Easy Problems</span>
              <span className="font-medium text-easy">Mastered</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-easy rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Medium Problems</span>
              <span className="font-medium text-warning">In Progress</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-warning rounded-full" style={{ width: '60%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Hard Problems</span>
              <span className="font-medium text-error">Learning</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-error rounded-full" style={{ width: '25%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Challenges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recommended Challenges</h2>
          <button
            onClick={() => navigate('/professional/challenges')}
            className="text-sm text-primary font-medium hover:underline"
          >
            View all
          </button>
        </div>

        {challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                onClick={() => navigate(`/professional/challenges/${assessment.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="card-elevated text-center py-12">
            <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No challenges available</h3>
            <p className="text-muted-foreground">Check back later for new challenges</p>
          </div>
        )}
      </div>
    </div>
  );
}
