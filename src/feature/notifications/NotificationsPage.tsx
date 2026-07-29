import { useEffect, useMemo, useState } from 'react';
import { Header } from '../../layouts/Header/Header';
import { useAuth } from '../../services/authService';
import { useAuthContext } from '../auth/context/AuthContext';
import { setupOneSignal } from '../../config/oneSignal';
import {
  useUnifiedNotifications,
  useMarkUnifiedAsRead,
  useMarkAllUnifiedAsRead,
} from '../../hooks/useNotifications';
import type { UnifiedNotification } from '../../types/notification';
import {
  Bell,
  CalendarClock,
  Megaphone,
  ClipboardCheck,
  Loader2,
  CheckCheck,
  X,
  Clock,
  Sparkles,
  Trophy,
  Bot,
  CheckCircle2,
  BookOpen,
  Users,
  type LucideIcon,
} from 'lucide-react';

type TabKey = 'ALL' | 'CLASS' | 'ATTENDANCE' | 'SYSTEM' | 'STUDENT';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'CLASS', label: 'Lớp học' },
  { key: 'ATTENDANCE', label: 'Điểm danh' },
  { key: 'SYSTEM', label: 'Hệ thống' },
  { key: 'STUDENT', label: 'Học tập' },
];

const TYPE_ICON: Record<string, LucideIcon> = {
  // nguồn "account"
  SYSTEM: Bell,
  CLASS: Megaphone,
  ATTENDANCE: ClipboardCheck,
  // nguồn "student"
  XP_EARNED: Sparkles,
  RANK_UP: Trophy,
  SUBMISSION_GRADED: ClipboardCheck,
  CLASS_ADDED: Users,
  LESSON_PUBLISHED: BookOpen,
  LESSON_REMINDER: BookOpen,
  AI_QUOTA_RESET: Bot,
  LESSON_COMPLETED: CheckCircle2,
};

const TYPE_BADGE: Record<string, string> = {
  SYSTEM: 'bg-orange-50 text-orange-600 border-orange-200',
  CLASS: 'bg-blue-50 text-blue-600 border-blue-200',
  ATTENDANCE: 'bg-green-50 text-green-700 border-green-200',
  XP_EARNED: 'bg-amber-50 text-amber-600 border-amber-200',
  RANK_UP: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  SUBMISSION_GRADED: 'bg-green-50 text-green-700 border-green-200',
  CLASS_ADDED: 'bg-blue-50 text-blue-600 border-blue-200',
  LESSON_PUBLISHED: 'bg-sky-50 text-sky-600 border-sky-200',
  LESSON_REMINDER: 'bg-sky-50 text-sky-600 border-sky-200',
  AI_QUOTA_RESET: 'bg-purple-50 text-purple-600 border-purple-200',
  LESSON_COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const TYPE_LABEL: Record<string, string> = {
  SYSTEM: 'Hệ thống',
  CLASS: 'Lớp học',
  ATTENDANCE: 'Điểm danh',
  XP_EARNED: 'Cộng XP',
  RANK_UP: 'Lên hạng',
  SUBMISSION_GRADED: 'Chấm bài',
  CLASS_ADDED: 'Thêm vào lớp',
  LESSON_PUBLISHED: 'Bài học mới',
  LESSON_REMINDER: 'Nhắc học bài',
  AI_QUOTA_RESET: 'Làm mới AI',
  LESSON_COMPLETED: 'Hoàn thành bài',
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
  const { studentId } = useAuthContext();

  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (accountId) {
      setupOneSignal(accountId, oneSignalHash);
    }
  }, [accountId, oneSignalHash]);

  const { data: notifications, isLoading } = useUnifiedNotifications(
      accountId ?? undefined,
      studentId ?? undefined,
      true // trang chi tiết luôn cần tải đầy đủ, không đợi mở dropdown như ở Header
  );

  const { mutate: markOneRead } = useMarkUnifiedAsRead(accountId ?? undefined, studentId ?? undefined);
  const { mutate: markAllRead } = useMarkAllUnifiedAsRead(accountId ?? undefined, studentId ?? undefined);

  const filtered = useMemo(() => {
    if (activeTab === 'ALL') return notifications;
    if (activeTab === 'STUDENT') return notifications.filter((n) => n.source === 'student');
    return notifications.filter((n) => n.source === 'account' && n.rawType === activeTab);
  }, [notifications, activeTab]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const itemKey = (item: UnifiedNotification) => `${item.source}-${item.id}`;

  const selectedItem = useMemo(
      () => notifications.find((n) => itemKey(n) === selectedKey) || null,
      [notifications, selectedKey]
  );

  const handleItemClick = (item: UnifiedNotification) => {
    setSelectedKey(itemKey(item));
    if (item.isRead) return;
    markOneRead(item);
  };

  const handleMarkAllRead = () => {
    markAllRead();
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
            {TABS.map((tab) => (
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
              ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
                    <CalendarClock size={40} />
                    <p className="font-medium">Không có thông báo nào.</p>
                  </div>
              ) : (
                  <ul className="divide-y divide-gray-100 max-h-[75vh] overflow-y-auto">
                    {filtered.map((item) => {
                      const key = itemKey(item);
                      const Icon = TYPE_ICON[item.rawType] ?? Bell;
                      const badgeClass = TYPE_BADGE[item.rawType] ?? 'bg-gray-50 text-gray-600 border-gray-200';
                      const label = TYPE_LABEL[item.rawType] ?? item.rawType;

                      return (
                          <li
                              key={key}
                              onClick={() => handleItemClick(item)}
                              className={`flex gap-3 p-4 sm:p-5 transition-colors cursor-pointer hover:bg-orange-50/60 ${
                                  selectedKey === key
                                      ? 'bg-orange-50 border-l-4 border-orange-500'
                                      : !item.isRead ? 'bg-orange-50/40' : 'bg-white'
                              }`}
                          >
                            <div className="mt-1 shrink-0">
                              <Icon size={18} className="text-gray-500" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-gray-800 truncate">{item.title}</h3>
                                {!item.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" title="Chưa đọc" />
                                )}
                              </div>

                              <p className="text-sm text-gray-600 truncate">{item.message}</p>

                              <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeClass}`}>
                            {label}
                          </span>
                                <span className="text-xs text-gray-400">{formatRelativeTime(item.createdAt)}</span>
                              </div>
                            </div>
                          </li>
                      );
                    })}
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${TYPE_BADGE[selectedItem.rawType] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {(() => {
                            const Icon = TYPE_ICON[selectedItem.rawType] ?? Bell;
                            return <Icon size={18} />;
                          })()}
                        </div>
                        <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_BADGE[selectedItem.rawType] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {TYPE_LABEL[selectedItem.rawType] ?? selectedItem.rawType}
                      </span>
                        </div>
                      </div>

                      <button
                          onClick={() => setSelectedKey(null)}
                          className="text-gray-400 hover:text-gray-600 p-1 lg:hidden"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mb-2">{selectedItem.title}</h2>

                    <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
                      <Clock size={14} />
                      {formatFullTime(selectedItem.createdAt)}
                    </div>

                    <div className="border-t border-gray-100 pt-5">
                      <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                        {selectedItem.message}
                      </p>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </main>
      </div>
  );
}
