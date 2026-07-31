export const ROUTES = {
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    LESSON_DETAIL: "/courses/:courseId/modules/:moduleId/topics/:topicId/lessons/:lessonId",
} as const;

export function buildLessonDetailPath(
    courseId: string,
    moduleId: string,
    topicId: string,
    lessonId: string
) {
    return `/courses/${courseId}/modules/${moduleId}/topics/${topicId}/lessons/${lessonId}`;
}
