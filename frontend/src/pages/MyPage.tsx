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
  useMyNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead
} from '../hooks/useUser';
import { GitHubLayout, GitHubSidebar, GitHubSidebarSection } from '../components/layout/GitHubLayout';
import type { MyPageUpdateRequest, WithdrawRequest } from '../api/types';

type TabType = 'profile' | 'comments' | 'bookmarks' | 'reviews' | 'courses' | 'course-bookmarks' | 'likes' | 'notifications';

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');

  // 프로필 정보
  const { data: myPageData, isLoading } = useMyPage();
  const updateMyPageMutation = useUpdateMyPage();
  const withdrawMutation = useWithdraw();

  // 알림 기능
  const markNotificationAsReadMutation = useMarkNotificationAsRead();
  const markAllNotificationsAsReadMutation = useMarkAllNotificationsAsRead();

  // 탭별 데이터
  const { data: commentsData } = useMyComments(0, 10);
  const { data: bookmarksData } = useMyBookmarks(0, 20);
  const { data: reviewsData } = useMyReviews(0, 10);
  const { data: coursesData } = useMyCourses(0, 20);
  const { data: courseBookmarksData } = useMyCourseBookmarks(0, 20);
  const { data: likesData } = useMyCourseLikes(0, 10);
  const { data: notificationsData } = useMyNotifications(0, 10);

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
      alert('회원탈퇴가 완료되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('회원탈퇴 실패:', error);
      alert('회원탈퇴에 실패했습니다. 비밀번호를 확인해주세요.');
    }
  };

  const tabs = [
    { label: '마이페이지', href: '/mypage', active: activeTab === 'profile' },
    { label: '알림', href: '/mypage?tab=notifications', active: activeTab === 'notifications' },
  ];

  const sidebar = (
    <GitHubSidebar>
      <GitHubSidebarSection title="내 활동">
        <button
          onClick={() => setActiveTab('comments')}
          className={`w-full text-left px-3 py-2 rounded-md text-sm ${
            activeTab === 'comments' 
              ? 'bg-primary-100 text-primary-700 font-medium' 
              : 'text-github-neutral hover:bg-github-canvas-subtle'
          }`}
        >
          내 댓글 ({commentsData?.totalElements || 0})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`w-full text-left px-3 py-2 rounded-md text-sm ${
            activeTab === 'reviews' 
              ? 'bg-primary-100 text-primary-700 font-medium' 
              : 'text-github-neutral hover:bg-github-canvas-subtle'
          }`}
        >
          내 리뷰 ({reviewsData?.totalElements || 0})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`w-full text-left px-3 py-2 rounded-md text-sm ${
            activeTab === 'courses' 
              ? 'bg-primary-100 text-primary-700 font-medium' 
              : 'text-github-neutral hover:bg-github-canvas-subtle'
          }`}
        >
          내가 만든 코스 ({coursesData?.totalElements || 0})
        </button>
      </GitHubSidebarSection>

      <GitHubSidebarSection title="북마크 & 좋아요">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`w-full text-left px-3 py-2 rounded-md text-sm ${
            activeTab === 'bookmarks' 
              ? 'bg-primary-100 text-primary-700 font-medium' 
              : 'text-github-neutral hover:bg-github-canvas-subtle'
          }`}
        >
          장소 북마크 ({bookmarksData?.totalElements || bookmarksData?.content?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('course-bookmarks')}
          className={`w-full text-left px-3 py-2 rounded-md text-sm ${
            activeTab === 'course-bookmarks' 
              ? 'bg-primary-100 text-primary-700 font-medium' 
              : 'text-github-neutral hover:bg-github-canvas-subtle'
          }`}
        >
          코스 북마크 ({courseBookmarksData?.totalElements || 0})
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`w-full text-left px-3 py-2 rounded-md text-sm ${
            activeTab === 'likes' 
              ? 'bg-primary-100 text-primary-700 font-medium' 
              : 'text-github-neutral hover:bg-github-canvas-subtle'
          }`}
        >
          좋아요한 코스 ({likesData?.totalElements || 0})
        </button>
      </GitHubSidebarSection>

      <GitHubSidebarSection title="설정">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`w-full text-left px-3 py-2 rounded-md text-sm ${
            activeTab === 'notifications' 
              ? 'bg-primary-100 text-primary-700 font-medium' 
              : 'text-github-neutral hover:bg-github-canvas-subtle'
          }`}
        >
          알림 ({notificationsData?.totalElements || 0})
        </button>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
        >
          회원탈퇴
        </button>
      </GitHubSidebarSection>
    </GitHubSidebar>
  );

  if (isLoading) {
    return (
      <GitHubLayout title="마이페이지" tabs={tabs} sidebar={sidebar}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </GitHubLayout>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-lg border border-github-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-github-neutral">프로필 정보</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle"
                >
                  편집
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-github-neutral mb-2">
                    닉네임
                  </label>
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                    className="w-full px-3 py-2 text-github-neutral border border-github-border rounded-md focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-github-neutral mb-2">
                    프로필 이미지 URL
                  </label>
                  <input
                    type="url"
                    value={editForm.profileImage}
                    onChange={(e) => setEditForm(prev => ({ ...prev, profileImage: e.target.value }))}
                    className="w-full px-3 py-2 text-github-neutral border border-github-border rounded-md focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                    placeholder="프로필 이미지 URL을 입력하세요"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={updateMyPageMutation.isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {updateMyPageMutation.isPending ? '저장 중...' : '저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle"
                  >
                    취소
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
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-github-canvas-subtle flex items-center justify-center">
                      <svg className="w-8 h-8 text-github-neutral-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-github-neutral">{myPageData?.nickname}</h3>
                    <p className="text-github-neutral-muted">{myPageData?.email}</p>
                  </div>
                </div>

                <div className="text-sm text-github-neutral-muted">
                  가입일: {new Date(myPageData?.createdAt || '').toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        );

      case 'comments':
        return (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">내가 작성한 댓글</h2>
                <span className="text-sm text-gray-500">
                  총 {commentsData?.totalElements || 0}개
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {commentsData?.content?.map((comment) => (
                <div key={comment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">📝 댓글</span>
                          <Link 
                            to={`/courses/${comment.courseId}`}
                            className="inline-flex items-center group"
                          >
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              코스 #{comment.courseId}
                            </h3>
                            <svg 
                              className="ml-1 w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-200">
                        <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                      </div>
                      
                      {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                        <div className="text-xs text-gray-400 mt-2">
                          편집됨: {new Date(comment.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!commentsData?.content || commentsData.content.length === 0) && (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">작성한 댓글이 없습니다</h3>
                  <p className="text-gray-500 mb-4">코스에 댓글을 남겨보세요!</p>
                  <Link 
                    to="/courses" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    코스 둘러보기
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        );

      case 'bookmarks':
        return (
          <div className="bg-white rounded-lg border border-github-border">
            <div className="border-b border-github-border p-4">
              <h2 className="text-lg font-semibold text-github-neutral">장소 북마크</h2>
            </div>
            <div className="divide-y divide-github-border">
              {bookmarksData?.content?.map((bookmark) => (
                <div key={bookmark.bookmarkId} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link 
                        to={`/places/${bookmark.place.placeId}`}
                        className="inline-flex items-center group"
                      >
                        <h3 className="font-semibold text-github-neutral group-hover:text-primary-600 transition-colors">
                          {bookmark.place.name}
                        </h3>
                        <svg 
                          className="ml-2 w-4 h-4 text-github-neutral-muted group-hover:text-primary-600 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <p className="text-sm text-github-neutral-muted mt-1">{bookmark.place.address}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-github-neutral-muted">
                        <span>⭐ {bookmark.place.averageRating?.toFixed(1) || '0.0'}</span>
                        <span>리뷰 {bookmark.place.reviewCount || 0}개</span>
                      </div>
                    </div>
                    <span className="text-xs text-github-neutral-muted">
                      {new Date(bookmark.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!bookmarksData?.content || bookmarksData.content.length === 0) && (
                <div className="p-8 text-center text-github-neutral-muted">
                  북마크한 장소가 없습니다.
                </div>
              )}
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="bg-white rounded-lg border border-github-border">
            <div className="border-b border-github-border p-4">
              <h2 className="text-lg font-semibold text-github-neutral">내가 작성한 리뷰</h2>
            </div>
            <div className="divide-y divide-github-border">
              {reviewsData?.content?.map((review) => (
                <div key={review.reviewId} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link 
                        to={`/places/${review.placeId}`}
                        className="inline-flex items-center group"
                      >
                        <h3 className="font-semibold text-github-neutral group-hover:text-primary-600 transition-colors">
                          📍 장소 상세보기
                        </h3>
                        <svg 
                          className="ml-1 w-4 h-4 text-github-neutral-muted group-hover:text-primary-600 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <p className="text-xs text-github-neutral-muted mt-1">
                        {review.placeId}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-github-neutral-muted">
                          {review.rating}/5
                        </span>
                      </div>
                      <p className="text-github-neutral mt-2">{review.content}</p>
                      <div className="text-xs text-github-neutral-muted mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!reviewsData?.content || reviewsData.content.length === 0) && (
                <div className="p-8 text-center text-github-neutral-muted">
                  작성한 리뷰가 없습니다.
                </div>
              )}
            </div>
          </div>
        );

      case 'courses':
        return (
          <div className="bg-white rounded-lg border border-github-border">
            <div className="border-b border-github-border p-4">
              <h2 className="text-lg font-semibold text-github-neutral">내가 만든 코스</h2>
            </div>
            <div className="divide-y divide-github-border">
              {coursesData?.content?.map((course) => (
                <div key={course.courseId} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link to={`/courses/${course.courseId}`} className="inline-flex items-center group">
                        <h3 className="font-semibold text-github-neutral group-hover:text-primary-600 transition-colors">
                          {course.title}
                        </h3>
                        <svg className="ml-2 w-4 h-4 text-github-neutral-muted group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <p className="text-sm text-github-neutral-muted mt-1">{course.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-github-neutral-muted">
                        <span>👥 {course.commentCount || 0}개 댓글</span>
                        <span>❤️ {course.likeCount || 0}개 좋아요</span>
                        <span>🔖 {course.bookmarkCount || 0}개 북마크</span>
                      </div>
                      <div className="text-xs text-github-neutral-muted mt-2">
                        생성일: {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!coursesData?.content || coursesData.content.length === 0) && (
                <div className="p-8 text-center text-github-neutral-muted">
                  만든 코스가 없습니다.
                </div>
              )}
            </div>
          </div>
        );

      case 'course-bookmarks':
        return (
          <div className="bg-white rounded-lg border border-github-border">
            <div className="border-b border-github-border p-4">
              <h2 className="text-lg font-semibold text-github-neutral">북마크한 코스</h2>
            </div>
            <div className="divide-y divide-github-border">
              {courseBookmarksData?.content?.map((bookmark) => (
                <div key={bookmark.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-github-neutral">{bookmark.course.title}</h3>
                      <p className="text-sm text-github-neutral-muted mt-1">{bookmark.course.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-github-neutral-muted">
                        <span>작성자: {bookmark.course.authorNickname}</span>
                        <span>👥 {bookmark.course.commentCount || 0}개 댓글</span>
                        <span>❤️ {bookmark.course.likeCount || 0}개 좋아요</span>
                      </div>
                      <div className="text-xs text-github-neutral-muted mt-2">
                        북마크 일시: {new Date(bookmark.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!courseBookmarksData?.content || courseBookmarksData.content.length === 0) && (
                <div className="p-8 text-center text-github-neutral-muted">
                  북마크한 코스가 없습니다.
                </div>
              )}
            </div>
          </div>
        );

      case 'likes':
        return (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">좋아요한 코스</h2>
                <span className="text-sm text-gray-500">
                  총 {likesData?.totalElements || 0}개
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {likesData?.content?.map((like) => (
                <div key={like.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link 
                        to={`/courses/${like.courseListDto.courseId}`}
                        className="inline-flex items-center group mb-3"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {like.courseListDto.title}
                        </h3>
                        <svg 
                          className="ml-2 w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {like.courseListDto.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        {like.courseListDto.themes?.map((theme, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {theme}
                          </span>
                        ))}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          📍 {like.courseListDto.region}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {like.courseListDto.nickname}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {like.courseListDto.likeCount}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          {like.courseListDto.averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {like.courseListDto.places?.length || 0}개 장소
                        </div>
                      </div>
                      
                      {like.createdAt && (
                        <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                          좋아요 일시: {new Date(like.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!likesData?.content || likesData.content.length === 0) && (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">좋아요한 코스가 없습니다</h3>
                  <p className="text-gray-500 mb-4">마음에 드는 코스에 좋아요를 눌러보세요!</p>
                  <Link 
                    to="/courses" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    코스 둘러보기
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="bg-white rounded-lg border border-github-border">
            <div className="border-b border-github-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-github-neutral">알림</h2>
              {notificationsData?.content && notificationsData.content.length > 0 && (
                <button
                  onClick={async () => {
                    try {
                      await markAllNotificationsAsReadMutation.mutateAsync();
                    } catch (error) {
                      console.error('모든 알림 읽음 처리 실패:', error);
                      alert('모든 알림 읽음 처리에 실패했습니다.');
                    }
                  }}
                  disabled={markAllNotificationsAsReadMutation.isPending}
                  className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  {markAllNotificationsAsReadMutation.isPending ? '처리 중...' : '모두 읽음 처리'}
                </button>
              )}
            </div>
            <div className="divide-y divide-github-border">
              {notificationsData?.content?.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-semibold text-github-neutral">{notification.title}</h3>
                        {!notification.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-github-neutral-muted mt-1">{notification.content}</p>
                      <div className="text-xs text-github-neutral-muted mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={async () => {
                          try {
                            await markNotificationAsReadMutation.mutateAsync(notification.id);
                          } catch (error) {
                            console.error('알림 읽음 처리 실패:', error);
                            alert('알림 읽음 처리에 실패했습니다.');
                          }
                        }}
                        disabled={markNotificationAsReadMutation.isPending}
                        className="text-xs text-primary-600 hover:text-primary-700 ml-4 disabled:opacity-50"
                      >
                        {markNotificationAsReadMutation.isPending ? '처리 중...' : '읽음'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(!notificationsData?.content || notificationsData.content.length === 0) && (
                <div className="p-8 text-center text-github-neutral-muted">
                  알림이 없습니다.
                </div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg border border-github-border p-8 text-center">
            <p className="text-github-neutral-muted">준비 중입니다.</p>
          </div>
        );
    }
  };

  return (
    <GitHubLayout title="마이페이지" tabs={tabs} sidebar={sidebar}>
      {renderTabContent()}

      {/* 회원탈퇴 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-github-neutral mb-4">회원탈퇴</h3>
            
            <div className="mb-4">
              <p className="text-sm text-github-neutral-muted mb-4">
                회원탈퇴를 진행하시려면 비밀번호를 입력해주세요.
                탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.
              </p>
              <label className="block text-sm font-medium text-github-neutral mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                className="w-full p-3 text-github-neutral border border-github-border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawPassword('');
                }}
                className="flex-1 px-4 py-2 text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle"
              >
                취소
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {withdrawMutation.isPending ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </GitHubLayout>
  );
};

export default MyPage;