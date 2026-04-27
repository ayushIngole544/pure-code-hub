import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Code2, LogOut, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ============================
  // 🔥 FETCH NOTIFICATIONS
  // ============================
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error("Notification fetch error:", err);
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  const unreadCount = notifications.length;

  const getNavLinks = () => {
    if (!user) return [];

    const common = [{ path: '/leaderboard', label: 'Leaderboard' }];

    switch (user.role) {
      case 'teacher':
        return [
          { path: '/teacher/dashboard', label: 'Dashboard' },
          { path: '/teacher/assessments', label: 'Assessments' },
          { path: '/teacher/create', label: 'Create' },
          { path: '/teacher/workspace', label: 'Workspace' },
          { path: '/teacher/students', label: 'Students' },
          ...common,
        ];
      case 'student':
        return [
          { path: '/student/dashboard', label: 'Dashboard' },
          { path: '/student/assessments', label: 'Assessments' },
          { path: '/student/progress', label: 'Progress' },
          ...common,
        ];
      case 'professional':
        return [
          { path: '/professional/dashboard', label: 'Dashboard' },
          { path: '/professional/practice', label: 'Practice' },
          { path: '/professional/editor', label: 'Editor' },
          { path: '/professional/challenges', label: 'Challenges' },
          ...common,
        ];
      default:
        return common;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CodeHub</span>
          </Link>

          {/* NAV LINKS */}
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

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-4">

            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="relative p-2 rounded-lg hover:bg-secondary"
                >
                  <Bell className="w-5 h-5" />

                  {/* 🔴 BADGE */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* 🔽 DROPDOWN */}
                {open && (
                  <div className="absolute right-0 mt-2 w-80 bg-card border rounded-lg shadow-lg p-3 z-50">
                    <h3 className="font-semibold mb-2">Notifications</h3>

                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No notifications
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-auto">
                        {notifications.map((n, i) => (
                          <div
                            key={i}
                            className="p-2 rounded bg-secondary text-sm"
                          >
                            {n.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE */}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span>{user?.name}</span>
                  <span className="px-2 py-0.5 bg-secondary rounded-full text-xs capitalize">
                    {user?.role}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
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

        {/* MOBILE NAV */}
        {isAuthenticated && (
          <div className="md:hidden flex overflow-x-auto pb-2 -mx-4 px-4 gap-1">
            {getNavLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link whitespace-nowrap text-sm ${
                  isActive(link.path) ? 'nav-link-active' : ''
                }`}
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