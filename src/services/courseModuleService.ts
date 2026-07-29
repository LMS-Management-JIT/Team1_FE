import { apiClient } from "./apiClient";
import type { CourseModuleResponse } from "../types/courseModule";

// Dùng để suy ra courseId từ moduleId hiện tại (phục vụ nối breadcrumb đầy đủ
// Khóa học -> Module -> Topic -> Lesson, không phụ thuộc location.state).
export async function getAllCourseModules(): Promise<CourseModuleResponse[]> {
    const { data } = await apiClient.get<CourseModuleResponse[]>("/course-modules");
    return data;
}
