import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitHubFooter } from './GitHubFooter';

// Linear 스타일 아이콘 컴포넌트들
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2"/>
    <line x1="8" y1="2" x2="8" y2="18"/>
    <line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);

const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
  </svg>
);

interface LinearLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const LinearLayout: React.FC<LinearLayoutProps> = ({ 
  children, 
  title,
  breadcrumbs = []
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems = [
    { icon: HomeIcon, href: '/', label: '홈' },
    { icon: MapIcon, href: '/courses', label: '코스 탐색' },
    { icon: BookmarkIcon, href: '/places', label: '장소 검색' },
    { icon: UserIcon, href: '/mypage', label: '마이페이지' },
    { icon: SettingsIcon, href: '/settings', label: '설정' },
  ];

  return (
    <div 
      className="linear-layout"
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#fafafa',
        position: 'relative'
      }}
    >
      {/* Linear Sidebar */}
      <aside 
        className="linear-sidebar"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '240px',
          background: 'var(--notion-white)',
          borderRight: '1px solid var(--notion-gray-light)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          zIndex: 100
        }}
      >
        {/* Notion 스타일 로고 영역 */}
        <div 
          className="notion-logo" 
          style={{
            padding: '12px 8px',
            marginBottom: '20px',
            borderBottom: '1px solid var(--notion-gray-light)'
          }}
        >
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--notion-text)',
            margin: 0
          }}>
            Where We Go
          </h2>
        </div>

        {/* 사이드바 메뉴 */}
        <div className="flex flex-col space-y-1">
          {sidebarItems.map(({ icon: Icon, href, label }) => (
            <Link
              key={href}
              to={href}
              className={`linear-sidebar-item ${currentPath === href ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 8px',
                borderRadius: '4px',
                color: currentPath === href ? 'var(--notion-text)' : 'var(--notion-text-light)',
                backgroundColor: currentPath === href ? 'var(--notion-gray-bg)' : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: currentPath === href ? '500' : '400',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div 
        className="linear-main"
        style={{
          flex: 1,
          marginLeft: '240px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: 'var(--notion-gray-bg)'
        }}
      >
        {/* Notion 스타일 헤더 */}
        <header 
          className="linear-header"
          style={{
            padding: '16px 40px',
            background: 'var(--notion-white)',
            borderBottom: '1px solid var(--notion-gray-light)'
          }}
        >
          {breadcrumbs.length > 0 && (
            <div 
              className="linear-breadcrumb"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: title ? '8px' : '0',
                fontSize: '13px',
                color: 'var(--notion-text-light)'
              }}
            >
              {breadcrumbs.map((crumb, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {index > 0 && <span>/</span>}
                  {crumb.href ? (
                    <Link 
                      to={crumb.href} 
                      style={{
                        color: 'var(--notion-text-light)',
                        textDecoration: 'none',
                        ':hover': { color: 'var(--notion-text)' }
                      }}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--notion-text)', fontWeight: '500' }}>
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {title && (
            <h1 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: 'var(--notion-text)',
              margin: 0,
              lineHeight: '1.2'
            }}>
              {title}
            </h1>
          )}
        </header>

        {/* Notion 스타일 콘텐츠 */}
        <main 
          className="linear-content"
          style={{
            flex: 1,
            padding: '20px 40px',
            overflowY: 'auto'
          }}
        >
          {children}
        </main>

        {/* Notion 스타일 Footer */}
        <GitHubFooter />
      </div>
    </div>
  );
};

export default LinearLayout;