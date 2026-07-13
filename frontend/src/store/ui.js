import { create } from 'zustand';

export const useUIStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'light',
  sidebarOpen: false,
  toasts: [],

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return { theme: next };
    }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), ...toast }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
