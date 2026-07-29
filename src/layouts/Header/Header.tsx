import { Menu, X, Trophy, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import OneSignal from 'react-onesignal';
import { getStudentCourses } from "../../services/dashboardService";
import { useAuth } from "../../services/authService";
import logo from "../../assets/codegym_logo.jpg";
import { useAuthContext } from "../../feature/auth/context/AuthContext.tsx";
import { GlobalSearchBox } from "../../components/search/GlobalSearchBox";
import { useChatContext } from "../../feature/chat/context/ChatContext";
import { NotificationBell } from "../../components/notification/NotificationBell";
import { ProfileMenu } from "../../components/profile/ProfileMenu";
// >>> ĐỔI — dùng số đếm hợp nhất (gộp cả nguồn "account" và "student") thay vì
// tự fetch getMyNotifications() riêng ở Header như bản cũ, để 3 nơi hiển thị số
// chưa đọc (icon chuông, badge menu mobile, badge OneSignal) luôn khớp nhau.
import { useUnifiedUnreadCount } from "../../hooks/useNotifications";

export function Header() {
    const { user, studentId } = useAuthContext();
    const { openChat, unreadCount: unreadChatCount } = useChatContext();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [homeCourseId, setHomeCourseId] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { logout, isLoggingOut } = useAuth();

    const accountId = user?.uid || (user as any)?.id || null;

    // >>> ĐỔI — nguồn sự thật DUY NHẤT cho số thông báo chưa đọc, gộp cả:
    // - account: SYSTEM/CLASS/ATTENDANCE (getMyNotifications)
    // - student: XP_EARNED/RANK_UP/AI_QUOTA_RESET/... (getNotificationsByStudent)
    const unreadCount = useUnifiedUnreadCount(accountId ?? undefined, studentId ?? undefined);

    useEffect(() => {
        if (!studentId) return;
        getStudentCourses(studentId)
            .then((courses) => {
                if (courses.length > 0) setHomeCourseId(courses[0].id);
            })
            .catch(() => setHomeCourseId(null));
    }, [studentId]);

    // >>> THÊM MỚI — đồng bộ badge count lên OneSignal (icon app khi cài PWA/mobile)
    // mỗi khi unreadCount hợp nhất thay đổi. Trước đây chỉ đồng bộ theo unreadCount
    // của riêng nguồn "account" (do tự fetch getMyNotifications trong Header), nên
    // badge trên icon app bị THIẾU phần thông báo XP/Rank/AI Quota của nguồn "student".
    useEffect(() => {
        const os = OneSignal as any;
        if (os?.initialized && typeof os?.Notifications?.setBadgeCount === "function") {
            os.Notifications.setBadgeCount(unreadCount).catch(() => {});
        }
    }, [unreadCount]);

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

                    {/*
                        >>> XOÁ — icon chuông thứ 2 (Link to="/notifications" với Bell + badge riêng)
                        đã bị gộp vào NotificationBell bên dưới. Trước đây 2 icon này đọc 2 nguồn
                        khác nhau (icon này chỉ đọc "account", NotificationBell chỉ đọc "student"),
                        khiến người dùng thấy 2 số chưa đọc khác nhau ở cùng 1 header — giờ chỉ còn
                        1 điểm vào duy nhất, đọc số đã gộp. Lối vào trang /notifications đầy đủ được
                        chuyển vào nút "Xem tất cả thông báo" bên trong dropdown của NotificationBell.
                    */}
                    <NotificationBell studentId={studentId} accountId={accountId} />

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