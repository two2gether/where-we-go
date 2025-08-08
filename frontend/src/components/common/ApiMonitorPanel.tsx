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
  RotateCw as ArrowPathIcon
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
const JsonFormatter: React.FC<{ data: any; title: string }> = ({ data, title }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
        <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {typeof data === 'string' ? `${data.length} chars` : `${Object.keys(data).length} fields`}
        </span>
      </button>
      {isExpanded && (
        <div className="border-t border-gray-200">
          <pre className="p-4 bg-gray-900 text-green-400 text-xs overflow-x-auto max-h-60 font-mono rounded-b-md">
            {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// 개별 로그 항목 컴포넌트
const LogItem: React.FC<{ log: ApiLogEntry }> = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
              <JsonFormatter data={log.responseData} title="Response Data" />
              {log.error && <JsonFormatter data={log.error} title="Error Details" />}
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
        className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
      >
        <AdjustmentsHorizontalIcon className="w-4 h-4" />
        <span>Filter</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-64">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Method</label>
              <select
                value={filter.method}
                onChange={(e) => setFilter({ method: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ status: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="ALL">All Status</option>
                <option value="2xx">2xx Success</option>
                <option value="4xx">4xx Client Error</option>
                <option value="5xx">5xx Server Error</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Search URL</label>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter({ search: e.target.value })}
                placeholder="Filter by URL..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
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
const ApiMonitorPanel: React.FC = () => {
  const { 
    isVisible, 
    logs, 
    filter,
    toggleVisible, 
    clearLogs,
    toggleEnabled,
    isEnabled
  } = useApiMonitorStore();
  
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
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-0 right-0 w-1/3 h-full bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col min-w-[400px] max-w-[600px]">
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
            {filteredLogs.map((log) => (
              <LogItem key={`${log.id}-${log.timestamp}`} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiMonitorPanel;