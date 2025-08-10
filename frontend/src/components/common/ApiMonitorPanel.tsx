import React, { useState, useMemo } from 'react';
import { useApiMonitorStore, type ApiLogEntry } from '../../store/apiMonitorStore';
import { 
  X as XMarkIcon, 
  Settings as AdjustmentsHorizontalIcon,
  Trash2 as TrashIcon,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  Clock as ClockIcon,
  AlertTriangle as ExclamationTriangleIcon,
  CheckCircle as CheckCircleIcon,
  RotateCw as ArrowPathIcon,
  Copy as CopyIcon
} from 'lucide-react';

// HTTP 메소드별 색상
const getMethodColor = (method: string) => {
  const colors = {
    GET: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
    PATCH: 'bg-purple-100 text-purple-800',
  } as const;
  
  return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

// 상태별 색상
const getStatusColor = (status?: number, type?: string) => {
  if (type === 'error') return 'text-red-600';
  if (!status) return 'text-gray-400';
  if (status >= 200 && status < 300) return 'text-green-600';
  if (status >= 400) return 'text-red-600';
  return 'text-yellow-600';
};

// 상태별 아이콘
const getStatusIcon = (status?: number, type?: string) => {
  if (type === 'error') return <ExclamationTriangleIcon className="w-4 h-4" />;
  if (type === 'request') return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
  if (!status) return <ClockIcon className="w-4 h-4" />;
  if (status >= 200 && status < 300) return <CheckCircleIcon className="w-4 h-4" />;
  return <ExclamationTriangleIcon className="w-4 h-4" />;
};

// JSON 포맷터 컴포넌트
const JsonFormatter: React.FC<{ data: any; title: string; defaultExpanded?: boolean; isResponseData?: boolean }> = ({ data, title, defaultExpanded = false, isResponseData = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showFullList, setShowFullList] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Response 데이터 생략 로직 (data 배열 안의 아이템들을 2개로 제한)
  const getDisplayData = () => {
    if (!isResponseData || typeof data !== 'object' || data === null) {
      return data;
    }
    
    if (showFullList) {
      return data;
    }
    
    // 직접 배열인 경우
    if (Array.isArray(data)) {
      return data.length > 2 ? data.slice(0, 2) : data;
    }
    
    // 객체인 경우 - data 필드의 배열을 생략
    const result = { ...data };
    if (result.data && Array.isArray(result.data) && result.data.length > 2) {
      result.data = result.data.slice(0, 2);
    }
    
    return result;
  };
  
  const displayData = getDisplayData();
  const hasMore = isResponseData && (
    (Array.isArray(data) && data.length > 2) || 
    (typeof data === 'object' && data !== null && !Array.isArray(data) && data.data && Array.isArray(data.data) && data.data.length > 2)
  );
  
  // 복사 기능
  const handleCopy = async () => {
    try {
      const textToCopy = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };
  
  // 데이터가 없거나 빈 객체인 경우 표시하지 않음
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return (
      <div className="border border-gray-200 rounded-md p-3 bg-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-2">📭</span>
          <span className="font-medium text-gray-700">{title}</span>
          <span className="ml-2 text-gray-400">(empty)</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border border-gray-200 rounded-md bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-3 transition-colors"
      >
        {isExpanded ? (
          <ChevronDownIcon className="w-4 h-4 mr-2 text-gray-500" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 mr-2 text-gray-500" />
        )}
        <span className="mr-2">📦</span>
        <span className="font-medium text-gray-800">{title}</span>
        <div className="ml-auto flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className={`p-1 rounded transition-colors ${
              copySuccess 
                ? 'bg-green-100 text-green-600' 
                : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
            }`}
            title={copySuccess ? 'Copied!' : 'Copy to clipboard'}
          >
            <CopyIcon className="w-3 h-3" />
          </button>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {typeof data === 'string' ? `${data.length} chars` : `${Object.keys(data).length} fields`}
          </span>
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-gray-200">
          <pre className={`p-4 text-xs overflow-auto font-mono whitespace-pre-wrap break-words ${
            isResponseData 
              ? 'bg-slate-900 text-blue-300 max-h-[500px]' 
              : 'bg-gray-900 text-green-400 max-h-96'
          } ${hasMore && !showFullList ? 'rounded-none' : 'rounded-b-md'}`}>
            {typeof displayData === 'string' ? displayData : JSON.stringify(displayData, null, 2)}
            {hasMore && !showFullList && (
              <div className="text-yellow-300 mt-2 italic">
                {Array.isArray(data) 
                  ? `\n... and ${data.length - 2} more items`
                  : data.data && Array.isArray(data.data)
                  ? `\n... and ${data.data.length - 2} more items in data array`
                  : `\n... truncated`
                }
              </div>
            )}
          </pre>
          {hasMore && (
            <div className={`px-4 py-2 ${isResponseData ? 'bg-slate-800' : 'bg-gray-800'} rounded-b-md`}>
              <button
                onClick={() => setShowFullList(!showFullList)}
                className="text-xs px-2 py-1 rounded transition-colors bg-blue-600 hover:bg-blue-700 text-white"
              >
                {showFullList ? '간략히 보기' : '전체 보기'} 
                {!showFullList && (Array.isArray(data) 
                  ? ` (+${data.length - 2} items)`
                  : data.data && Array.isArray(data.data)
                  ? ` (+${data.data.length - 2} items)`
                  : ''
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 개별 로그 항목 컴포넌트
const LogItem: React.FC<{ log: ApiLogEntry; isLatest: boolean }> = ({ log, isLatest }) => {
  const [isExpanded, setIsExpanded] = useState(isLatest);
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };
  
  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    return `${duration}ms`;
  };
  
  const getUrl = (url: string) => {
    // 긴 URL을 줄여서 표시
    const maxLength = 60;
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };
  
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div
        className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`flex items-center space-x-2 ${getStatusColor(log.status, log.type)}`}>
            {getStatusIcon(log.status, log.type)}
            <span className="text-sm font-mono font-bold">
              {log.status || (log.type === 'request' ? 'PENDING' : 'ERROR')}
            </span>
          </div>
          
          <span className={`px-3 py-1 text-xs font-bold rounded-md ${getMethodColor(log.method)}`}>
            {log.method}
          </span>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate" title={log.url}>
              {getUrl(log.url)}
            </div>
            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
              <span>🕐 {formatTime(log.timestamp)}</span>
              {log.duration && (
                <span className="text-blue-600 font-medium">⚡ {formatDuration(log.duration)}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">
                <span className="font-bold text-gray-800">Method:</span>
                <span className="ml-2 font-mono text-gray-900">{log.method}</span>
              </div>
              <div className="text-sm">
                <span className="font-bold text-gray-800">Status:</span>
                <span className={`ml-2 font-mono font-bold ${getStatusColor(log.status, log.type)}`}>
                  {log.status || 'Pending'}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-bold text-gray-800">Duration:</span>
                <span className="ml-2 font-mono text-blue-600 font-medium">{formatDuration(log.duration)}</span>
              </div>
              <div className="text-sm">
                <span className="font-bold text-gray-800">Time:</span>
                <span className="ml-2 font-mono text-gray-900">{formatTime(log.timestamp)}</span>
              </div>
            </div>
            
            <div>
              <div className="font-bold text-gray-800 mb-2 text-sm">🔗 URL:</div>
              <code className="text-xs bg-white p-3 rounded-md block break-all text-gray-900 border border-gray-200">
                {log.url}
              </code>
            </div>
            
            <div className="space-y-3">
              <JsonFormatter data={log.requestData} title="Request Body" />
              <JsonFormatter data={log.requestParams} title="Request Params" />
              <JsonFormatter data={log.requestHeaders} title="Request Headers" />
              <JsonFormatter 
                data={log.responseData} 
                title="Response Data" 
                defaultExpanded={isLatest} 
                isResponseData={true}
              />
              {log.error && <JsonFormatter data={log.error} title="Error Details" defaultExpanded={isLatest} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 필터 컴포넌트
const FilterPanel: React.FC = () => {
  const { filter, setFilter } = useApiMonitorStore();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 rounded"
      >
        <AdjustmentsHorizontalIcon className="w-4 h-4" />
        <span>Filter</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-4 z-20 min-w-64" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' }}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">Method</label>
              <select
                value={filter.method}
                onChange={(e) => setFilter({ method: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-400 rounded-md bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="ALL">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ status: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-400 rounded-md bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="ALL">All Status</option>
                <option value="2xx">2xx Success</option>
                <option value="4xx">4xx Client Error</option>
                <option value="5xx">5xx Server Error</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">Search URL</label>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter({ search: e.target.value })}
                placeholder="Filter by URL..."
                className="w-full px-3 py-2 text-sm border-2 border-gray-400 rounded-md bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            
            <button
              onClick={() => {
                setFilter({ method: 'ALL', status: 'ALL', search: '' });
                setIsOpen(false);
              }}
              className="w-full px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 메인 API 모니터링 패널
const ApiMonitorPanel: React.FC<{ isPopupMode?: boolean }> = ({ isPopupMode = false }) => {
  const { 
    isVisible, 
    logs, 
    filter,
    width,
    isModalMode,
    toggleVisible, 
    clearLogs,
    toggleEnabled,
    setWidth,
    toggleModalMode,
    isEnabled
  } = useApiMonitorStore();
  
  const [isResizing, setIsResizing] = useState(false);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };
  
  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = window.innerWidth - e.clientX;
    setWidth(newWidth);
  }, [isResizing, setWidth]);
  
  const handleMouseUp = React.useCallback(() => {
    setIsResizing(false);
  }, []);
  
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);
  
  // 필터링된 로그
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 메소드 필터
      if (filter.method !== 'ALL' && log.method !== filter.method) {
        return false;
      }
      
      // 상태 필터
      if (filter.status !== 'ALL') {
        if (filter.status === 'PENDING' && log.status) return false;
        if (filter.status === '2xx' && !(log.status && log.status >= 200 && log.status < 300)) return false;
        if (filter.status === '4xx' && !(log.status && log.status >= 400 && log.status < 500)) return false;
        if (filter.status === '5xx' && !(log.status && log.status >= 500)) return false;
      }
      
      // URL 검색 필터
      if (filter.search && !log.url.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [logs, filter]);
  
  if (!isVisible && !isPopupMode) return null;

  // 팝업 모드일 때 (새 창에서만 사용)
  if (isPopupMode) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* 로그 리스트만 표시 */}
        <div className="flex-1 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50 to-white">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🌟</div>
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {!isEnabled ? 'API Monitoring Disabled' : 'No API Calls Yet'}
                </div>
                <div className="text-sm text-gray-600">
                  {!isEnabled 
                    ? 'Enable monitoring in the main window to see API calls here'
                    : 'Try logging in or searching for places to see API activity'
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredLogs.map((log, index) => (
                <LogItem 
                  key={`${log.id}-${log.timestamp}`} 
                  log={log} 
                  isLatest={index === 0} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 모달 모드일 때
  if (isModalMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl w-[90vw] h-[90vh] max-w-6xl flex flex-col">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${isEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xl font-bold text-gray-800">🔍 API Monitor</span>
                <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-md font-medium">상세 모드</span>
              </div>
              <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-md">
                {filteredLogs.length} / {logs.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleEnabled}
                className={`px-3 py-1 text-sm rounded ${
                  isEnabled 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                {isEnabled ? 'ON' : 'OFF'}
              </button>
              
              <FilterPanel />
              
              <button
                onClick={clearLogs}
                className="p-2 hover:bg-gray-200 rounded"
                title="Clear logs"
              >
                <TrashIcon className="w-4 h-4 text-gray-600" />
              </button>
              

              <button
                onClick={toggleModalMode}
                className="p-2 hover:bg-gray-200 rounded"
                title="사이드바 모드로 전환"
              >
                <div className="w-4 h-4 flex flex-col space-y-0.5">
                  <div className="w-full h-0.5 bg-gray-600"></div>
                  <div className="w-full h-0.5 bg-gray-600"></div>
                  <div className="w-full h-0.5 bg-gray-600"></div>
                </div>
              </button>
              
              <button
                onClick={toggleVisible}
                className="p-2 hover:bg-gray-200 rounded"
                title="Close panel"
              >
                <XMarkIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* 모달 콘텐츠 */}
          <div className="flex-1 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🌟</div>
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    {!isEnabled ? 'API Monitoring Disabled' : 'No API Calls Yet'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {!isEnabled 
                      ? 'Click the toggle above to start monitoring API calls'
                      : 'Try logging in or searching for places to see API activity'
                    }
                  </div>
                  {!isEnabled && (
                    <button
                      onClick={toggleEnabled}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Enable Monitoring
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredLogs.map((log, index) => (
                  <LogItem 
                    key={`${log.id}-${log.timestamp}`} 
                    log={log} 
                    isLatest={index === 0} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 사이드바 모드 (기본)
  return (
    <div 
      className="fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col"
      style={{ width: `${width}px` }}
    >
      {/* 리사이즈 핸들 */}
      <div
        className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-blue-400 transition-colors z-10"
        onMouseDown={handleMouseDown}
        style={{ 
          background: isResizing ? '#60a5fa' : 'transparent',
        }}
      />
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-lg font-bold text-gray-800">🔍 API Monitor</span>
          </div>
          <span className="text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded-md">
            {filteredLogs.length} / {logs.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleEnabled}
            className={`px-2 py-1 text-xs rounded ${
              isEnabled 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            {isEnabled ? 'ON' : 'OFF'}
          </button>
          
          <FilterPanel />
          
          <button
            onClick={clearLogs}
            className="p-1 hover:bg-gray-200 rounded"
            title="Clear logs"
          >
            <TrashIcon className="w-4 h-4 text-gray-600" />
          </button>

          <button
            onClick={toggleModalMode}
            className="p-1 hover:bg-gray-200 rounded"
            title="상세 모드로 보기"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          
          <button
            onClick={toggleVisible}
            className="p-1 hover:bg-gray-200 rounded"
            title="Close panel"
          >
            <XMarkIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* 로그 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50 to-white">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🌟</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">
                {!isEnabled ? 'API Monitoring Disabled' : 'No API Calls Yet'}
              </div>
              <div className="text-sm text-gray-600">
                {!isEnabled 
                  ? 'Click the toggle above to start monitoring API calls'
                  : 'Try logging in or searching for places to see API activity'
                }
              </div>
              {!isEnabled && (
                <button
                  onClick={toggleEnabled}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Enable Monitoring
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log, index) => (
              <LogItem 
                key={`${log.id}-${log.timestamp}`} 
                log={log} 
                isLatest={index === 0} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiMonitorPanel;