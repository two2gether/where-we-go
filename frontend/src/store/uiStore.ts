import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Notification[];
  loadingStates: Record<string, boolean>;
  modals: Record<string, boolean>;
}

interface UIActions {
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (key: string, loading: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
}

// Store
export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      sidebarOpen: false,
      notifications: [],
      loadingStates: {},
      modals: {},

      // Actions
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),

      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
        const actualTheme = theme === 'system' 
          ? window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? 'dark' 
            : 'light'
          : theme;
          
        document.documentElement.classList.toggle('dark', actualTheme === 'dark');
      },

      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(7);
        const newNotification = { ...notification, id };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      },

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      setLoading: (key, loading) => set((state) => ({
        loadingStates: {
          ...state.loadingStates,
          [key]: loading
        }
      })),

      openModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: true }
      })),

      closeModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: false }
      })),
    }),
    {
      name: 'where-we-go-ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);