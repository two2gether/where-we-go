import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import { App } from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { QueryProvider } from './providers/QueryProvider';

import './styles/globals.css';

// Toast configuration
const toastOptions = {
  duration: 4000,
  position: 'top-right' as const,
  toastOptions: {
    className: 'toast',
    style: {
      background: '#ffffff',
      color: '#1f2937',
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    success: {
      iconTheme: {
        primary: '#22c55e',
        secondary: '#ffffff',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
    },
  },
};

// App initialization
const initializeApp = () => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryProvider>
          <App />
          <Toaster {...toastOptions} />
        </QueryProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

// Initialize theme before app render
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('where-we-go-ui')
    ? JSON.parse(localStorage.getItem('where-we-go-ui')!).state?.theme
    : 'system';

  let actualTheme = savedTheme;
  
  if (savedTheme === 'system') {
    actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }

  document.documentElement.classList.toggle('dark', actualTheme === 'dark');
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = localStorage.getItem('where-we-go-ui')
      ? JSON.parse(localStorage.getItem('where-we-go-ui')!).state?.theme
      : 'system';
      
    if (currentTheme === 'system') {
      document.documentElement.classList.toggle('dark', e.matches);
    }
  });
};

// Performance monitoring
const measurePerformance = () => {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const metrics = {
          // Core Web Vitals
          FCP: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
          
          // Navigation timing
          DNS: navigation.domainLookupEnd - navigation.domainLookupStart,
          TCP: navigation.connectEnd - navigation.connectStart,
          Request: navigation.responseStart - navigation.requestStart,
          Response: navigation.responseEnd - navigation.responseStart,
          Processing: navigation.domComplete - navigation.responseEnd,
          Load: navigation.loadEventEnd - navigation.loadEventStart,
        };

        // 개발 환경에서 성능 메트릭 출력
        console.table(metrics);
      }, 0);
    });
  }
};

// Initialize app
try {
  initializeTheme();
  measurePerformance();
  initializeApp();
} catch (error) {
  console.error('Failed to initialize app:', error);
  
  // Fallback UI
  document.getElementById('root')!.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; font-family: system-ui, sans-serif;">
      <div>
        <h1 style="color: #ef4444; margin-bottom: 1rem;">애플리케이션 로드 실패</h1>
        <p style="color: #6b7280; margin-bottom: 2rem;">페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
        <button 
          onclick="window.location.reload()" 
          style="background: #ea580c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;"
        >
          새로고침
        </button>
      </div>
    </div>
  `;
}

// Service Worker registration for PWA (현재는 비활성화)
if (false && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}