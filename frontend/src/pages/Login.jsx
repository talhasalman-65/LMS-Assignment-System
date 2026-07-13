import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { Button } from '@/components/ui';
import { LogIn, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isCheckingSession = useAuthStore((s) => s.isCheckingSession);
  const addToast = useUIStore((s) => s.addToast);
  const navigate = useNavigate();

  useEffect(() => {
    if (isCheckingSession) return;

    if (isAuthenticated && user) {
      navigate(`/app/${user.role}/dashboard`, { replace: true });
    }
  }, [isCheckingSession, isAuthenticated, user, navigate]);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[var(--bg-sidebar)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      addToast({
        message: `Welcome back, ${result.user.fullName || result.user.full_name || ''}`,
        type: 'success',
      });
      navigate(`/app/${result.user.role}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-sidebar)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-card)] rounded-lg shadow-lg overflow-hidden">
        <div className="text-center pt-8 pb-6 px-8">
          <div className="w-10 h-10 rounded bg-teal flex items-center justify-center text-white font-bold text-lg mx-auto">
            S
          </div>
          <h1 className="text-xl font-bold mt-3">SmartAssign LMS</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Assignment Submission & Evaluation System
          </p>
        </div>

        <div className="px-8 pb-8">
          {error && (
            <div className="bg-danger/10 text-danger text-sm px-4 py-2.5 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-colors"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-colors"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-secondary)] font-medium mb-2">
              Demo Accounts:
            </p>
            <div className="text-xs text-[var(--text-muted)] space-y-0.5">
              <p>Admin: admin@smartassign.com</p>
              <p>Teacher: teacher@smartassign.com</p>
              <p>Students: student1@smartassign.com / student2@smartassign.com</p>
              <p className="mt-1">
                Password: <code className="text-[var(--text-primary)]">Password1</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
