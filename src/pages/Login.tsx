import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Code2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success: boolean;

      if (isSignup) {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        success = await signup(email, password, name, role);
        if (!success) {
          setError('Email already exists');
        }
      } else {
        success = await login(email, password);
        if (!success) {
          setError('Invalid email or password');
        }
      }

      if (success) {
        const dashboardPaths: Record<UserRole, string> = {
          teacher: '/teacher/dashboard',
          student: '/student/dashboard',
          professional: '/professional/dashboard',
        };
        // Get the user from localStorage to determine role
        const storedUser = localStorage.getItem('codehub_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          navigate(dashboardPaths[user.role as UserRole]);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
              <Code2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">CodeHub</span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
            Master coding with<br />interactive assessments
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Join thousands of students, teachers, and professionals improving their coding skills every day.
          </p>

          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-primary-foreground">10K+</p>
              <p className="text-primary-foreground/70 text-sm">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">500+</p>
              <p className="text-primary-foreground/70 text-sm">Assessments</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">50+</p>
              <p className="text-primary-foreground/70 text-sm">Languages</p>
            </div>
          </div>
        </div>

        <p className="text-primary-foreground/60 text-sm">
          © 2024 CodeHub. All rights reserved.
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CodeHub</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isSignup 
                ? 'Start your coding journey today' 
                : 'Sign in to continue to CodeHub'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-light rounded-lg flex items-center gap-3 text-error">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className="label-text">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="label-text">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="label-text">I am a...</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['student', 'teacher', 'professional'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-3 px-4 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                        role === r
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-primary font-medium hover:underline"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
