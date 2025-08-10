import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../base';

export const GitHubHeader: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header 
      style={{
        background: 'var(--notion-white)',
        borderBottom: '1px solid var(--notion-gray-light)',
        color: 'var(--notion-text)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Notion 스타일 로고 */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 transition-colors"
              style={{
                color: 'var(--notion-text)',
                textDecoration: 'none'
              }}
            >
              <svg 
                className="w-7 h-7" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{ color: 'var(--notion-blue)' }}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span 
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--notion-text)'
                }}
              >
                Where We Go
              </span>
            </Link>
          </div>

          {/* Notion 스타일 검색바 - 고정 너비로 일관성 유지 */}
          <div className="flex-1" style={{ maxWidth: '400px', minWidth: '300px' }}>
            <form onSubmit={handleSearch} className="relative mx-auto" style={{ maxWidth: '400px' }}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  className="h-4 w-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--notion-gray)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="코스나 장소를 검색하세요"
                style={{
                  display: 'block',
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '12px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  fontSize: '14px',
                  background: 'var(--notion-gray-bg)',
                  border: '1px solid var(--notion-gray-light)',
                  borderRadius: '6px',
                  color: 'var(--notion-text)',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            </form>
          </div>

          {/* Notion 스타일 Navigation & User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* 주요 Navigation Links만 외부에 노출 */}
                <nav className="hidden md:flex items-center space-x-2">
                  <Link 
                    to="/places" 
                    style={{
                      color: 'var(--notion-text-light)',
                      fontSize: '14px',
                      fontWeight: '400',
                      textDecoration: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    장소
                  </Link>
                  <Link 
                    to="/courses"
                    style={{
                      color: 'var(--notion-text-light)',
                      fontSize: '14px',
                      fontWeight: '400',
                      textDecoration: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    코스
                  </Link>
                  <Link 
                    to="/events"
                    style={{
                      color: 'var(--notion-text-light)',
                      fontSize: '14px',
                      fontWeight: '400',
                      textDecoration: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    이벤트
                  </Link>
                  {/* 관리자용 메뉴 - Notion 스타일 */}
                  <Link 
                    to="/admin/products"
                    style={{
                      color: 'var(--notion-blue)',
                      fontSize: '14px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    👑 관리자
                  </Link>
                </nav>

                {/* Notion 스타일 User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-1 transition-colors"
                    style={{
                      color: 'var(--notion-text-light)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                  >
                    <div 
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: 'var(--notion-gray-light)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span 
                        style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: 'var(--notion-text)'
                        }}
                      >
                        {user?.nickname?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 z-50"
                      style={{
                        background: 'var(--notion-white)',
                        borderRadius: '6px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        border: '1px solid var(--notion-gray-light)',
                        padding: '4px'
                      }}
                    >
                      <div 
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--notion-gray-light)',
                          marginBottom: '4px'
                        }}
                      >
                        <p style={{ fontSize: '14px', color: 'var(--notion-text)', fontWeight: '500', margin: 0 }}>
                          {user?.nickname}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--notion-text-light)', margin: 0 }}>
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to="/bookmarks"
                        className="block transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '14px',
                          color: 'var(--notion-text)',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          display: 'block'
                        }}
                      >
                        북마크
                      </Link>
                      <Link
                        to="/orders"
                        className="block transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '14px',
                          color: 'var(--notion-text)',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          display: 'block'
                        }}
                      >
                        주문내역
                      </Link>
                      <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid var(--notion-gray-light)' }} />
                      <Link
                        to="/mypage"
                        className="block transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '14px',
                          color: 'var(--notion-text)',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          display: 'block'
                        }}
                      >
                        마이페이지
                      </Link>
                      <Link
                        to="/settings"
                        className="block transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '14px',
                          color: 'var(--notion-text)',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          display: 'block'
                        }}
                      >
                        설정
                      </Link>
                      <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid var(--notion-gray-light)' }} />
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '6px 12px',
                          fontSize: '14px',
                          color: 'var(--notion-text)',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 비로그인 상태에서도 주요 링크 표시 */}
                <nav className="hidden md:flex items-center space-x-2">
                  <Link 
                    to="/places" 
                    style={{
                      color: 'var(--notion-text-light)',
                      fontSize: '14px',
                      fontWeight: '400',
                      textDecoration: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    장소
                  </Link>
                  <Link 
                    to="/courses"
                    style={{
                      color: 'var(--notion-text-light)',
                      fontSize: '14px',
                      fontWeight: '400',
                      textDecoration: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    코스
                  </Link>
                  <Link 
                    to="/events"
                    style={{
                      color: 'var(--notion-text-light)',
                      fontSize: '14px',
                      fontWeight: '400',
                      textDecoration: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    이벤트
                  </Link>
                </nav>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      color: 'var(--notion-text-light)',
                      background: 'transparent',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '400',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      color: 'var(--notion-white)',
                      background: 'var(--notion-blue)',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    회원가입
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};