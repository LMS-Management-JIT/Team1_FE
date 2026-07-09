import {Bell, Flag, Menu, Search} from "lucide-react";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {getStudentCourses} from "../../services/dashboardService";
import type {DashboardCourse} from "../../types/dashboard";

const STUDENT_ID = "F6nosEpzCBMUBZeAyHCM"; // TODO: dùng chung 1 nguồn với DashboardUserPage khi có auth thật

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [courses, setCourses] = useState<DashboardCourse[]>([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        getStudentCourses(STUDENT_ID)
            .then(setCourses)
            .catch(() => setCourses([]));
    }, []);

    const isHome = location.pathname === "/";
    const isCoursePage = location.pathname.startsWith("/courses") || location.pathname.startsWith("/topics");
    const isContactPage = location.pathname.startsWith("/contact-teacher");

    const goToHome = () => navigate("/");

    const goToRandomCourse = () => {
        if (courses.length === 0) {
            navigate("/");
            return;
        }
        const randomCourse = courses[Math.floor(Math.random() * courses.length)];
        navigate(`/courses/${randomCourse.id}/modules`);
    };

    const goToContactTeacher = () => {
        navigate("/contact-teacher");
    };

    const navItemClass = (active: boolean) =>
        `rounded-lg px-4 py-2 text-sm ${active ? "bg-white/20" : "hover:bg-white/20"}`;

    return (
        <header className="relative bg-[#ff6b13] px-4 text-white sm:px-6 lg:px-8">
            <div className="flex h-14 items-center gap-4 lg:gap-12">
                <div className="flex shrink-0 items-center gap-3 font-bold">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-[#1f3f95] font-extrabold">
                        L
                    </div>
                    <span className="hidden sm:inline">codegym</span>
                </div>

                {/* Nav — ẩn trên mobile/tablet, hiện từ lg trở lên */}
                <nav className="hidden items-center gap-4 lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2">
                    <button type="button" onClick={goToHome} className={navItemClass(isHome)}>
                        Trang chủ
                    </button>
                    <button type="button" onClick={goToRandomCourse} className={navItemClass(isCoursePage)}>
                        Khóa học
                    </button>
                    <button type="button" onClick={goToContactTeacher} className={navItemClass(isContactPage)}>
                        Liên hệ
                    </button>
                </nav>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    {/* Ô tìm kiếm — ẩn trên mobile, hiện từ md trở lên */}
                    <div
                        className="hidden h-8 w-[160px] items-center gap-2 rounded-full bg-white/20 px-3 md:flex lg:w-[220px]">
                        <Search size={15}/>
                        <input
                            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/80"
                            placeholder="Tìm khóa học, bài viết..."
                        />
                    </div>

                    <button className="relative hidden h-8 w-8 place-items-center rounded-full bg-white/20 sm:grid">
                        <Flag size={15}/>
                        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px]">
                            3
                        </span>
                    </button>

                    <button className="relative hidden h-8 w-8 place-items-center rounded-full bg-white/20 sm:grid">
                        <Bell size={15}/>
                        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px]">
                            5
                        </span>
                    </button>

                    <button className="h-8 w-8 shrink-0 rounded-full bg-orange-100 text-sm font-bold text-[#ff6b13]">
                        HV
                    </button>

                    {/* Nút menu — chỉ hiện dưới lg */}
                    <button
                        className="grid h-8 w-8 place-items-center rounded-full bg-white/20 lg:hidden"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                    >
                        <Menu size={16}/>
                    </button>
                </div>
            </div>

            {/* Menu sổ xuống trên mobile/tablet */}
            {mobileMenuOpen && (
                <nav className="flex flex-col gap-1 border-t border-white/20 pb-3 pt-2 lg:hidden">
                    <button type="button" onClick={goToHome} className={`text-left ${navItemClass(isHome)}`}>
                        Trang chủ
                    </button>
                    <button type="button" onClick={goToRandomCourse} className={`text-left ${navItemClass(isCoursePage)}`}>
                        Khóa học
                    </button>
                    <button type="button" onClick={goToContactTeacher} className={`text-left ${navItemClass(isContactPage)}`}>
                        Liên hệ
                    </button>
                    <div className="mt-1 flex h-8 items-center gap-2 rounded-full bg-white/20 px-3 md:hidden">
                        <Search size={15}/>
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