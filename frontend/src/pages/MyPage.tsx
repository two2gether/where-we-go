import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  useMyPage, 
  useUpdateMyPage, 
  useWithdraw,
  useMyComments,
  useMyBookmarks,
  useMyReviews,
  useMyCourses,
  useMyCourseBookmarks,
  useMyCourseLikes,
  useMarkNotificationAsRead
} from '../hooks/useUser';
import { useNotifications } from '../hooks/useNotifications';
import { useAuthStore } from '../store/authStore';
import LinearLayout from '../components/layout/LinearLayout';
import { ProfileImageUploader } from '../components/common/ProfileImageUploader';
import type { MyPageUpdateRequest, WithdrawRequest } from '../api/types';

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');

  // 인증 상태 확인
  const { user, isAuthenticated, validateCurrentSession, logout } = useAuthStore();

  // 프로필 정보
  const { data: myPageData, isLoading, error } = useMyPage();

  // 컴포넌트 마운트 시 인증 상태 검증
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await validateCurrentSession();
        if (!isValid) {
          console.warn('Invalid session detected in MyPage, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        navigate('/login', { replace: true });
      }
    };
    
    if (!isAuthenticated || !user) {
      console.warn('User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }
    
    checkAuth();
  }, [isAuthenticated, user, navigate, validateCurrentSession]);

  // 마이페이지 데이터 로딩 중 인증 에러 감지
  React.useEffect(() => {
    if (error && error?.response?.status === 401) {
      console.warn('Authentication error in MyPage data, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [error, navigate]);
  const updateMyPageMutation = useUpdateMyPage();
  const withdrawMutation = useWithdraw();

  // 알림 기능
  const markNotificationAsReadMutation = useMarkNotificationAsRead();

  // 탭별 데이터
  const { data: commentsData, isLoading: commentsLoading, error: commentsError } = useMyComments(0, 10);
  const { data: bookmarksData, isLoading: bookmarksLoading, error: bookmarksError } = useMyBookmarks(0, 20);
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useMyReviews(0, 10);
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useMyCourses(0, 20);
  const { data: courseBookmarksData, isLoading: courseBookmarksLoading, error: courseBookmarksError } = useMyCourseBookmarks(0, 20);
  const { data: likesData, isLoading: likesLoading, error: likesError } = useMyCourseLikes(0, 10);
  // 백엔드 알림 API 복원 완료
  const { data: notificationsData } = useNotifications({ page: 0, size: 10 });

  // 폼 상태
  const [editForm, setEditForm] = useState({
    nickname: myPageData?.nickname || '',
    profileImage: myPageData?.profileImage || '',
  });

  React.useEffect(() => {
    if (myPageData) {
      setEditForm({
        nickname: myPageData.nickname,
        profileImage: myPageData.profileImage || '',
      });
    }
  }, [myPageData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData: MyPageUpdateRequest = {};
    if (editForm.nickname !== myPageData?.nickname) {
      updateData.nickname = editForm.nickname;
    }
    if (editForm.profileImage !== myPageData?.profileImage) {
      updateData.profileImage = editForm.profileImage;
    }

    if (Object.keys(updateData).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateMyPageMutation.mutateAsync(updateData);
      setIsEditing(false);
      alert('프로필이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      alert('프로필 수정에 실패했습니다.');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawPassword.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    const withdrawData: WithdrawRequest = {
      password: withdrawPassword,
    };

    try {
      await withdrawMutation.mutateAsync(withdrawData);
      alert('회원탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.');
      
      // 로그아웃 처리 및 홈으로 이동
      logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('회원탈퇴 실패:', error);
      alert('회원탈퇴에 실패했습니다. 비밀번호를 확인해주세요.');
    }
  };

  // 통계 데이터 계산
  const statsData = {
    comments: commentsData?.totalElements || 0,
    reviews: reviewsData?.totalElements || 0,
    courses: coursesData?.totalElements || 0,
    bookmarks: bookmarksData?.totalElements || bookmarksData?.content?.length || 0,
    courseBookmarks: courseBookmarksData?.totalElements || 0,
    likes: likesData?.totalElements || 0,
    notifications: notificationsData?.totalElements || 0,
  };


  // 인증되지 않은 상태에서는 아무것도 렌더링하지 않음 (useEffect에서 리다이렉트 처리)
  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <LinearLayout title="마이페이지" breadcrumbs={[{ label: '마이페이지' }]}>
        <div className="animate-pulse space-y-6">
          <div 
            className="h-32 rounded"
            style={{ background: 'var(--notion-gray-light)' }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="h-24 rounded"
                style={{ background: 'var(--notion-gray-light)' }}
              />
            ))}
          </div>
        </div>
      </LinearLayout>
    );
  }

  // API 에러 처리 개선
  if (error) {
    return (
      <LinearLayout title="마이페이지" breadcrumbs={[{ label: '마이페이지' }]}>
        <div className="text-center py-12">
          <div 
            className="max-w-md mx-auto p-6 rounded-lg"
            style={{
              background: 'var(--notion-white)',
              border: '1px solid var(--notion-red-light)',
              borderRadius: '8px'
            }}
          >
            <div 
              style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}
            >
              ⚠️
            </div>
            <h2 
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                marginBottom: '8px'
              }}
            >
              마이페이지를 불러올 수 없습니다
            </h2>
            <p 
              style={{
                fontSize: '14px',
                color: 'var(--notion-text-light)',
                marginBottom: '16px',
                lineHeight: '1.5'
              }}
            >
              로그인 세션이 만료되었거나 서버에 문제가 발생했습니다.
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '8px 16px',
                  color: 'var(--notion-text)',
                  background: 'transparent',
                  border: '1px solid var(--notion-gray-light)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                새로고침
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '8px 16px',
                  background: 'var(--notion-blue)',
                  color: 'var(--notion-white)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                다시 로그인
              </button>
            </div>
          </div>
        </div>
      </LinearLayout>
    );
  }


  // 프로필 섹션 렌더링
  const renderProfileSection = () => (
    <div 
      className="p-6 rounded-lg mb-6"
      style={{
        background: 'var(--notion-white)',
        border: '1px solid var(--notion-gray-light)',
        borderRadius: '8px'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--notion-text)',
            margin: 0
          }}
        >
          👤 내 프로필
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              color: 'var(--notion-blue)',
              background: 'transparent',
              border: '1px solid var(--notion-gray-light)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ✏️ 편집
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label 
              className="block mb-2"
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--notion-text)'
              }}
            >
              닉네임
            </label>
            <input
              type="text"
              value={editForm.nickname}
              onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--notion-gray-light)',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
              required
            />
          </div>
          
          <div>
            <label 
              className="block mb-3"
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--notion-text)'
              }}
            >
              프로필 이미지
            </label>
            <ProfileImageUploader
              currentImageUrl={editForm.profileImage || myPageData?.profileImage}
              onUploadComplete={(imageUrl) => {
                setEditForm(prev => ({ ...prev, profileImage: imageUrl }));
              }}
              onDeleteComplete={() => {
                setEditForm(prev => ({ ...prev, profileImage: '' }));
              }}
              size="md"
              className="mb-4"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={updateMyPageMutation.isPending}
              style={{
                color: 'var(--notion-white)',
                background: 'var(--notion-blue)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              💾 {updateMyPageMutation.isPending ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{
                color: 'var(--notion-text)',
                background: 'transparent',
                border: '1px solid var(--notion-gray-light)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ❌ 취소
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            {myPageData?.profileImage ? (
              <img
                src={myPageData.profileImage}
                alt="프로필"
                className="w-16 h-16 rounded-full object-cover"
                style={{
                  border: '2px solid var(--notion-gray-light)'
                }}
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--notion-gray-bg)',
                  color: 'var(--notion-text-light)',
                  fontSize: '24px'
                }}
              >
                👤
              </div>
            )}
            <div className="flex-1">
              <h3 
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--notion-text)',
                  marginBottom: '4px'
                }}
              >
                {myPageData?.nickname}
              </h3>
              <p 
                style={{
                  fontSize: '14px',
                  color: 'var(--notion-text-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📧 {myPageData?.email}
              </p>
            </div>
          </div>

          <div 
            className="p-4 rounded"
            style={{
              background: 'var(--notion-gray-bg)',
              fontSize: '14px',
              color: 'var(--notion-text-light)'
            }}
          >
            📅 여행자가 된 날: {new Date(myPageData?.createdAt || '').toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <LinearLayout 
      title="마이페이지" 
      breadcrumbs={[{ label: '마이페이지' }]}
      showWithdrawButton={true}
      onWithdrawClick={() => setShowWithdrawModal(true)}
    >
      {/* 프로필 섹션 */}
      {renderProfileSection()}
      
      {/* 통계 카드 그리드 - 한 줄로 표시: 댓글 → 리뷰 → 장소북마크 → 내코스 → 코스북마크 → 좋아요 → 알림 */}
      <div className="grid grid-cols-7 gap-4 mb-8">
        {/* 댓글 */}
        <div 
          className="p-4 rounded text-center"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div 
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--notion-blue)',
              marginBottom: '4px'
            }}
          >
            {statsData.comments}
          </div>
          <div 
            style={{
              fontSize: '12px',
              color: 'var(--notion-text-light)'
            }}
          >
            💬 댓글
          </div>
        </div>
        
        {/* 리뷰 */}
        <div 
          className="p-4 rounded text-center"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div 
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--notion-blue)',
              marginBottom: '4px'
            }}
          >
            {statsData.reviews}
          </div>
          <div 
            style={{
              fontSize: '12px',
              color: 'var(--notion-text-light)'
            }}
          >
            📝 리뷰
          </div>
        </div>
        
        {/* 장소 북마크 */}
        <div 
          className="p-4 rounded text-center"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div 
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--notion-blue)',
              marginBottom: '4px'
            }}
          >
            {statsData.bookmarks}
          </div>
          <div 
            style={{
              fontSize: '12px',
              color: 'var(--notion-text-light)'
            }}
          >
            💾 장소북마크
          </div>
        </div>
        
        {/* 내 코스 */}
        <div 
          className="p-4 rounded text-center"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div 
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--notion-blue)',
              marginBottom: '4px'
            }}
          >
            {statsData.courses}
          </div>
          <div 
            style={{
              fontSize: '12px',
              color: 'var(--notion-text-light)'
            }}
          >
            🚀 내코스
          </div>
        </div>
        
        {/* 코스 북마크 */}
        <Link
          to="/bookmarks?tab=courses"
          className="block p-4 rounded text-center transition-colors"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px',
            textDecoration: 'none'
          }}
        >
          <div 
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--notion-blue)',
              marginBottom: '4px'
            }}
          >
            {statsData.courseBookmarks}
          </div>
          <div 
            style={{
              fontSize: '12px',
              color: 'var(--notion-text-light)'
            }}
          >
            📚 코스북마크
          </div>
        </Link>
        
        {/* 좋아요 */}
        <div 
          className="p-4 rounded text-center"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div 
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--notion-blue)',
              marginBottom: '4px'
            }}
          >
            {statsData.likes}
          </div>
          <div 
            style={{
              fontSize: '12px',
              color: 'var(--notion-text-light)'
            }}
          >
            💖 좋아요
          </div>
        </div>
        
        {/* 알림 */}
        <Link
          to="/notifications"
          className="block p-4 rounded text-center transition-colors"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px',
            textDecoration: 'none'
          }}
        >
          <div 
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--notion-blue)',
              marginBottom: '4px'
            }}
          >
            {statsData.notifications}
          </div>
          <div 
            style={{
              fontSize: '12px',
              color: 'var(--notion-text-light)'
            }}
          >
            📢 알림
          </div>
        </Link>
      </div>

      {/* 콘텐츠 그리드 - 3x3 배열로 변경: 댓글 → 리뷰 → 장소북마크 → 내코스 → 코스북마크 → 좋아요 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 최근 댓글 */}
        <div 
          className="p-6 rounded-lg"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                margin: 0
              }}
            >
              💬 최근 댓글
            </h3>
            <Link 
              to="/my/comments"
              style={{
                fontSize: '14px',
                color: 'var(--notion-blue)',
                textDecoration: 'none'
              }}
            >
              더보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {commentsData?.content?.slice(0, 3).map((comment, index) => (
              <div 
                key={comment.id || comment.commentId || `comment-${index}`}
                className="p-3 rounded"
                style={{
                  background: 'var(--notion-gray-bg)',
                  border: '1px solid var(--notion-gray-light)',
                  borderRadius: '6px'
                }}
              >
                <Link 
                  to={`/courses/${comment.courseId}`}
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--notion-text)',
                    textDecoration: 'none'
                  }}
                >
                  {comment.courseTitle || `코스 #${comment.courseId}`}
                </Link>
                <p 
                  style={{
                    fontSize: '13px',
                    color: 'var(--notion-text-light)',
                    marginTop: '4px',
                    lineHeight: '1.4'
                  }}
                >
                  {comment.content.length > 80 ? `${comment.content.slice(0, 80)}...` : comment.content}
                </p>
                <div 
                  style={{
                    fontSize: '12px',
                    color: 'var(--notion-text-light)',
                    marginTop: '4px'
                  }}
                >
                  {new Date(comment.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {(!commentsData?.content || commentsData.content.length === 0) && (
              <div 
                className="text-center py-8"
                style={{ color: 'var(--notion-text-light)' }}
              >
                작성한 댓글이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 최근 리뷰 */}
        <div 
          className="p-6 rounded-lg"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                margin: 0
              }}
            >
              📝 최근 리뷰
            </h3>
            <Link 
              to="/my/reviews"
              style={{
                fontSize: '14px',
                color: 'var(--notion-blue)',
                textDecoration: 'none'
              }}
            >
              더보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {reviewsLoading ? (
              <div className="text-center py-4" style={{ color: 'var(--notion-text-light)' }}>
                데이터를 불러오는 중...
              </div>
            ) : reviewsError ? (
              <div className="text-center py-4" style={{ color: 'var(--notion-red)' }}>
                리뷰 데이터를 불러오는데 실패했습니다.
              </div>
            ) : (
              reviewsData?.content?.slice(0, 3).filter(review => review).map((review) => (
                <div 
                  key={review.reviewId}
                  className="p-3 rounded"
                  style={{
                    background: 'var(--notion-gray-bg)',
                    border: '1px solid var(--notion-gray-light)',
                    borderRadius: '6px'
                  }}
                >
                  <Link 
                    to={`/places/${review.placeId || review.place?.placeId || ''}`}
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--notion-text)',
                      textDecoration: 'none'
                    }}
                  >
                    {review.placeName || review.place?.name || '리뷰한 장소 보기'}
                  </Link>
                  <p 
                    style={{
                      fontSize: '13px',
                      color: 'var(--notion-text-light)',
                      marginTop: '4px',
                      lineHeight: '1.4'
                    }}
                  >
                    {review.content.length > 60 ? `${review.content.slice(0, 60)}...` : review.content}
                  </p>
                  <div 
                    className="flex items-center space-x-3 mt-2"
                    style={{
                      fontSize: '12px',
                      color: 'var(--notion-text-light)'
                    }}
                  >
                    <span>⭐ {review.rating}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
            {(!reviewsData?.content || reviewsData.content.length === 0) && (
              <div 
                className="text-center py-8"
                style={{ color: 'var(--notion-text-light)' }}
              >
                작성한 리뷰가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 장소 북마크 */}
        <div 
          className="p-6 rounded-lg"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                margin: 0
              }}
            >
              💾 장소 북마크
            </h3>
            <Link 
              to="/bookmarks?tab=places"
              style={{
                fontSize: '14px',
                color: 'var(--notion-blue)',
                textDecoration: 'none'
              }}
            >
              더보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {bookmarksLoading ? (
              <div className="text-center py-4" style={{ color: 'var(--notion-text-light)' }}>
                데이터를 불러오는 중...
              </div>
            ) : bookmarksError ? (
              <div className="text-center py-4" style={{ color: 'var(--notion-red)' }}>
                북마크 데이터를 불러오는데 실패했습니다.
              </div>
            ) : (
              bookmarksData?.content?.slice(0, 3).filter(bookmark => bookmark).map((bookmark) => (
                <div 
                  key={bookmark.bookmarkId}
                  className="p-3 rounded"
                  style={{
                    background: 'var(--notion-gray-bg)',
                    border: '1px solid var(--notion-gray-light)',
                    borderRadius: '6px'
                  }}
                >
                  <Link 
                    to={`/places/${bookmark.place?.placeId || bookmark.placeId || ''}`}
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--notion-text)',
                      textDecoration: 'none'
                    }}
                  >
                    {bookmark.place?.name || bookmark.placeName || '장소 정보 없음'}
                  </Link>
                  <p 
                    style={{
                      fontSize: '13px',
                      color: 'var(--notion-text-light)',
                      marginTop: '4px'
                    }}
                  >
                    {bookmark.place?.address || bookmark.address || '주소 정보 없음'}
                  </p>
                  <div 
                    className="flex items-center space-x-3 mt-2"
                    style={{
                      fontSize: '12px',
                      color: 'var(--notion-text-light)'
                    }}
                  >
                    <span>⭐ {bookmark.place?.averageRating?.toFixed(1) || bookmark.averageRating?.toFixed(1) || '0.0'}</span>
                    <span>리뷰 {bookmark.place?.reviewCount || bookmark.reviewCount || 0}개</span>
                  </div>
                </div>
              ))
            )}
            {(!bookmarksData?.content || bookmarksData.content.length === 0) && (
              <div 
                className="text-center py-8"
                style={{ color: 'var(--notion-text-light)' }}
              >
                북마크한 장소가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 내 코스 */}
        <div 
          className="p-6 rounded-lg"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                margin: 0
              }}
            >
              🚀 내 코스
            </h3>
            <Link 
              to="/my/courses"
              style={{
                fontSize: '14px',
                color: 'var(--notion-blue)',
                textDecoration: 'none'
              }}
            >
              더보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {coursesData?.content?.slice(0, 3).map((course) => (
              <div 
                key={course.courseId}
                className="p-3 rounded"
                style={{
                  background: 'var(--notion-gray-bg)',
                  border: '1px solid var(--notion-gray-light)',
                  borderRadius: '6px'
                }}
              >
                <Link 
                  to={`/courses/${course.courseId}`}
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--notion-text)',
                    textDecoration: 'none'
                  }}
                >
                  {course.title}
                </Link>
                <p 
                  style={{
                    fontSize: '13px',
                    color: 'var(--notion-text-light)',
                    marginTop: '4px'
                  }}
                >
                  {course.description && course.description.length > 50 
                    ? `${course.description.slice(0, 50)}...` 
                    : course.description || '설명 없음'}
                </p>
                <div 
                  className="flex items-center space-x-3 mt-2"
                  style={{
                    fontSize: '12px',
                    color: 'var(--notion-text-light)'
                  }}
                >
                  <span>❤️ {course.likeCount || 0}</span>
                  <span>💬 {course.commentCount || 0}</span>
                  <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {(!coursesData?.content || coursesData.content.length === 0) && (
              <div 
                className="text-center py-8"
                style={{ color: 'var(--notion-text-light)' }}
              >
                만든 코스가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 코스 북마크 */}
        <div 
          className="p-6 rounded-lg"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                margin: 0
              }}
            >
              📚 코스 북마크
            </h3>
            <Link 
              to="/bookmarks?tab=courses"
              style={{
                fontSize: '14px',
                color: 'var(--notion-blue)',
                textDecoration: 'none'
              }}
            >
              더보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {courseBookmarksData?.content?.slice(0, 3).map((courseBookmark) => (
              <div 
                key={courseBookmark.courseId}
                className="p-3 rounded"
                style={{
                  background: 'var(--notion-gray-bg)',
                  border: '1px solid var(--notion-gray-light)',
                  borderRadius: '6px'
                }}
              >
                <Link 
                  to={`/courses/${courseBookmark.courseId}`}
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--notion-text)',
                    textDecoration: 'none'
                  }}
                >
                  {courseBookmark.title}
                </Link>
                <p 
                  style={{
                    fontSize: '13px',
                    color: 'var(--notion-text-light)',
                    marginTop: '4px'
                  }}
                >
                  {courseBookmark.description && courseBookmark.description.length > 50 
                    ? `${courseBookmark.description.slice(0, 50)}...` 
                    : courseBookmark.description || '설명 없음'}
                </p>
                <div 
                  className="flex items-center space-x-3 mt-2"
                  style={{
                    fontSize: '12px',
                    color: 'var(--notion-text-light)'
                  }}
                >
                  <span>⭐ {courseBookmark.averageRating?.toFixed(1) || '0.0'}</span>
                  <span>❤️ {courseBookmark.likeCount}</span>
                  <span>📍 {courseBookmark.region}</span>
                </div>
              </div>
            ))}
            {(!courseBookmarksData?.content || courseBookmarksData.content.length === 0) && (
              <div 
                className="text-center py-8"
                style={{ color: 'var(--notion-text-light)' }}
              >
                북마크한 코스가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 좋아요한 코스 */}
        <div 
          className="p-6 rounded-lg"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                margin: 0
              }}
            >
              💖 좋아요한 코스
            </h3>
            <Link 
              to="/my/likes"
              style={{
                fontSize: '14px',
                color: 'var(--notion-blue)',
                textDecoration: 'none'
              }}
            >
              더보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {likesData?.content?.slice(0, 3).map((like, index) => (
              <div 
                key={like.id || like.likeId || `like-${index}`}
                className="p-3 rounded"
                style={{
                  background: 'var(--notion-gray-bg)',
                  border: '1px solid var(--notion-gray-light)',
                  borderRadius: '6px'
                }}
              >
                <Link 
                  to={`/courses/${like.courseListDto?.courseId || ''}`}
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--notion-text)',
                    textDecoration: 'none'
                  }}
                >
                  {like.courseListDto?.title || '코스 정보 없음'}
                </Link>
                <p 
                  style={{
                    fontSize: '13px',
                    color: 'var(--notion-text-light)',
                    marginTop: '4px'
                  }}
                >
                  {like.courseListDto?.description && like.courseListDto.description.length > 50 
                    ? `${like.courseListDto.description.slice(0, 50)}...` 
                    : like.courseListDto?.description || '설명 없음'}
                </p>
                <div 
                  className="flex items-center space-x-3 mt-2"
                  style={{
                    fontSize: '12px',
                    color: 'var(--notion-text-light)'
                  }}
                >
                  <span>⭐ {like.courseListDto?.averageRating?.toFixed(1) || '0.0'}</span>
                  <span>❤️ {like.courseListDto?.likeCount || 0}</span>
                  <span>📍 {like.courseListDto?.region || '지역 정보 없음'}</span>
                </div>
              </div>
            ))}
            {(!likesData?.content || likesData.content.length === 0) && (
              <div 
                className="text-center py-8"
                style={{ color: 'var(--notion-text-light)' }}
              >
                좋아요한 코스가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 회원탈퇴 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{
              background: 'var(--notion-white)',
              border: '1px solid var(--notion-gray-light)',
              borderRadius: '8px'
            }}
          >
            <h3 
              className="mb-4"
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--notion-text)'
              }}
            >
              회원탈퇴
            </h3>
            
            <div className="mb-4">
              <div 
                className="mb-4 p-4 rounded-lg"
                style={{
                  background: 'var(--notion-red-bg)',
                  border: '1px solid var(--notion-red-light)',
                  borderRadius: '6px'
                }}
              >
                <p 
                  style={{
                    fontSize: '14px',
                    color: 'var(--notion-red)',
                    lineHeight: '1.5',
                    fontWeight: '500',
                    margin: 0
                  }}
                >
                  ⚠️ 회원탈퇴 시 다음 데이터가 영구 삭제됩니다:
                </p>
                <ul 
                  style={{
                    fontSize: '13px',
                    color: 'var(--notion-text-light)',
                    lineHeight: '1.5',
                    marginTop: '8px',
                    marginBottom: 0,
                    paddingLeft: '20px'
                  }}
                >
                  <li>작성한 모든 코스 및 여행 계획</li>
                  <li>작성한 댓글 및 리뷰</li>
                  <li>북마크 및 좋아요 정보</li>
                  <li>프로필 및 계정 정보</li>
                </ul>
              </div>
              <p 
                className="mb-4"
                style={{
                  fontSize: '14px',
                  color: 'var(--notion-text-light)',
                  lineHeight: '1.5'
                }}
              >
                회원탈퇴를 진행하시려면 비밀번호를 입력해주세요.
              </p>
              <label 
                className="block mb-2"
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--notion-text)'
                }}
              >
                비밀번호
              </label>
              <input
                type="password"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--notion-gray-light)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawPassword('');
                }}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  color: 'var(--notion-text)',
                  background: 'transparent',
                  border: '1px solid var(--notion-gray-light)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: 'var(--notion-red)',
                  color: 'var(--notion-white)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  opacity: withdrawMutation.isPending ? 0.5 : 1
                }}
              >
                {withdrawMutation.isPending ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </LinearLayout>
  );
};

export default MyPage;