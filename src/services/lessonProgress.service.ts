import {apiClient} from "./axiosClient";
import type {LessonProgress, LessonProgressRequest} from "../types/lessonProgress.types";

export async function getProgressByStudent(studentId: string): Promise<LessonProgress[]> {
    const {data} = await apiClient.get<LessonProgress[]>(
        `/lesson-progress/student/${studentId}`
    );
    return data;
}

// MỚI
export async function getProgressByStudentAndLesson(
    studentId: string,
    lessonId: string
): Promise<LessonProgress | null> {
    const {data} = await apiClient.get<LessonProgress | null>(
        `/lesson-progress/student/${studentId}/lesson/${lessonId}`
    );
    return data;
}

export async function createProgress(
    request: LessonProgressRequest
): Promise<LessonProgress> {
    const {data} = await apiClient.post<LessonProgress>("/lesson-progress", request);
    return data;
}

// MỚI
export async function updateProgress(
    progressId: string,
    request: LessonProgressRequest
): Promise<LessonProgress> {
    const {data} = await apiClient.put<LessonProgress>(
        `/lesson-progress/${progressId}`,
        request
    );
    return data;
}