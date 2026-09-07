import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {
    createProgress,
    getProgressByStudent,
    getProgressByStudentAndLesson,
    updateProgress,
} from "../services/lessonProgressService.ts";
import type {LessonProgressRequest} from "../types/lessonProgress.ts";

export function useStudentProgress(studentId: string | undefined) {
    return useQuery({
        queryKey: ["lesson-progress", studentId],
        queryFn: () => getProgressByStudent(studentId as string),
        enabled: Boolean(studentId),
    });
}

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
            console.log("⏳ [MUTATION START] Bắt đầu quá trình lưu tiến độ...");
            const existing = await getProgressByStudentAndLesson(request.studentId, request.lessonId);
            return existing ? updateProgress(existing.id, request) : createProgress(request);
        },
        onSuccess: (data) => {
            console.log("🎉 [MUTATION SUCCESS] Đã lưu tiến độ xong! Dữ liệu trả về:", data);
            toast.success("Đã ghi nhận tiến độ học tập");
            
            // Xóa cache để UI gọi lại API và cập nhật 0/4 thành 1/4
            console.log("🧹 [CACHE INVALIDATE] Đang xóa cache để render lại UI...");
            queryClient.invalidateQueries({queryKey: ["lesson-progress", studentId]});
            queryClient.invalidateQueries({queryKey: ["lesson-progress", studentId, lessonId]});
        },
        onError: (err) => {
            console.error("❌ [MUTATION ERROR] Không thể lưu tiến độ:", err);
            toast.error("Không thể lưu tiến độ, vui lòng thử lại");
        },
    });
}