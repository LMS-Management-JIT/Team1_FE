import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Header } from '../../layouts/Header/Header';
import { useAuth } from '../../services/authService';
import { setupOneSignal } from '../../config/oneSignal';
import {
  getMyNotifications,
  markMyNotificationAsRead,
  markAllMyNotificationsAsRead,
  type NotificationItem,
  type NotificationType,
} from '../../services/notificationService';
import { Bell, CalendarClock, Megaphone, ClipboardCheck, Loader2, CheckCheck, X, Clock } from 'lucide-react';

const TABS: { key: 'ALL' | NotificationType; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'CLASS', label: 'Lớp học' },
  { key: 'ATTENDANCE', label: 'Điểm danh' },
  { key: 'SYSTEM', label: 'Hệ thống' },
];

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  CLASS: <Megaphone size={18} className="text-blue-500" />,
  ATTENDANCE: <ClipboardCheck size={18} className="text-green-600" />,
  SYSTEM: <Bell size={18} className="text-orange-500" />,
};

const TYPE_BADGE: Record<NotificationType, string> = {
  CLASS: 'bg-blue-50 text-blue-600 border-blue-200',
  ATTENDANCE: 'bg-green-50 text-green-700 border-green-200',
  SYSTEM: 'bg-orange-50 text-orange-600 border-orange-200',
};

const TYPE_LABEL: Record<NotificationType, string> = {
  CLASS: 'Lớp học',
  ATTENDANCE: 'Điểm danh',
  SYSTEM: 'Hệ thống',
};

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatFullTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function NotificationsPage() {
  const { accountId, oneSignalHash } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | NotificationType>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Kích hoạt OneSignal ngay cả khi học viên vào thẳng trang thông báo
  useEffect(() => {
    if (accountId) {
      setupOneSignal(accountId, oneSignalHash);
    }
  }, [accountId, oneSignalHash]);

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isSilent) setIsLoading(true);
    setError('');

    try {
      const data = await getMyNotifications(undefined, abortControllerRef.current.signal);
      setNotifications(data || []);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
        return;
      }
      console.error('Lỗi tải thông báo:', err);
      setError('Không tải được danh sách thông báo.');
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(false);

    // Lắng nghe sự kiện khi có thông báo mới từ OneSignal
    const handleNewPush = () => {
      fetchNotifications(true);
    };

    window.addEventListener('app:new-notification', handleNewPush);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      window.removeEventListener('app:new-notification', handleNewPush);
    };
  }, [fetchNotifications]);

  const filtered = useMemo(() => {
    if (activeTab === 'ALL') return notifications;
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

  const selectedItem = useMemo(
    () => notifications.find(n => n.id === selectedId) || null,
    [notifications, selectedId]
  );

  const handleItemClick = async (item: NotificationItem) => {
    setSelectedId(item.id);
    if (item.is_read) return;
    try {
      await markMyNotificationAsRead(item.type, item.id);
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
      // 📢 Bắn sự kiện báo Header tải lại số đếm
      window.dispatchEvent(new CustomEvent('app:read-notification'));
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllMyNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      // 📢 Bắn sự kiện báo Header tải lại số đếm
      window.dispatchEvent(new CustomEvent('app:read-notification'));
    } catch (err) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <Header />

      <main className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Bell size={22} className="text-orange-500" />
              Thông báo
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Bạn đã xem hết thông báo'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              <CheckCheck size={16} />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-orange-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-orange-500">
                <Loader2 className="animate-spin" size={32} />
                <span className="font-medium">Đang tải thông báo...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
                <CalendarClock size={40} />
                <p className="font-medium">Không có thông báo nào.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-[75vh] overflow-y-auto">
                {filtered.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`flex gap-3 p-4 sm:p-5 transition-colors cursor-pointer hover:bg-orange-50/60 ${
                      selectedId === item.id
                        ? 'bg-orange-50 border-l-4 border-orange-500'
                        : !item.is_read ? 'bg-orange-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="mt-1 shrink-0">{TYPE_ICON[item.type]}</div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{item.title}</h3>
                        {!item.is_read && (
                          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" title="Chưa đọc" />
                        )}
                      </div>

                      <p className="text-sm text-gray-600 truncate">{item.body}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_BADGE[item.type]}`}>
                          {TYPE_LABEL[item.type]}
                        </span>
                        <span className="text-xs text-gray-400">{formatRelativeTime(item.created_at)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[300px] lg:min-h-[75vh]">
            {!selectedItem ? (
              <div className="flex flex-col items-center justify-center h-full py-20 gap-2 text-gray-300">
                <Bell size={48} />
                <p className="font-medium text-gray-400">Chọn 1 thông báo để xem chi tiết</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${TYPE_BADGE[selectedItem.type]}`}>
                      {TYPE_ICON[selectedItem.type]}
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_BADGE[selectedItem.type]}`}>
                        {TYPE_LABEL[selectedItem.type]}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-gray-400 hover:text-gray-600 p-1 lg:hidden"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-slate-800 mb-2">{selectedItem.title}</h2>

                <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
                  <Clock size={14} />
                  {formatFullTime(selectedItem.created_at)}
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                    {selectedItem.body}
                  </p>

                  {selectedItem.note && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-400 font-medium mb-1">Ghi chú</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                        {selectedItem.note}
                      </p>
                    </div>
                  )}

                  {selectedItem.type === 'ATTENDANCE' && selectedItem.session_id && (
                    <div className="mt-4 text-xs text-gray-400">
                      Mã buổi học: {selectedItem.session_id}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}