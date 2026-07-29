import { apiClient } from "./apiClient";

export interface CourseProgressPayload {
    studentId: string;
    courseId: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
}

export async function saveCourseProgress(payload: CourseProgressPayload): Promise<string> {
    const { data } = await apiClient.post<string>("/course-progress/save", payload);
    return data;
}