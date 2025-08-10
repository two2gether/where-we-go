import React from 'react';
import { Link } from 'react-router-dom';

export const GitHubFooter: React.FC = () => {
  return (
    <footer 
      style={{
        background: 'var(--notion-white)',
        borderTop: '1px solid var(--notion-gray-light)',
        marginTop: 'auto'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <svg 
                className="w-6 h-6" 
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
            </div>
            <p 
              style={{
                fontSize: '14px',
                color: 'var(--notion-text-light)',
                lineHeight: '1.5',
                marginBottom: '16px'
              }}
            >
              나만의 여행 코스를 만들고 공유하여 
              특별한 여행 경험을 함께 나누세요.
            </p>
            {/* Social Links */}
            <div className="flex space-x-3">
              <a 
                href="#" 
                style={{
                  color: 'var(--notion-text-light)',
                  transition: 'color 0.15s ease'
                }}
                className="hover:text-notion-blue"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a 
                href="#" 
                style={{
                  color: 'var(--notion-text-light)',
                  transition: 'color 0.15s ease'
                }}
                className="hover:text-notion-blue"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.562-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
              <a 
                href="#" 
                style={{
                  color: 'var(--notion-text-light)',
                  transition: 'color 0.15s ease'
                }}
                className="hover:text-notion-blue"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.981 0C19.795 0 24 4.202 24 11.017c0 4.85-2.776 8.807-6.723 10.465-.492-.09-.667-.207-.667-.46v-1.639c0-.557-.187-.917-.402-1.103 1.317-.146 2.702-.647 2.702-2.91 0-.644-.235-1.17-.623-1.581.062-.153.27-.769-.059-1.603 0 0-.508-.163-1.668.622-.484-.135-1.003-.202-1.518-.205-.515.003-1.034.07-1.518.205-1.16-.785-1.668-.622-1.668-.622-.329.834-.121 1.45-.059 1.603-.388.411-.624.937-.624 1.581 0 2.258 1.38 2.766 2.693 2.915-.169.148-.322.408-.376.795-.337.152-1.193.412-1.723-.491 0 0-.312-.566-.905-.608 0 0-.576-.007-.041.359 0 0 .387.182.655.864 0 0 .346 1.054 1.985.695v1.085c0 .253-.174.37-.667.46C2.776 19.824 0 15.867 0 11.017 0 4.202 4.205 0 12.981 0z"/>
                </svg>
              </a>
              <a 
                href="#" 
                style={{
                  color: 'var(--notion-text-light)',
                  transition: 'color 0.15s ease'
                }}
                className="hover:text-notion-blue"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                marginBottom: '12px'
              }}
            >
              서비스
            </h4>
            <ul className="space-y-2">
              {[
                { label: '코스 탐색', href: '/courses' },
                { label: '장소 검색', href: '/places' },
                { label: '북마크', href: '/bookmarks' },
                { label: '이벤트', href: '/events' }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.href}
                    style={{
                      fontSize: '14px',
                      color: 'var(--notion-text-light)',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease'
                    }}
                    className="hover:text-notion-blue"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                marginBottom: '12px'
              }}
            >
              고객지원
            </h4>
            <ul className="space-y-2">
              {[
                { label: '도움말', href: '/help' },
                { label: '자주 묻는 질문', href: '/faq' },
                { label: '고객센터', href: '/support' },
                { label: '신고하기', href: '/report' }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.href}
                    style={{
                      fontSize: '14px',
                      color: 'var(--notion-text-light)',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease'
                    }}
                    className="hover:text-notion-blue"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                marginBottom: '12px'
              }}
            >
              회사
            </h4>
            <ul className="space-y-2">
              {[
                { label: '회사 소개', href: '/about' },
                { label: '채용정보', href: '/careers' },
                { label: '블로그', href: '/blog' },
                { label: '파트너십', href: '/partnership' }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.href}
                    style={{
                      fontSize: '14px',
                      color: 'var(--notion-text-light)',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease'
                    }}
                    className="hover:text-notion-blue"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div 
          className="flex flex-col md:flex-row justify-between items-center pt-8"
          style={{
            borderTop: '1px solid var(--notion-gray-light)'
          }}
        >
          <div className="flex flex-wrap items-center space-x-6 mb-4 md:mb-0">
            <Link 
              to="/terms"
              style={{
                fontSize: '13px',
                color: 'var(--notion-text-light)',
                textDecoration: 'none',
                transition: 'color 0.15s ease'
              }}
              className="hover:text-notion-blue"
            >
              이용약관
            </Link>
            <Link 
              to="/privacy"
              style={{
                fontSize: '13px',
                color: 'var(--notion-text-light)',
                textDecoration: 'none',
                transition: 'color 0.15s ease'
              }}
              className="hover:text-notion-blue"
            >
              개인정보처리방침
            </Link>
            <Link 
              to="/cookie"
              style={{
                fontSize: '13px',
                color: 'var(--notion-text-light)',
                textDecoration: 'none',
                transition: 'color 0.15s ease'
              }}
              className="hover:text-notion-blue"
            >
              쿠키 정책
            </Link>
          </div>
          
          <p 
            style={{
              fontSize: '13px',
              color: 'var(--notion-text-light)',
              margin: 0
            }}
          >
            © 2025 Where We Go. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};