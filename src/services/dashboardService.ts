import type {
    DashboardCourse,
    DashboardCourseProgress,
    DashboardTeacher,
} from "../types/dashboard";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api").replace(/\/$/, "");
const DASHBOARD_API_URL = `${API_BASE_URL}/dashboard`;

async function request<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Không thể tải dữ liệu dashboard");
    }

    return response.json() as Promise<T>;
}

export function getStudentCourses(studentId: string) {
    return request<DashboardCourse[]>(
        `${DASHBOARD_API_URL}/students/${studentId}/courses`,
    );
}

export function getStudentCourseProgress(studentId: string) {
    return request<DashboardCourseProgress[]>(
        `${DASHBOARD_API_URL}/students/${studentId}/course-progress`,
    );
}

export function getStudentTeachers(studentId: string) {
    return request<DashboardTeacher[]>(
        `${DASHBOARD_API_URL}/students/${studentId}/teachers`,
    );
}