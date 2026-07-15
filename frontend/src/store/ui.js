import { create } from 'zustand';

export const useUIStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'light',
  sidebarOpen:
    localStorage.getItem('sidebarOpen') !== null
      ? localStorage.getItem('sidebarOpen') === 'true'
      : true,
  toasts: [],

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return { theme: next };
    }),

  setSidebarOpen: (open) => {
    localStorage.setItem('sidebarOpen', String(open));
    set({ sidebarOpen: open });
  },
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarOpen;
      localStorage.setItem('sidebarOpen', String(next));
      return { sidebarOpen: next };
    }),

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), ...toast }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
