import type {
    DashboardCourse,
    DashboardCourseProgress,
    DashboardTeacher,
} from "../types/dashboard";

import { getAuthConfig } from './authService';
import axios from "axios";

export type DashboardResponse = {
    courses: DashboardCourse[];                   // Danh sách khóa học để chạy Carousel
    progresses: DashboardCourseProgress[];        // Mảng dữ liệu tiến độ học tập
    teachers: DashboardTeacher[];
}

// 💡 TẠO INSTANCE AXIOS CHUNG TRỎ THẲNG ĐẾN ĐƯỜNG DẪN GỐC CỦA DASHBOARD
const dashboardClient = axios.create({
    baseURL: 'http://localhost:8080/api/dashboard', // Đã chuyển hẳn sang cụm /api/dashboard
    timeout: 8000,
});

// 💡 INTERCEPTOR TỰ ĐỘNG ĐÍNH KÈM Bearer Token VÀO HEADER CHO MỌI REQUEST
dashboardClient.interceptors.request.use((config) => {
    const authConfig = getAuthConfig();
    if (authConfig.headers) {
        config.headers = {
            ...config.headers,
            ...authConfig.headers,
        } as any;
    }
    return config;
});

// --- CÁC PHƯƠNG THỨC GỌI API ĐỒNG BỘ TOKEN (DÙNG AXIOS & BỎ DẤU '/' Ở ĐẦU ĐỂ GHÉP LINK CHUẨN) ---

export async function getStudentCourses(studentId: string): Promise<DashboardCourse[]> {
    // URL đầy đủ sẽ là: http://localhost:8080/api/dashboard/students/{studentId}/courses
    const response = await dashboardClient.get<DashboardCourse[]>(
        `students/${studentId}/courses`
    );
    return response.data;
}

export async function getStudentCourseProgress(studentId: string): Promise<DashboardCourseProgress[]> {
    // URL đầy đủ sẽ là: http://localhost:8080/api/dashboard/students/{studentId}/course-progress
    const response = await dashboardClient.get<DashboardCourseProgress[]>(
        `students/${studentId}/course-progress`
    );
    return response.data;
}

export async function getStudentTeachers(studentId: string): Promise<DashboardTeacher[]> {
    // URL đầy đủ sẽ là: http://localhost:8080/api/dashboard/students/{studentId}/teachers
    const response = await dashboardClient.get<DashboardTeacher[]>(
        `students/${studentId}/teachers`
    );
    return response.data;
}

export async function getAllTeachers(): Promise<DashboardTeacher[]> {
    // URL đầy đủ sẽ là: http://localhost:8080/api/dashboard/teachers
    const response = await dashboardClient.get<DashboardTeacher[]>(
        `teachers`
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