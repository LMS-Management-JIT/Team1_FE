import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
    getStudentCourses,
    getStudentTeachers,
} from "../services/dashboardService";
import { getModulesByCourseId } from "../services/moduleService";
import { getTopicsByModule, getLessonsByTopic } from "../services/topicLessonService";
import { normalizeSearchText } from "../utils/normalizeSearchText";
import type { DashboardCourse, DashboardTeacher } from "../types/dashboard";
import type { ModuleResponse } from "../types/module";
import type { TopicSummary } from "../types/topicLesson";
import type { LessonSummary } from "../types/lesson";

export type SearchResultType = "course" | "module" | "topic" | "lesson" | "teacher";

export interface SearchResultItem {
    type: SearchResultType;
    id: string;
    title: string;
    subtitle?: string;
    courseId?: string;
    moduleId?: string;
    topicId?: string;
    normalizedTitle: string;
    teacher?: DashboardTeacher;
}

interface ModuleWithCourse {
    module: ModuleResponse;
    courseId: string;
}

interface TopicWithModule {
    topic: TopicSummary;
    moduleId: string;
    courseId: string;
}

/**
 * Dựng chỉ mục tìm kiếm CHỈ trong phạm vi dữ liệu của học viên đang đăng nhập:
 * - Khóa học của học viên (getStudentCourses)
 * - Giáo viên dạy học viên đó (getStudentTeachers)
 * - Module thuộc từng khóa học -> topic thuộc module -> lesson thuộc topic
 */
export function useGlobalSearchIndex(
    studentId: string | null | undefined,
    enabled: boolean
): { index: SearchResultItem[]; isLoading: boolean } {
    const isReady = enabled && Boolean(studentId);

    // 1. Khóa học của học viên
    const coursesQuery = useQuery({
        queryKey: ["search", "courses", studentId],
        queryFn: () => getStudentCourses(studentId as string),
        enabled: isReady,
        staleTime: 5 * 60 * 1000,
    });

    const courses: DashboardCourse[] = coursesQuery.data ?? [];

    // 2. Giáo viên của học viên (độc lập với cây course->module->topic->lesson)
    const teachersQuery = useQuery({
        queryKey: ["search", "teachers", studentId],
        queryFn: () => getStudentTeachers(studentId as string),
        enabled: isReady,
        staleTime: 5 * 60 * 1000,
    });

    const teachers: DashboardTeacher[] = teachersQuery.data ?? [];

    // 3. Module thuộc từng khóa học của học viên
    const modulesQueries = useQueries({
        queries: courses.map((c) => ({
            queryKey: ["search", "modules", c.id],
            queryFn: () => getModulesByCourseId(c.id),
            enabled: isReady && coursesQuery.isSuccess && Boolean(c.id),
            staleTime: 5 * 60 * 1000,
        })),
    });

    const modulesQueriesKey = modulesQueries.map((q) => q.dataUpdatedAt).join(",");

    const modulesFlat: ModuleWithCourse[] = useMemo(() => {
        const result: ModuleWithCourse[] = [];
        courses.forEach((c, idx) => {
            const modules = (modulesQueries[idx]?.data ?? []) as ModuleResponse[];
            modules.forEach((m) => result.push({ module: m, courseId: c.id }));
        });
        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courses, modulesQueriesKey]);

    // 4. Topic thuộc từng module đã lọc ở trên
    const topicsQueries = useQueries({
        queries: modulesFlat.map(({ module }) => ({
            queryKey: ["search", "topics", module.id],
            queryFn: () => getTopicsByModule(module.id),
            enabled: isReady && Boolean(module.id),
            staleTime: 5 * 60 * 1000,
        })),
    });

    const topicsQueriesKey = topicsQueries.map((q) => q.dataUpdatedAt).join(",");

    const topicsFlat: TopicWithModule[] = useMemo(() => {
        const result: TopicWithModule[] = [];
        modulesFlat.forEach(({ module, courseId }, idx) => {
            const topics = (topicsQueries[idx]?.data ?? []) as TopicSummary[];
            topics.forEach((t) => result.push({ topic: t, moduleId: module.id, courseId }));
        });
        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modulesFlat, topicsQueriesKey]);

    // 5. Lesson thuộc từng topic đã lọc ở trên
    const lessonsQueries = useQueries({
        queries: topicsFlat.map(({ topic }) => ({
            queryKey: ["search", "lessons", topic.id],
            queryFn: () => getLessonsByTopic(topic.id as string),
            enabled: isReady && Boolean(topic.id),
            staleTime: 5 * 60 * 1000,
        })),
    });

    const lessonsQueriesKey = lessonsQueries.map((q) => q.dataUpdatedAt).join(",");

    const isLoading =
        isReady &&
        (coursesQuery.isLoading ||
            teachersQuery.isLoading ||
            modulesQueries.some((q) => q.isLoading) ||
            topicsQueries.some((q) => q.isLoading) ||
            lessonsQueries.some((q) => q.isLoading));

    const index: SearchResultItem[] = useMemo(() => {
        const items: SearchResultItem[] = [];

        // Khóa học
        courses.forEach((c) => {
            items.push({
                type: "course",
                id: c.id,
                title: c.courseName,
                subtitle: c.description,
                courseId: c.id,
                normalizedTitle: normalizeSearchText(c.courseName),
            });
        });

        teachers.forEach((t) => {
            items.push({
                type: "teacher",
                id: t.accountId ?? t.id,
                title: t.fullName,
                subtitle: t.specialization || t.phoneNumber,
                normalizedTitle: normalizeSearchText(t.fullName),
                teacher: t,
            });
        });

        // Module
        modulesFlat.forEach(({ module, courseId }) => {
            items.push({
                type: "module",
                id: module.id,
                title: module.moduleName,
                subtitle: module.moduleCode,
                courseId,
                moduleId: module.id,
                normalizedTitle: normalizeSearchText(module.moduleName),
            });
        });

        // Topic
        topicsFlat.forEach(({ topic, moduleId, courseId }, idx) => {
            const topicId = topic.id;
            if (!topicId) return;

            items.push({
                type: "topic",
                id: topicId,
                title: topic.topicName,
                courseId,
                moduleId,
                topicId,
                normalizedTitle: normalizeSearchText(topic.topicName),
            });

            // Lesson
            const lessons = (lessonsQueries[idx]?.data ?? []) as LessonSummary[];
            lessons.forEach((lesson) => {
                items.push({
                    type: "lesson",
                    id: lesson.id,
                    title: lesson.lessonName,
                    subtitle: topic.topicName,
                    courseId,
                    moduleId,
                    topicId,
                    normalizedTitle: normalizeSearchText(lesson.lessonName),
                });
            });
        });

        return items;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courses, teachers, modulesFlat, topicsFlat, lessonsQueriesKey]);

    return { index, isLoading };
}

export function filterSearchIndex(
    index: SearchResultItem[],
    query: string,
    limit: number = 8
): SearchResultItem[] {
    const q = normalizeSearchText(query);
    if (!q) return [];

    return index
        .map((item) => ({ item, pos: item.normalizedTitle.indexOf(q) }))
        .filter((entry) => entry.pos !== -1)
        .sort((a, b) => a.pos - b.pos)
        .slice(0, limit)
        .map((entry) => entry.item);
}