import { useEffect, useState } from "react";
import { Header } from "../../layouts/Header/Header";
import {
    getStudentCourses,
    getStudentCourseProgress,
    getStudentTeachers,
} from "../../services/dashboardService";
import type {
    DashboardCourse,
    DashboardCourseProgress,
    DashboardTeacher,
} from "../../types/dashboard";
import { CourseCarousel } from "./components/CourseCarousel/CourseCarousel";
import { ProgressSection } from "./components/ProgressSection/ProgressSection";
import { TeacherSection } from "./components/TeacherSection/TeacherSection";
import "./DashboardUserPage.css";
import { TeacherProfileModal } from "./components/TeacherProfileModal/TeacherProfileModal";

const STUDENT_ID = "CTcfhBa5cqfs8TPITdsD";

export default function DashboardUserPage() {
    const [courses, setCourses] = useState<DashboardCourse[]>([]);
    const [progresses, setProgresses] = useState<DashboardCourseProgress[]>([]);
    const [teachers, setTeachers] = useState<DashboardTeacher[]>([]);

    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [loadingTeachers, setLoadingTeachers] = useState(true);

    const [courseError, setCourseError] = useState("");
    const [progressError, setProgressError] = useState("");
    const [teacherError, setTeacherError] = useState("");

    const [selectedTeacher, setSelectedTeacher] = useState<DashboardTeacher | null>(
        null,
    );

    useEffect(() => {
        getStudentCourses(STUDENT_ID)
            .then(setCourses)
            .catch(() => setCourseError("Không tải được danh sách khóa học."))
            .finally(() => setLoadingCourses(false));

        getStudentCourseProgress(STUDENT_ID)
            .then(setProgresses)
            .catch(() => setProgressError("Không tải được tiến độ học tập."))
            .finally(() => setLoadingProgress(false));

        getStudentTeachers(STUDENT_ID)
            .then(setTeachers)
            .catch(() => setTeacherError("Không tải được thông tin giảng viên."))
            .finally(() => setLoadingTeachers(false));
    }, []);

    return (
        <div className="dashboard-user-page">
            <Header />

            <main className="dashboard-user-main">
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