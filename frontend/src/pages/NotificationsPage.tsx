import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead
} from '../hooks/useNotifications';
import { notificationService } from '../api/services/notification.service';
import LinearLayout from '../components/layout/LinearLayout';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  // Hooks - 백엔드 API 확인 완료, 정상 작동
  const { data: notificationsData, isLoading, error } = useNotifications({ page: currentPage, size: 10 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  // 백엔드에는 읽은 알림 전체 삭제만 있음 (개별 삭제 없음)
  const deleteReadNotificationsMutation = useMutation({
    mutationFn: () => notificationService.deleteReadNotifications(),
    onSuccess: () => {
      alert('읽은 알림이 모두 삭제되었습니다.');
      // 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error) => {
      console.error('읽은 알림 삭제 실패:', error);
      alert('읽은 알림 삭제에 실패했습니다.');
    }
  });

  const notifications = notificationsData?.content || [];
  const totalElements = notificationsData?.totalElements || 0;
  const hasNextPage = notificationsData && !notificationsData.last;
  const hasPreviousPage = notificationsData && !notificationsData.first;

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (confirm('모든 알림을 읽음 처리하시겠습니까?')) {
      try {
        await markAllAsReadMutation.mutateAsync();
      } catch (error) {
        console.error('모든 알림 읽음 처리 실패:', error);
      }
    }
  };

  const handleDeleteReadNotifications = async () => {
    if (confirm('읽은 알림을 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await deleteReadNotificationsMutation.mutateAsync();
      } catch (error) {
        console.error('읽은 알림 삭제 실패:', error);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return '💖';
      case 'COMMENT': return '💬';
      default: return '📢';
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'LIKE': return '좋아요';
      case 'COMMENT': return '댓글';
      default: return '알림';
    }
  };

  if (isLoading) {
    return (
      <LinearLayout title="알림" breadcrumbs={[{ label: '알림' }]}>
        <div className="animate-pulse space-y-6">
          <div 
            className="h-32 rounded"
            style={{ background: 'var(--notion-gray-light)' }}
          />
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="h-20 rounded"
              style={{ background: 'var(--notion-gray-light)' }}
            />
          ))}
        </div>
      </LinearLayout>
    );
  }

  return (
    <LinearLayout title="알림" breadcrumbs={[{ label: '알림' }]}>
      {/* 헤더 액션 */}
      <div 
        className="flex items-center justify-between mb-6 p-4 rounded-lg"
        style={{
          background: 'var(--notion-white)',
          border: '1px solid var(--notion-gray-light)',
          borderRadius: '8px'
        }}
      >
        <div className="flex items-center space-x-4">
          <h2 
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--notion-text)',
              margin: 0
            }}
          >
            📢 알림 {totalElements > 0 && `(${totalElements}개)`}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
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
            ✅ {markAllAsReadMutation.isPending ? '처리중...' : '모두 읽음'}
          </button>

          <button
            onClick={handleDeleteReadNotifications}
            disabled={deleteReadNotificationsMutation.isPending}
            style={{
              color: 'var(--notion-red)',
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
            🗑️ {deleteReadNotificationsMutation.isPending ? '삭제중...' : '읽은 알림 삭제'}
          </button>
        </div>
      </div>

      {/* 에러 상태 */}
      {error && (
        <div 
          className="p-4 mb-6 rounded-lg text-center"
          style={{
            background: 'var(--notion-red-bg)',
            border: '1px solid var(--notion-red-light)',
            color: 'var(--notion-red)'
          }}
        >
          <p className="mb-3">알림을 불러오는데 실패했습니다.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              color: 'var(--notion-red)',
              background: 'transparent',
              border: '1px solid var(--notion-red-light)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 알림이 없는 경우 */}
      {notifications.length === 0 && !isLoading && !error && (
        <div 
          className="p-8 rounded-lg text-center"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h3 
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--notion-text)',
              marginBottom: '8px'
            }}
          >
            알림이 없습니다
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--notion-text-light)' }}>
            새로운 알림이 도착하면 여기에 표시됩니다.
          </p>
        </div>
      )}

      {/* 알림 목록 */}
      {notifications.length > 0 && (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.notificationId}
              className={`p-4 rounded-lg transition-all cursor-pointer ${
                !notification.isRead ? 'ring-2 ring-blue-100' : ''
              }`}
              style={{
                background: notification.isRead ? 'var(--notion-white)' : 'var(--notion-blue-bg)',
                border: `1px solid ${notification.isRead ? 'var(--notion-gray-light)' : 'var(--notion-blue-light)'}`,
                borderRadius: '8px'
              }}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.notificationId)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div style={{ fontSize: '20px' }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span 
                        style={{
                          fontSize: '12px',
                          color: 'var(--notion-blue)',
                          background: 'var(--notion-blue-bg)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}
                      >
                        {getNotificationTypeText(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <span 
                          style={{
                            width: '8px',
                            height: '8px',
                            background: 'var(--notion-red)',
                            borderRadius: '50%'
                          }}
                        />
                      )}
                    </div>
                    
                    <h4 
                      style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: 'var(--notion-text)',
                        marginBottom: '4px',
                        lineHeight: '1.4'
                      }}
                    >
                      {notification.message}
                    </h4>
                    
                    {/* 백엔드에는 title과 content가 분리되어 있지 않고 message만 있음 */}
                    
                    <div 
                      className="flex items-center space-x-3"
                      style={{
                        fontSize: '12px',
                        color: 'var(--notion-text-light)'
                      }}
                    >
                      <span>📅 {new Date(notification.createdAt).toLocaleDateString()}</span>
                      <span>⏰ {new Date(notification.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.notificationId);
                      }}
                      disabled={markAsReadMutation.isPending}
                      style={{
                        color: 'var(--notion-blue)',
                        background: 'transparent',
                        border: '1px solid var(--notion-gray-light)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      title="읽음 처리"
                    >
                      ✅
                    </button>
                  )}
                  
                  {/* 개별 알림 삭제는 백엔드에서 미지원 - 읽은 알림만 일괄 삭제 가능 */}
                  {notification.isRead && (
                    <div
                      style={{
                        color: 'var(--notion-text-light)',
                        background: 'transparent',
                        border: '1px solid var(--notion-gray-light)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        opacity: 0.7
                      }}
                      title="상단의 '읽은 알림 삭제' 버튼을 이용해주세요"
                    >
                      읽음
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {(hasNextPage || hasPreviousPage) && (
        <div 
          className="flex items-center justify-center space-x-4 mt-8 p-4 rounded-lg"
          style={{
            background: 'var(--notion-white)',
            border: '1px solid var(--notion-gray-light)',
            borderRadius: '8px'
          }}
        >
          <button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={!hasPreviousPage}
            style={{
              color: 'var(--notion-text)',
              background: 'transparent',
              border: '1px solid var(--notion-gray-light)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: hasPreviousPage ? 'pointer' : 'not-allowed',
              opacity: hasPreviousPage ? 1 : 0.5
            }}
          >
            ← 이전
          </button>
          
          <span 
            style={{
              fontSize: '14px',
              color: 'var(--notion-text-light)',
              fontWeight: '500'
            }}
          >
            페이지 {currentPage + 1}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasNextPage}
            style={{
              color: 'var(--notion-text)',
              background: 'transparent',
              border: '1px solid var(--notion-gray-light)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: hasNextPage ? 'pointer' : 'not-allowed',
              opacity: hasNextPage ? 1 : 0.5
            }}
          >
            다음 →
          </button>
        </div>
      )}
    </LinearLayout>
  );
};

export default NotificationsPage;