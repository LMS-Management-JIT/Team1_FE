import type { ModuleResponse } from "../types/module";

const API_BASE_URL = "http://localhost:8080/api";

// Hàm 1: Lấy tất cả modules
export async function getAllModules(): Promise<ModuleResponse[]> {
    const response = await fetch(`${API_BASE_URL}/modules`);
    
    if (!response.ok) {
        throw new Error("Không thể tải danh sách modules từ Backend");
    }
    
    return response.json();
}

// Hàm 2 (THIẾU DÒNG NÀY NÊN BÁO LỖI): Lấy modules theo courseId nối bảng
export async function getModulesByCourseId(courseId: string): Promise<ModuleResponse[]> {
    // Gọi đúng vào API mà chúng ta vừa viết thêm ở Backend
    const response = await fetch(`${API_BASE_URL}/course-modules/courses/${courseId}/modules`);
    
    if (!response.ok) {
        throw new Error("Không thể tải danh sách modules từ Backend");
    }
    
    return response.json();
}