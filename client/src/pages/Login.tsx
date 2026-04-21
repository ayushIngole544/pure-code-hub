import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // 🔥 DASHBOARD PATHS
  const dashboardPaths: Record<UserRole, string> = {
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    professional: '/professional/dashboard',
    admin: '/teacher/dashboard',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }

        const result = await signup(email, password, name, role);

        if (!result.success) {
          setError(result.error || 'Signup failed');
        } else {
          // ✅ after signup → go to login mode
          setIsSignup(false);
          setError('Account created! Please login.');
        }
      } else {
        const result = await login(email, password);

        if (!result.success) {
          setError(result.error || 'Invalid email or password');
        } else {
          // 🔥 REDIRECT AFTER SUCCESSFUL LOGIN
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const userRole = storedUser?.role;

          navigate(dashboardPaths[userRole] || '/');
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
            <Code2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-primary-foreground">CodeHub</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">
            Master coding with interactive assessments
          </h1>
          <p className="text-primary-foreground/80">
            Join thousands improving their coding skills daily.
          </p>
        </div>

        <p className="text-primary-foreground/60 text-sm">
          © 2024 CodeHub
        </p>
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <span className="text-xl font-bold">CodeHub</span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>

          {error && (
            <div className="mb-4 text-red-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {isSignup && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {isSignup && (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="input-field"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="professional">Professional</option>
              </select>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-4">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-primary ml-1"
            >
              {isSignup ? 'Login' : 'Sign up'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}