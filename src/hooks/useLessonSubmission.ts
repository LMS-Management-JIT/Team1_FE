import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    deleteSubmission,
    getLatestSubmission,
    submitLessonFile,
} from "../services/lessonSubmissionService";

// 1. Hook lấy bài nộp mới nhất của học viên
export function useLessonSubmission(studentId: string | undefined, lessonId: string | undefined) {
    return useQuery({
        queryKey: ["lesson-submission", studentId, lessonId],
        queryFn: () => getLatestSubmission(studentId as string, lessonId as string),
        enabled: Boolean(studentId) && Boolean(lessonId), // Chỉ gọi API khi có đủ ID
    });
}

// 2. Hook nộp file bài tập
export function useSubmitLessonFile(studentId: string | undefined, lessonId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: submitLessonFile,
        onSuccess: () => {
            // Khi nộp thành công, load lại data bài nộp để giao diện cập nhật ngay lập tức
            queryClient.invalidateQueries({ queryKey: ["lesson-submission", studentId, lessonId] });
        },
    });
}

// 3. Hook xoá bài nộp
export function useDeleteLessonSubmission(studentId: string | undefined, lessonId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (submissionId: string) => deleteSubmission(submissionId),
        onSuccess: () => {
            // Khi xoá thành công, load lại data bài nộp để giao diện trả về trạng thái Upload
            queryClient.invalidateQueries({ queryKey: ["lesson-submission", studentId, lessonId] });
        },
    });
}