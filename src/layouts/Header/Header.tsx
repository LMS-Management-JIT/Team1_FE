import { Bell, Menu, Trophy, MessageCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { getStudentCourses } from "../../services/dashboardService";
import logo from "../../assets/codegym_logo.jpg";

// Dùng chung 1 học viên demo — đồng bộ với STUDENT_ID trong DashboardUserPage.tsx
const STUDENT_ID = "enoEBcYAuvnZNoXv0u8v";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [homeCourseId, setHomeCourseId] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        getStudentCourses(STUDENT_ID)
            .then((courses) => {
                if (courses.length > 0) setHomeCourseId(courses[0].id);
            })
            .catch(() => setHomeCourseId(null));
    }, []);

    // "Khóa học" cần courseId đúng trang Modules (Ưu tiên lấy khóa học đầu tiên)
    const coursesHref = homeCourseId ? `/courses/${homeCourseId}/modules` : "/";

    // Đã loại bỏ "Bảng Xếp Hạng" ra khỏi menu chữ ở giữa
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
        <header className="relative bg-[#ff6b13] px-4 text-white sm:px-6 lg:px-8">
            <div className="flex h-14 items-center gap-4 lg:gap-12">
                <Link to="/" className="flex shrink-0 items-center gap-3 font-bold">
                    <img src={logo} alt="CodeGym" className="h-9 w-9 rounded-md object-contain" />
                    <span className="hidden sm:inline">Codegym</span>
                </Link>

                {/* Nav ẩn trên mobile/tablet, hiện từ lg trở lên */}
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
                    {/* Ô tìm kiếm */}
                    <div className="hidden h-8 w-[160px] items-center gap-2 rounded-full bg-white/20 px-3 md:flex lg:w-[220px]">
                        <Search size={15} />
                        <input
                            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/80"
                            placeholder="Tìm khóa học, bài viết..."
                        />
                    </div>

                    {/* Bảng Xếp Hạng (Sáng lên như hover khi đang ở trang này) */}
                    <Link
                        to="/rank"
                        className={clsx(
                            "hidden h-8 w-8 place-items-center rounded-full transition sm:grid",
                            location.pathname.startsWith("/rank") 
                                ? "bg-white/40" // Sáng lên giống khi được select
                                : "bg-white/20 hover:bg-white/40"
                        )}
                        title="Bảng Xếp Hạng"
                    >
                        <Trophy size={16} />
                    </Link>

                    {/* Tin nhắn */}
                    <button className="relative hidden h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30 sm:grid">
                        <MessageCircle size={16} />
                        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px]">
                            3
                        </span>
                    </button>

                    {/* Thông báo */}
                    <button className="relative hidden h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30 sm:grid">
                        <Bell size={16} />
                        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px]">
                            5
                        </span>
                    </button>

                    {/* Avatar */}
                    <button className="h-8 w-8 shrink-0 rounded-full bg-orange-100 text-sm font-bold text-[#ff6b13]">
                        HV
                    </button>

                    {/* Nút menu toggle mobile */}
                    <button
                        className="grid h-8 w-8 place-items-center rounded-full bg-white/20 lg:hidden"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                    >
                        <Menu size={16} />
                    </button>
                </div>
            </div>

            {/* Menu thả xuống trên mobile/tablet */}
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
                    {/* Bổ sung link Rank cho Mobile menu */}
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
                    
                    <div className="mt-1 flex h-8 items-center gap-2 rounded-full bg-white/20 px-3 md:hidden">
                        <Search size={15} />
                        <input
                            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/80"
                            placeholder="Tìm khóa học, bài viết..."
                        />
                    </div>
                </nav>
            )}
        </header>
    );
}