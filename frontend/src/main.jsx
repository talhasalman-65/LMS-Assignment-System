import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { getMe } from './api/client';
import { useAuthStore } from './store/auth';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

function App() {
  const [ready, setReady] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const setSessionChecked = useAuthStore((s) => s.setSessionChecked);

  useEffect(() => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated) {
      setSessionChecked();
      setReady(true);
      return;
    }

    getMe()
      .then((user) => {
        setUser(user);
        setSessionChecked();
        setReady(true);
      })
      .catch(() => {
        logout();
        setSessionChecked();
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded bg-teal flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <div className="w-6 h-6 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

initTheme();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
