import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Code2, LogOut, User } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'teacher':
        return [
          { path: '/teacher/dashboard', label: 'Dashboard' },
          { path: '/teacher/assessments', label: 'Assessments' },
          { path: '/teacher/create', label: 'Create' },
          { path: '/teacher/workspace', label: 'Workspace' },
          { path: '/teacher/students', label: 'Students' },
        ];
      case 'student':
        return [
          { path: '/student/dashboard', label: 'Dashboard' },
          { path: '/student/assessments', label: 'Assessments' },
          { path: '/student/progress', label: 'Progress' },
        ];
      case 'professional':
        return [
          { path: '/professional/dashboard', label: 'Dashboard' },
          { path: '/professional/practice', label: 'Practice' },
          { path: '/professional/challenges', label: 'Challenges' },
        ];
      default:
        return [];
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CodeHub</span>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {getNavLinks().map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{user?.name}</span>
                  <span className="px-2 py-0.5 bg-secondary rounded-full text-xs capitalize">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {isAuthenticated && (
          <div className="md:hidden flex overflow-x-auto pb-2 -mx-4 px-4 gap-1">
            {getNavLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link whitespace-nowrap text-sm ${isActive(link.path) ? 'nav-link-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
