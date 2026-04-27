import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { StatCard } from '@/components/StatCard';
import { ProblemCard } from '@/components/ProblemCard';
import { useNavigate } from 'react-router-dom';
import { AIGenerator } from '@/components/AIGenerator';
import { Code, Target, Zap, Award } from 'lucide-react';

export default function ProfessionalDashboard() {
  const { user } = useAuth();

  // 🔥 FIX: use submissions directly
  const { assessments, submissions, problems } = useData();

  const navigate = useNavigate();

  // 🔥 FILTER USER SUBMISSIONS
  const mySubmissions = user
    ? submissions.filter((s) => s.userId === user.id)
    : [];

  // 🔥 FIX STATUS
  const correctSubmissions = mySubmissions.filter(
    (s) => s.status === 'ACCEPTED'
  ).length;

  const getSkillLevel = () => {
    if (correctSubmissions >= 50)
      return { level: 'Expert', color: 'text-primary' };

    if (correctSubmissions >= 20)
      return { level: 'Advanced', color: 'text-easy' };

    if (correctSubmissions >= 5)
      return { level: 'Intermediate', color: 'text-warning' };

    return { level: 'Beginner', color: 'text-muted-foreground' };
  };

  const skill = getSkillLevel();

  const challengeProblems = problems.slice(0, 6);

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Sharpen your skills with professional-level challenges
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <StatCard
          title="Problems Solved"
          value={mySubmissions.length}
          icon={<Code className="w-6 h-6" />}
          description="Keep coding!"
        />

        <StatCard
          title="Success Rate"
          value={`${
            mySubmissions.length > 0
              ? (
                  (correctSubmissions /
                    mySubmissions.length) *
                  100
                ).toFixed(0)
              : 0
          }%`}
          icon={<Target className="w-6 h-6" />}
          trend="up"
          trendValue="Improving!"
        />

        <StatCard
          title="Skill Level"
          value={skill.level}
          icon={<Award className="w-6 h-6" />}
          description={
            50 - correctSubmissions > 0
              ? `${50 - correctSubmissions} more to Expert`
              : 'You made it!'
          }
        />

        <StatCard
          title="Challenges Available"
          value={challengeProblems.length}
          icon={<Zap className="w-6 h-6" />}
          description="Ready for you"
        />

      </div>

      {/* AI */}
      <div className="mb-8">
        <AIGenerator />
      </div>

      {/* CHALLENGES */}
      <div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">
            Recommended Challenges
          </h2>

          <button
            onClick={() =>
              navigate('/professional/challenges')
            }
            className="text-sm text-primary font-medium hover:underline"
          >
            View all
          </button>
        </div>

        {challengeProblems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {challengeProblems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onClick={() =>
                  navigate(
                    `/professional/challenges/${problem.id}`
                  )
                }
              />
            ))}

          </div>
        ) : (
          <div className="card-elevated text-center py-12">
            <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />

            <h3 className="text-lg font-medium text-foreground mb-2">
              No challenges available
            </h3>

            <p className="text-muted-foreground">
              Check back later for new challenges
            </p>
          </div>
        )}

      </div>
    </div>
  );
} 