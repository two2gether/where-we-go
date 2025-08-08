import React from 'react';
import { useApiMonitorStore } from '../../store/apiMonitorStore';
import { Bug as BugAntIcon } from 'lucide-react';

const ApiMonitorButton: React.FC = () => {
  const { isVisible, isEnabled, toggleVisible, logs } = useApiMonitorStore();
  
  // 개발 환경이 아니면 버튼을 표시하지 않음
  if (!import.meta.env.DEV) return null;
  
  // 최근 활동 여부 체크 (최근 5초 이내 API 호출)
  const hasRecentActivity = logs.some(log => 
    Date.now() - log.timestamp < 5000
  );
  
  // 에러가 있는지 체크
  const hasErrors = logs.some(log => log.type === 'error');
  
  return (
    <button
      onClick={toggleVisible}
      className={`
        fixed bottom-4 left-4 w-12 h-12 rounded-full shadow-lg z-40
        flex items-center justify-center transition-all duration-200
        ${isVisible ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'}
        ${hasRecentActivity ? 'animate-pulse' : ''}
      `}
      title={`API Monitor ${isEnabled ? '(Enabled)' : '(Disabled)'}`}
    >
      <div className="relative">
        <BugAntIcon className="w-6 h-6 text-white" />
        
        {/* 에러 인디케이터 */}
        {hasErrors && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        )}
        
        {/* 활동 인디케이터 */}
        {hasRecentActivity && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
        )}
        
        {/* 비활성화 인디케이터 */}
        {!isEnabled && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-full" />
        )}
      </div>
      
      {/* 로그 개수 뱃지 */}
      {logs.length > 0 && (
        <div className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
          {logs.length > 99 ? '99+' : logs.length}
        </div>
      )}
    </button>
  );
};

export default ApiMonitorButton;