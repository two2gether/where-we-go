import React from 'react';
import { GitHubHeader } from './GitHubHeader';

export interface GitHubLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  tabs?: Array<{
    label: string;
    href: string;
    active?: boolean;
    count?: number;
  }>;
  sidebar?: React.ReactNode;
  actions?: React.ReactNode;
}

export const GitHubLayout: React.FC<GitHubLayoutProps> = ({
  children,
  title,
  subtitle,
  tabs,
  sidebar,
  actions
}) => {
  return (
    <div className="min-h-screen bg-github-canvas">
      <GitHubHeader />
      
      {/* Page Header */}
      {(title || tabs) && (
        <div className="bg-github-canvas-subtle border-b border-github-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title Section */}
            {title && (
              <div className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-primary-900">{title}</h1>
                    {subtitle && (
                      <p className="mt-1 text-github-neutral">{subtitle}</p>
                    )}
                  </div>
                  {actions && (
                    <div className="flex items-center space-x-3">
                      {actions}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tabs Navigation */}
            {tabs && (
              <div className="border-b border-github-border">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab, index) => (
                    <a
                      key={index}
                      href={tab.href}
                      className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                        tab.active
                          ? 'border-secondary-500 text-secondary-600'
                          : 'border-transparent text-github-neutral hover:text-primary-900 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          tab.active
                            ? 'bg-secondary-100 text-secondary-600'
                            : 'bg-gray-100 text-github-neutral-muted'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sidebar ? (
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-80 flex-shrink-0">
              {sidebar}
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </div>
    </div>
  );
};

// GitHub 스타일 사이드바 컴포넌트
export interface GitHubSidebarProps {
  title?: string;
  children: React.ReactNode;
}

export const GitHubSidebar: React.FC<GitHubSidebarProps> = ({ title, children }) => {
  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-lg font-semibold text-primary-900">{title}</h2>
      )}
      {children}
    </div>
  );
};

// GitHub 스타일 사이드바 섹션
export interface GitHubSidebarSectionProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const GitHubSidebarSection: React.FC<GitHubSidebarSectionProps> = ({ 
  title, 
  children, 
  action 
}) => {
  return (
    <div className="bg-github-canvas border border-github-border rounded-md">
      <div className="px-4 py-3 border-b border-github-border bg-github-canvas-subtle">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary-900">{title}</h3>
          {action}
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};