import { Bell, Menu, X, LogOut, Trophy, MessageCircle } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import OneSignal from 'react-onesignal';
import { getStudentCourses } from "../../services/dashboardService";
import { useAuth } from "../../services/authService";
import { getMyNotifications } from "../../services/notificationService";
import logo from "../../assets/codegym_logo.jpg";
import { useAuthContext } from "../../feature/auth/context/AuthContext.tsx";
import { GlobalSearchBox } from "../../components/search/GlobalSearchBox";
import { useChatContext } from "../../feature/chat/context/ChatContext";
import { NotificationBell } from "../../components/notification/NotificationBell";
import { ProfileMenu } from "../../components/profile/ProfileMenu";

export function Header() {
    const { user, studentId } = useAuthContext();
    const { openChat, unreadCount: unreadChatCount } = useChatContext();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [homeCourseId, setHomeCourseId] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();
    const { logout, isLoggingOut } = useAuth();

    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!studentId) return;
        getStudentCourses(studentId)
            .then((courses) => {
                if (courses.length > 0) setHomeCourseId(courses[0].id);
            })
            .catch(() => setHomeCourseId(null));
    }, [studentId]);

    const fetchUnreadCount = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        try {
            const data = await getMyNotifications(undefined, abortRef.current.signal);
            const count = data.filter(n => !n.is_read).length;
            setUnreadCount(count);

            if (OneSignal.initialized && OneSignal.Notifications.setBadgeCount) {
                OneSignal.Notifications.setBadgeCount(count).catch(() => {});
            }
        } catch (err: any) {
            if (err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;
            console.error("Lỗi tải số thông báo chưa đọc:", err);
        }
    }, []);

    useEffect(() => {
        const userId = user?.uid || (user as any)?.id;
        if (!userId) return;

        fetchUnreadCount();

        const handleReloadUnread = () => fetchUnreadCount();

        // 🔔 Lắng nghe cả event từ OneSignal lẫn event khi user đọc thông báo ở NotificationsPage
        window.addEventListener('app:new-notification', handleReloadUnread);
        window.addEventListener('app:read-notification', handleReloadUnread);

        return () => {
            if (abortRef.current) abortRef.current.abort();
            window.removeEventListener('app:new-notification', handleReloadUnread);
            window.removeEventListener('app:read-notification', handleReloadUnread);
        };
    }, [user?.uid, fetchUnreadCount]);

    const handleLogout = () => {
        logout(undefined, {
            onSettled: () => {
                setMobileMenuOpen(false);
                navigate('/login', { replace: true });
            }
        });
    };

    const coursesHref = homeCourseId ? `/courses/${homeCourseId}/modules` : "/";

    const navItems = [
        { label: "Trang chủ", to: "/", isActive: location.pathname === "/" },
        {
            label: "Khóa học",
            to: coursesHref,
            isActive: location.pathname.startsWith("/courses") || location.pathname.startsWith("/topics"),
        },
        { label: "Liên hệ", to: "/", isActive: false },
    ];

    return (
        <header className="relative z-[9999] bg-[#ff6b13] px-4 text-white sm:px-6 lg:px-8 z-30">
            <div className="flex h-14 items-center gap-4 lg:gap-12">
                <Link to="/" className="flex shrink-0 items-center gap-3 font-bold">
                    <img src={logo} alt="CodeGym" className="h-9 w-9 rounded-md object-contain" />
                    <span className="hidden sm:inline">Codegym</span>
                </Link>

                <nav className="hidden items-center gap-4 lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            className={clsx(
                                "rounded-lg px-4 py-2 text-sm transition-colors",
                                item.isActive ? "bg-white/20" : "hover:bg-white/20"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <GlobalSearchBox className="hidden w-[160px] md:block lg:w-[220px]" />

                    <Link
                        to="/rank"
                        className={clsx(
                            "hidden h-8 w-8 place-items-center rounded-full transition sm:grid",
                            location.pathname.startsWith("/rank")
                                ? "bg-white/40"
                                : "bg-white/20 hover:bg-white/40"
                        )}
                        title="Bảng Xếp Hạng"
                    >
                        <Trophy size={16} />
                    </Link>

                    <button
                        onClick={() => openChat()}
                        title="Tin nhắn"
                        className="relative hidden h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30 sm:grid"
                    >
                        <MessageCircle size={16} />
                        {unreadChatCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                {unreadChatCount > 9 ? '9+' : unreadChatCount}
                            </span>
                        )}
                    </button>
                    <Link
                        to="/notifications"
                        className={clsx(
                            "relative hidden h-8 w-8 place-items-center rounded-full transition sm:grid",
                            location.pathname.startsWith("/notifications")
                                ? "bg-white/40"
                                : "bg-white/20 hover:bg-white/40"
                        )}
                        title="Thông báo"
                    >
                        <Bell size={16} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>
                    <NotificationBell studentId={studentId} />

                    <ProfileMenu user={user} isLoggingOut={isLoggingOut} onLogout={handleLogout} />

                    <button
                        className="grid h-8 w-8 place-items-center rounded-full bg-white/20 lg:hidden"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                    >
                        {mobileMenuOpen ? <X size={16}/> : <Menu size={16}/>}
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <nav className="flex flex-col gap-1 border-t border-white/20 pb-3 pt-2 lg:hidden">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className={clsx(
                                "rounded-lg px-4 py-2 text-sm transition-colors",
                                item.isActive ? "bg-white/20" : "hover:bg-white/20"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link
                        to="/rank"
                        onClick={() => setMobileMenuOpen(false)}
                        className={clsx(
                            "rounded-lg px-4 py-2 text-sm transition-colors",
                            location.pathname.startsWith("/rank") ? "bg-white/20" : "hover:bg-white/20"
                        )}
                    >
                        Bảng xếp hạng
                    </Link>

                    <Link
                        to="/notifications"
                        onClick={() => setMobileMenuOpen(false)}
                        className={clsx(
                            "flex items-center justify-between rounded-lg px-4 py-2 text-sm transition-colors",
                            location.pathname.startsWith("/notifications") ? "bg-white/20" : "hover:bg-white/20"
                        )}
                    >
                        <span>Thông báo</span>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>

                    <GlobalSearchBox
                        className="mt-1 md:hidden"
                        onNavigate={() => setMobileMenuOpen(false)}
                    />
                </nav>
            )}
        </header>
    );
}