export const ROUTES = {
    LOGIN: "/login",
    DASHBOARD: "/",
    LESSON_DETAIL: "/topics/:topicId/lessons/:lessonId",
} as const;

export function buildLessonDetailPath(topicId: string, lessonId: string) {
    return `/topics/${topicId}/lessons/${lessonId}`;
}