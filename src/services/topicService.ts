import type { TopicWithLessons, Lesson, LessonType } from "../types/topic";
import { API_BASE_URL, asArray, fetchJson, type ApiListEnvelope } from "./apiClient";

function normalizeLesson(raw: unknown, index: number): Lesson {
    const lesson = raw as Partial<Lesson> & Record<string, unknown>;
    const type = String(lesson.type ?? lesson.lessonType ?? lesson.lesson_type ?? "READING").toUpperCase() as LessonType;

    return {
        id: String(lesson.id ?? lesson.lessonId ?? `lesson-${index}`),
        lessonName: String(lesson.lessonName ?? lesson.name ?? lesson.title ?? `Lesson ${index + 1}`),
        type,
        meta: typeof lesson.meta === "string" ? lesson.meta : typeof lesson.description === "string" ? lesson.description : undefined,
    };
}

function normalizeTopic(raw: unknown): TopicWithLessons {
    const topic = raw as Partial<TopicWithLessons> & Record<string, unknown>;
    const rawLessons = asArray<Lesson>((topic.lessons ?? topic.items ?? topic.children) as unknown);

    return {
        id: topic.id ? String(topic.id) : undefined,
        topicId: topic.topicId ? String(topic.topicId) : (topic.id ? String(topic.id) : undefined),
        topicName: String(topic.topicName ?? topic.name ?? topic.title ?? "Chương"),
        lessons: rawLessons.map((lesson, lessonIndex) => normalizeLesson(lesson, lessonIndex)),
    };
}

export async function getTopicsByModule(moduleId: string): Promise<TopicWithLessons[]> {
    const data = await fetchJson<TopicWithLessons[] | ApiListEnvelope<TopicWithLessons>>([
        `${API_BASE_URL}/topics/module/${moduleId}`,
    ]);

    return asArray<TopicWithLessons>(data).map(normalizeTopic);
}
