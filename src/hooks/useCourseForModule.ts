import { useQuery } from "@tanstack/react-query";
import { getAllCourseModules } from "../services/courseModuleService";
import { getStudentCourses } from "../services/dashboardService";

export interface CourseForModule {
    courseId: string;
    courseName: string;
}

/**
 * Suy ra Course (id + tên) chứa module hiện tại, dựa trên bảng quan hệ
 * course-modules + danh sách khóa học của học viên.
 *
 * Không phụ thuộc location.state (mất khi F5 / vào thẳng URL) và không phụ
 * thuộc field topic.courseName (không tồn tại ở backend) như cách làm cũ.
 */
export function useCourseForModule(moduleId: string | undefined, studentId: string | null | undefined) {
    return useQuery({
        queryKey: ["course-for-module", moduleId, studentId],
        queryFn: async (): Promise<CourseForModule | null> => {
            if (!moduleId || !studentId) return null;

            const mappings = await getAllCourseModules();
            const mapping = mappings.find((m) => m.moduleId === moduleId && !m.deleted);
            if (!mapping) return null;

            const courses = await getStudentCourses(studentId);
            const course = courses.find((c) => c.id === mapping.courseId);
            if (!course) return null;

            return { courseId: course.id, courseName: course.courseName };
        },
        enabled: Boolean(moduleId && studentId),
        staleTime: 5 * 60 * 1000,
    });
}
