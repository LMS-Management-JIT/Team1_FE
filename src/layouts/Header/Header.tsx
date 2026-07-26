import {Menu, X, Trophy, MessageCircle} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { getStudentCourses } from "../../services/dashboardService";
import { useAuth } from "../../services/authService";
import logo from "../../assets/codegym_logo.jpg";
import { useAuthContext } from "../../feature/auth/context/AuthContext.tsx";
import { GlobalSearchBox } from "../../components/search/GlobalSearchBox";
import { useChatContext } from "../../feature/chat/context/ChatContext";
import { NotificationBell } from "../../components/notification/NotificationBell";
import { ProfileMenu } from "../../components/profile/ProfileMenu";

export function Header() {

    const { user, studentId } = useAuthContext();
    const { openChat } = useChatContext();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [homeCourseId, setHomeCourseId] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    const { logout, isLoggingOut } = useAuth();

    useEffect(() => {
        if (!studentId) return;

        getStudentCourses(studentId)
            .then((courses) => {
                if (courses.length > 0) setHomeCourseId(courses[0].id);
            })
            .catch(() => setHomeCourseId(null));
    }, [studentId]);

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
                    {/*   Ô tìm kiếm desktop — thay cho input tĩnh cũ */}
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
                    </button>

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

                    {/*   Ô tìm kiếm mobile — thay cho input tĩnh cũ, đóng menu sau khi chọn kết quả */}
                    <GlobalSearchBox
                        className="mt-1 md:hidden"
                        onNavigate={() => setMobileMenuOpen(false)}
                    />
                </nav>
            )}
        </header>
    );
}