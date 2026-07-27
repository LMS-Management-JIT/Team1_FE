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

import { setupOneSignal } from "../../config/oneSignal";

export default function DashboardUserPage() {
    const { accountId, studentId, oneSignalHash, isLoading: isAuthLoading } = useAuth();

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
        if (accountId) {
            setupOneSignal(accountId, oneSignalHash);
        }
    }, [accountId, oneSignalHash]);

    useEffect(() => {
        const currentStudentId = studentId || localStorage.getItem('studentId');

        if (!currentStudentId) return;

        setLoadingCourses(true);
        setLoadingProgress(true);
        setLoadingTeachers(true);

        getStudentCourses(currentStudentId)
            .then(setCourses)
            .catch(() => setCourseError("Không tải được danh sách khóa học."))
            .finally(() => setLoadingCourses(false));

        getStudentCourseProgress(currentStudentId)
            .then(setProgresses)
            .catch(() => setProgressError("Không tải được tiến độ học tập."))
            .finally(() => setLoadingProgress(false));

        getStudentTeachers(currentStudentId)
            .then(setTeachers)
            .catch(() => setTeacherError("Không tải được thông tin giảng viên."))
            .finally(() => setLoadingTeachers(false));

    }, [studentId]);

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