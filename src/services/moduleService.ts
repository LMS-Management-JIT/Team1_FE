import {apiClient} from "./apiClient";
import type {ModuleResponse} from "../types/module";

// Hàm 1: Lấy tất cả modules
export async function getAllModules(): Promise<ModuleResponse[]> {
    const {data} = await apiClient.get<ModuleResponse[]>("/modules");
    return data;
}

// Hàm 2: Lấy modules theo courseId
export async function getModulesByCourseId(courseId: string): Promise<ModuleResponse[]> {
    const {data} = await apiClient.get<ModuleResponse[]>(
        `/course-modules/courses/${courseId}/modules`
    );
    return data;
}

// Hàm 3: Lấy 1 module theo ID
export async function getModuleById(moduleId: string): Promise<ModuleResponse> {
    const {data} = await apiClient.get<ModuleResponse>(
        `/modules/${moduleId}`
    );
    return data;
}