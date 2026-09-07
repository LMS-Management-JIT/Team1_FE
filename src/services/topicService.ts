import {apiClient, asArray} from "./apiClient";
import type {Lesson, LessonType, TopicWithLessons} from "../types/topic";

function normalizeLesson(raw: unknown, index: number): Lesson {
    const lesson = raw as Partial<Lesson> & Record<string, unknown>;

    const type = String(
        lesson.type ??
        lesson.lessonType ??
        lesson.lesson_type ??
        "READING"
    ).toUpperCase() as LessonType;

    return {
        id: String(lesson.id ?? lesson.lessonId ?? `lesson-${index}`),
        lessonName: String(
            lesson.lessonName ??
            lesson.name ??
            lesson.title ??
            `Lesson ${index + 1}`
        ),
        type,
        meta:
            typeof lesson.meta === "string"
                ? lesson.meta
                : typeof lesson.description === "string"
                    ? lesson.description
                    : undefined,
    };
}

function normalizeTopic(raw: unknown): TopicWithLessons {
    const topic = raw as Partial<TopicWithLessons> & Record<string, unknown>;

    const rawLessons = asArray<Lesson>(
        topic.lessons ?? topic.items ?? topic.children
    );

    return {
        id: topic.id ? String(topic.id) : undefined,
        topicId: topic.topicId
            ? String(topic.topicId)
            : topic.id
                ? String(topic.id)
                : undefined,
        topicName: String(
            topic.topicName ??
            topic.name ??
            topic.title ??
            "Chương"
        ),
        lessons: rawLessons.map((lesson, index) =>
            normalizeLesson(lesson, index)
        ),
    };
}

export async function getTopicsByModule(
    moduleId: string
): Promise<TopicWithLessons[]> {
    const {data} = await apiClient.get<TopicWithLessons[]>(
        `/topics/module/${moduleId}`
    );

    return asArray<TopicWithLessons>(data).map(normalizeTopic);
}