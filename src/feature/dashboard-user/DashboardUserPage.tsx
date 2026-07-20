import { useEffect, useState } from "react";
import { Header } from "../../layouts/Header/Header";
import { useAuth } from "../../services/authService";
import {
    getStudentTeachers,
    getStudentCourseProgress,
    getStudentCourses,
} from "../../services/dashboardService";
import type {
    DashboardCourse,
    DashboardCourseProgress,
    DashboardTeacher,
} from "../../types/dashboard";
import { CourseCarousel } from "./components/CourseCarousel/CourseCarousel";
import { ProgressSection } from "./components/ProgressSection/ProgressSection";
import { TeacherSection } from "./components/TeacherSection/TeacherSection";
import { TeacherProfileModal } from "./components/TeacherProfileModal/TeacherProfileModal";

export default function DashboardUserPage() {
    const {  studentId, isLoading: isAuthLoading } = useAuth();

    const [courses, setCourses] = useState<DashboardCourse[]>([]);
    const [progresses, setProgresses] = useState<DashboardCourseProgress[]>([]);
    const [teachers, setTeachers] = useState<DashboardTeacher[]>([]);

    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [loadingTeachers, setLoadingTeachers] = useState(true);

    const [courseError, setCourseError] = useState("");
    const [progressError, setProgressError] = useState("");
    const [teacherError, setTeacherError] = useState("");

    const [selectedTeacher, setSelectedTeacher] =
        useState<DashboardTeacher | null>(null);

    useEffect(() => {
        const currentStudentId = studentId || localStorage.getItem('studentId');

        // Nếu hoàn toàn không có thông tin ID học viên thì chặn lại không gọi API
        if (!currentStudentId) return;

        setLoadingCourses(true);
        setLoadingProgress(true);
        setLoadingTeachers(true);

        // 1. Lấy danh sách khóa học theo ID Học viên
        getStudentCourses(currentStudentId)
            .then(setCourses)
            .catch(() => setCourseError("Không tải được danh sách khóa học."))
            .finally(() => setLoadingCourses(false));

        // 2. Lấy tiến độ học tập theo ID Học viên
        getStudentCourseProgress(currentStudentId)
            .then(setProgresses)
            .catch(() => setProgressError("Không tải được tiến độ học tập."))
            .finally(() => setLoadingProgress(false));

        // 3. ĐÃ SỬA: Thay đổi từ getAllTeachers() thành getStudentTeachers() theo đúng ID Học viên
        getStudentTeachers(currentStudentId)
            .then(setTeachers)
            .catch(() => setTeacherError("Không tải được thông tin giảng viên."))
            .finally(() => setLoadingTeachers(false));

    }, [studentId]); // Lắng nghe sự thay đổi của studentId để tự động cập nhật lại dữ liệu khi đổi tài khoản

    // Màn hình chờ ngắn bảo vệ dữ liệu khi Context đang xử lý token
    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f3f3f3]">
                <p className="text-gray-500 font-semibold text-lg animate-pulse">
                    Đang đồng bộ dữ liệu học viên...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f3f3]">
            <Header />

            <main className="mx-auto max-w-[1100px] px-6 py-8">
                {/* Lời chào hiển thị cá nhân hóa theo Tên hoặc Email học sinh */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Chào mừng bạn quay trở lại!
                    </h1>
                </div>

                <CourseCarousel
                    courses={courses}
                    loading={loadingCourses}
                    error={courseError}
                />

                <ProgressSection
                    progresses={progresses}
                    loading={loadingProgress}
                    error={progressError}
                />

                <TeacherSection
                    teachers={teachers}
                    loading={loadingTeachers}
                    error={teacherError}
                    onViewProfile={setSelectedTeacher}
                />
            </main>

            <TeacherProfileModal
                teacher={selectedTeacher}
                onClose={() => setSelectedTeacher(null)}
            />
        </div>
    );
}