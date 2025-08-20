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

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ReviewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

const RouteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="6" cy="19" r="3"/>
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
    <circle cx="18" cy="5" r="3"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"/>
    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

interface LinearLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  showWithdrawButton?: boolean;
  onWithdrawClick?: () => void;
}

export const LinearLayout: React.FC<LinearLayoutProps> = ({ 
  children, 
  title,
  breadcrumbs = [],
  showWithdrawButton = false,
  onWithdrawClick
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems = [
    { icon: HomeIcon, href: '/', label: '홈' },
    { icon: MapIcon, href: '/courses', label: '코스 탐색' },
    { icon: BookmarkIcon, href: '/places', label: '장소 검색' },
    { icon: UserIcon, href: '/mypage', label: '마이페이지' },
  ];

  const myActivityItems = [
    { icon: MessageIcon, href: '/my/comments', label: '내 댓글' },
    { icon: ReviewIcon, href: '/my/reviews', label: '내 리뷰' },
    { icon: RouteIcon, href: '/my/courses', label: '내 코스' },
    { icon: HeartIcon, href: '/my/likes', label: '좋아요한 코스' },
    { icon: BookmarkIcon, href: '/bookmarks', label: '북마크' },
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

        {/* 내 활동 섹션 */}
        <div 
          className="mt-8"
          style={{
            borderTop: '1px solid var(--notion-gray-light)',
            paddingTop: '16px'
          }}
        >
          <div 
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--notion-text-light)',
              marginBottom: '8px',
              paddingLeft: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            내 활동
          </div>
          <div className="flex flex-col space-y-1">
            {myActivityItems.map(({ icon: Icon, href, label }) => (
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
        </div>

        {/* 회원탈퇴 버튼 */}
        {showWithdrawButton && (
          <div 
            className="mt-auto"
            style={{
              borderTop: '1px solid var(--notion-gray-light)',
              paddingTop: '16px'
            }}
          >
            <button
              onClick={onWithdrawClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px',
                borderRadius: '4px',
                color: 'var(--notion-red)',
                backgroundColor: 'transparent',
                border: 'none',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '400',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--notion-red-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <TrashIcon />
              <span>회원탈퇴</span>
            </button>
          </div>
        )}
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