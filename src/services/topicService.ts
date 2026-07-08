import type { TopicWithLessons, Lesson, LessonType } from "../types/topic";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api").replace(/\/$/, "");

type ApiListEnvelope<T> = {
    data?: T;
    documents?: T;
    lessons?: T;
    topics?: T;
    content?: T;
};

function asArray<T>(value: T[] | ApiListEnvelope<T> | unknown): T[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === "object") {
        const envelope = value as ApiListEnvelope<T>;
        return (
            (envelope.topics as T[] | undefined) ??
            (envelope.lessons as T[] | undefined) ??
            (envelope.documents as T[] | undefined) ??
            (envelope.content as T[] | undefined) ??
            (envelope.data as T[] | undefined) ??
            []
        );
    }

    return [];
}

async function fetchJson<T>(urls: string[]): Promise<T> {
    let lastError: unknown;

    for (const url of urls) {
        try {
            const response = await fetch(url, {
                headers: { Accept: "application/json" },
            });

            if (!response.ok) {
                lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
                continue;
            }

            return (await response.json()) as T;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError instanceof Error ? lastError : new Error("Failed to fetch API data");
}

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

function normalizeTopic(raw: unknown, index: number): TopicWithLessons {
    const topic = raw as Partial<TopicWithLessons> & Record<string, unknown>;
    const rawLessons = asArray<Lesson>((topic.lessons ?? topic.items ?? topic.children) as unknown);

    return {
        id: topic.id ? String(topic.id) : undefined,
        topicId: topic.topicId ? String(topic.topicId) : (topic.id ? String(topic.id) : undefined),
        topicName: String(topic.topicName ?? topic.name ?? topic.title ?? `Topic ${index + 1}`),
        lessons: rawLessons.map((lesson, lessonIndex) => normalizeLesson(lesson, lessonIndex)),
    };
}



/**
 * Lấy danh sách topics (chương) và lessons (bài học) của một module từ API
 * @param moduleId ID của module
 * @returns Promise<TopicWithLessons[]>
 *
 * API endpoint: GET {API_BASE_URL}/modules/{moduleId}/topics
 * Expected response:
 * [
 *   {
 *     id: string,
 *     topicName: string,
 *     lessons: [
 *       { id: string, lessonName: string, type: "READING" | "LECTURE" | "PRACTICE" },
 *       ...
 *     ]
 *   },
 *   ...
 * ]
 */
export async function getTopicsByModule(moduleId: string): Promise<TopicWithLessons[]> {
    const data = await fetchJson<TopicWithLessons[] | ApiListEnvelope<TopicWithLessons>>([
        `${API_BASE_URL}/topics/module/${moduleId}`,
        `${API_BASE_URL}/modules/${moduleId}/topics`,
        `${API_BASE_URL}/topics?moduleId=${encodeURIComponent(moduleId)}`,
        `${API_BASE_URL}/topics/${moduleId}`,
    ]);

    return asArray<TopicWithLessons>(data).map((topic, index) => normalizeTopic(topic, index));
}
