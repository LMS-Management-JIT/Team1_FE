import {apiClient} from "./axiosClient";
import type {Lesson} from "../types/lesson.ts";

export async function getLessonById(lessonId: string): Promise<Lesson> {
    const {data} = await apiClient.get<Lesson>(`/lessons/${lessonId}`);
    return data;
}