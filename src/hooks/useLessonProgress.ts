import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {
    createProgress,
    getProgressByStudent,
    getProgressByStudentAndLesson,
    updateProgress,
} from "../services/lessonProgress.service";
import type {LessonProgressRequest} from "../types/lessonProgress.types";

export function useStudentProgress(studentId: string | undefined) {
    return useQuery({
        queryKey: ["lesson-progress", studentId],
        queryFn: () => getProgressByStudent(studentId as string),
        enabled: Boolean(studentId),
    });
}

// MỚI: dùng để biết học viên đã có progress cho lesson này chưa
export function useLessonProgressByStudentAndLesson(
    studentId: string | undefined,
    lessonId: string | undefined
) {
    return useQuery({
        queryKey: ["lesson-progress", studentId, lessonId],
        queryFn: () => getProgressByStudentAndLesson(studentId as string, lessonId as string),
        enabled: Boolean(studentId) && Boolean(lessonId),
    });
}

export function useSubmitProgress(studentId: string | undefined, lessonId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: LessonProgressRequest) => {
            const existing = await getProgressByStudentAndLesson(
                request.studentId,
                request.lessonId
            );

            return existing
                ? updateProgress(existing.id, request)
                : createProgress(request);
        },
        onSuccess: () => {
            toast.success("Đã ghi nhận tiến độ học tập");
            queryClient.invalidateQueries({queryKey: ["lesson-progress", studentId]});
            queryClient.invalidateQueries({queryKey: ["lesson-progress", studentId, lessonId]});
        },
        onError: () => toast.error("Không thể lưu tiến độ, vui lòng thử lại"),
    });
}