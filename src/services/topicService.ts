import {apiClient} from "./axiosClient";
import type {TopicSummary, TopicWithLessons} from "../types/topic.ts";
import type {LessonSummary} from "../types/lesson.ts";

export async function getTopicDetail(topicId: string): Promise<TopicWithLessons> {
    const {data} = await apiClient.get<TopicWithLessons>(`/topics/${topicId}`);
    return data;
}

export async function getTopicsByModule(moduleId: string): Promise<TopicSummary[]> {
    const {data} = await apiClient.get<TopicSummary[]>(`/topics/module/${moduleId}`);
    return data;
}

export async function getLessonsByTopic(topicId: string): Promise<LessonSummary[]> {
    const {data} = await apiClient.get<LessonSummary[]>(`/topics/${topicId}/lessons`);
    return data;
}