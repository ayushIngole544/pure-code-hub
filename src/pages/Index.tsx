import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Code2, Users, BookOpen, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function Index() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPaths = {
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
        professional: '/professional/dashboard',
      };
      navigate(dashboardPaths[user.role]);
    }
  }, [isAuthenticated, user, navigate]);

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Interactive Assessments',
      description: 'Create and solve coding challenges with real-time feedback',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Role-Based Access',
      description: 'Tailored experiences for students, teachers, and professionals',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI-Powered Questions',
      description: 'Generate questions automatically based on difficulty and topic',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CodeHub</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm font-medium text-foreground mb-6">
            <Zap className="w-4 h-4 text-primary" />
            Your coding journey starts here
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Master coding with
            <span className="text-primary"> interactive</span> assessments
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            CodeHub is the all-in-one platform for students, teachers, and professionals to learn, teach, and practice coding skills.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary py-3 px-8 text-lg flex items-center justify-center gap-2"
            >
              Start Learning
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-outline py-3 px-8 text-lg"
            >
              I'm a Teacher
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed for modern coding education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card-elevated hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Choose your path
            </h2>
            <p className="text-muted-foreground text-lg">
              Select your role to get a personalized experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-elevated text-center hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('/login')}>
              <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-easy" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Student</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Solve assessments, track progress, and improve your coding skills
              </p>
              <span className="text-primary font-medium text-sm">Get Started →</span>
            </div>

            <div className="card-elevated text-center hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('/login')}>
              <div className="w-16 h-16 bg-info-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Teacher</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create assessments, monitor students, and manage your workspace
              </p>
              <span className="text-primary font-medium text-sm">Get Started →</span>
            </div>

            <div className="card-elevated text-center hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('/login')}>
              <div className="w-16 h-16 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Professional</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Sharpen your skills with challenging problems and track your growth
              </p>
              <span className="text-primary font-medium text-sm">Get Started →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">CodeHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 CodeHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
