import type {
    DashboardCourse,
    DashboardCourseProgress,
    DashboardTeacher,
} from "../types/dashboard";

import { apiClient } from "./apiClient";

export type DashboardResponse = {
    courses: DashboardCourse[];                   // Danh sách khóa học để chạy Carousel
    progresses: DashboardCourseProgress[];        // Mảng dữ liệu tiến độ học tập
    teachers: DashboardTeacher[];
}

// 💡 Dùng chung apiClient (baseURL theo VITE_API_BASE_URL, timeout 30s, tự gắn Bearer token)
// thay vì tạo axios instance riêng với baseURL cứng + timeout 8s dễ gây timeout giả.

export async function getStudentCourses(studentId: string): Promise<DashboardCourse[]> {
    // URL đầy đủ: {VITE_API_BASE_URL}/dashboard/students/{studentId}/courses
    const response = await apiClient.get<DashboardCourse[]>(
        `/dashboard/students/${studentId}/courses`
    );
    return response.data;
}

export async function getStudentCourseProgress(studentId: string): Promise<DashboardCourseProgress[]> {
    // URL đầy đủ: {VITE_API_BASE_URL}/dashboard/students/{studentId}/course-progress
    const response = await apiClient.get<DashboardCourseProgress[]>(
        `/dashboard/students/${studentId}/course-progress`
    );
    return response.data;
}

export async function getStudentTeachers(studentId: string): Promise<DashboardTeacher[]> {
    // URL đầy đủ: {VITE_API_BASE_URL}/dashboard/students/{studentId}/teachers
    const response = await apiClient.get<DashboardTeacher[]>(
        `/dashboard/students/${studentId}/teachers`
    );
    return response.data;
}

export async function getAllTeachers(): Promise<DashboardTeacher[]> {
    // URL đầy đủ: {VITE_API_BASE_URL}/dashboard/teachers
    const response = await apiClient.get<DashboardTeacher[]>(
        `/dashboard/teachers`
    );
    return response.data;
}

export async function getDashboardData(studentId: string): Promise<DashboardResponse> {
    // Sử dụng Promise.all để gọi đồng thời cả 3 API riêng lẻ của học viên, giúp tối ưu tốc độ tải trang
    const [courses, progresses, teachers] = await Promise.all([
        getStudentCourses(studentId),
        getStudentCourseProgress(studentId),
        getStudentTeachers(studentId)
    ]);

    // Gom tất cả lại thành đúng cấu trúc DashboardResponse mà Frontend đang cần hiển thị
    return {
        courses,
        progresses,
        teachers
    };
}