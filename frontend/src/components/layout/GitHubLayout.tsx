import React from 'react';
import { GitHubHeader } from './GitHubHeader';
import { GitHubFooter } from './GitHubFooter';

export interface GitHubLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  tabs?: Array<{
    label: string;
    href: string;
    active?: boolean;
    count?: number;
    onClick?: () => void;
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
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--notion-gray-bg)' }}
    >
      <GitHubHeader />
      
      {/* Notion 스타일 Page Header */}
      {(title || tabs) && (
        <div 
          style={{
            background: 'var(--notion-white)',
            borderBottom: '1px solid var(--notion-gray-light)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title Section */}
            {title && (
              <div className="py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 
                      style={{
                        fontSize: '32px',
                        fontWeight: '600',
                        color: 'var(--notion-text)',
                        margin: 0,
                        lineHeight: '1.3',
                        marginBottom: subtitle ? '8px' : '0'
                      }}
                    >
                      {title}
                    </h1>
                    {subtitle && (
                      <p 
                        style={{
                          color: 'var(--notion-text-light)',
                          fontSize: '16px',
                          lineHeight: '1.5',
                          margin: 0
                        }}
                      >
                        {subtitle}
                      </p>
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

            {/* Notion 스타일 Tabs Navigation */}
            {tabs && (
              <div style={{ borderBottom: '1px solid var(--notion-gray-light)' }}>
                <nav className="flex" style={{ marginBottom: '-1px' }}>
                  {tabs.map((tab, index) => (
                    tab.onClick ? (
                      <button
                        key={index}
                        onClick={tab.onClick}
                        style={{
                          padding: '8px 12px',
                          marginRight: '4px',
                          fontSize: '14px',
                          fontWeight: tab.active ? '500' : '400',
                          color: tab.active ? 'var(--notion-text)' : 'var(--notion-text-light)',
                          backgroundColor: tab.active ? 'var(--notion-gray-bg)' : 'transparent',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tab.label}
                        {tab.count !== undefined && (
                          <span 
                            style={{
                              backgroundColor: 'var(--notion-gray-light)',
                              color: 'var(--notion-text-light)',
                              fontSize: '12px',
                              padding: '2px 6px',
                              borderRadius: '12px',
                              fontWeight: '500'
                            }}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ) : (
                      <a
                        key={index}
                        href={tab.href}
                        style={{
                          padding: '8px 12px',
                          marginRight: '4px',
                          fontSize: '14px',
                          fontWeight: tab.active ? '500' : '400',
                          color: tab.active ? 'var(--notion-text)' : 'var(--notion-text-light)',
                          backgroundColor: tab.active ? 'var(--notion-gray-bg)' : 'transparent',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tab.label}
                        {tab.count !== undefined && (
                          <span 
                            style={{
                              backgroundColor: 'var(--notion-gray-light)',
                              color: 'var(--notion-text-light)',
                              fontSize: '12px',
                              padding: '2px 6px',
                              borderRadius: '12px',
                              fontWeight: '500'
                            }}
                          >
                            {tab.count}
                          </span>
                        )}
                      </a>
                    )
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notion 스타일 Main Content */}
      <div className="flex-1 py-8">
        {sidebar ? (
          <div className="flex" style={{ width: '1200px', margin: '0 auto' }}>
            {/* Sidebar - 고정 너비, sticky 적용 */}
            <aside 
              className="w-80 flex-shrink-0 relative z-20" 
              style={{ paddingLeft: '1rem' }}
            >
              <div 
                className="sticky"
                style={{ 
                  top: '2rem',
                  maxHeight: 'calc(100vh - 4rem)',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  scrollBehavior: 'smooth',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--notion-gray-light) transparent'
                }}
              >
                {sidebar}
              </div>
            </aside>

            {/* Main Content - 나머지 너비 고정 */}
            <main style={{ width: 'calc(1200px - 320px - 2rem)', paddingLeft: '2rem', paddingRight: '1rem' }}>
              {children}
            </main>
          </div>
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
        )}
      </div>

      {/* Notion 스타일 Footer */}
      <GitHubFooter />
    </div>
  );
};

// Notion 스타일 사이드바 컴포넌트
export interface GitHubSidebarProps {
  title?: string;
  children: React.ReactNode;
}

export const GitHubSidebar: React.FC<GitHubSidebarProps> = ({ title, children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {title && (
        <h2 
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--notion-text)',
            margin: 0
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

// Notion 스타일 사이드바 섹션 (블록 스타일)
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
    <div 
      style={{
        background: 'var(--notion-white)',
        border: '1px solid var(--notion-gray-light)',
        borderRadius: '6px',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--notion-gray-light)',
          background: 'var(--notion-gray-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <h3 
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--notion-text)',
            margin: 0
          }}
        >
          {title}
        </h3>
        {action}
      </div>
      <div style={{ padding: '16px' }}>
        {children}
      </div>
    </div>
  );
};