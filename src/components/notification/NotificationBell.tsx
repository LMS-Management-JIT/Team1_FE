import { useEffect, useRef, useState } from "react";
import { Bell, Sparkles, Trophy, ClipboardCheck, BookOpen, Users, Bot, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import {
    useMarkAllNotificationsAsRead,
    useMarkNotificationAsRead,
    useNotificationList,
    useUnreadNotificationCount,
} from "../../hooks/useNotifications";
import type { AppNotification, NotificationType } from "../../types/notification";

const typeIcon: Record<NotificationType, LucideIcon> = {
    XP_EARNED: Sparkles,
    RANK_UP: Trophy,
    SUBMISSION_GRADED: ClipboardCheck,
    CLASS_ADDED: Users,
    LESSON_PUBLISHED: BookOpen,
    LESSON_REMINDER: BookOpen,
    AI_QUOTA_RESET: Bot,
    LESSON_COMPLETED: CheckCircle2,
};

function formatTime(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} ngày trước`;
}

interface NotificationBellProps {
    studentId: string | null;
}

export function NotificationBell({ studentId }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: unreadCount = 0 } = useUnreadNotificationCount(studentId ?? undefined);
    const { data: notifications = [], isLoading } = useNotificationList(studentId ?? undefined, isOpen);
    const { mutate: markOneRead } = useMarkNotificationAsRead(studentId ?? undefined);
    const { mutate: markAllRead } = useMarkAllNotificationsAsRead(studentId ?? undefined);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => {
        const nextOpen = !isOpen;
        setIsOpen(nextOpen);
        if (nextOpen && unreadCount > 0) {
            markAllRead();
        }
    };

    const handleItemClick = (item: AppNotification) => {
        if (!item.isRead) markOneRead(item.id);
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={handleToggle}
                className="relative hidden h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30 sm:grid"
            >
                <Bell size={16} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px] leading-tight">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-10 z-50 max-h-96 w-80 overflow-y-auto rounded-xl bg-white py-2 text-gray-700 shadow-2xl ring-1 ring-black/5">
                    <div className="flex items-center justify-between px-4 py-2">
                        <p className="text-sm font-semibold text-[#202020]">Thông báo</p>
                    </div>

                    {isLoading && (
                        <p className="px-4 py-6 text-center text-xs text-gray-400">Đang tải...</p>
                    )}

                    {!isLoading && notifications.length === 0 && (
                        <p className="px-4 py-6 text-center text-xs text-gray-400">
                            Chưa có thông báo nào.
                        </p>
                    )}

                    {notifications.map((item) => {
                        const Icon = typeIcon[item.type] ?? Bell;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleItemClick(item)}
                                className={clsx(
                                    "flex w-full items-start gap-3 px-4 py-2.5 text-left transition hover:bg-orange-50",
                                    !item.isRead && "bg-orange-50/60"
                                )}
                            >
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
                                    <Icon size={15} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-gray-800">
                                        {item.title}
                                    </p>
                                    <p className="line-clamp-2 text-xs text-gray-500">{item.message}</p>
                                    <p className="mt-0.5 text-[10.5px] text-gray-400">
                                        {formatTime(item.createdAt)}
                                    </p>
                                </span>
                                {!item.isRead && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
