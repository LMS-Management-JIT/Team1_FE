import { useMutation } from "@tanstack/react-query";
import { saveCourseProgress, type CourseProgressPayload } from "../services/courseProgressService";

export function useSaveCourseProgress() {
    return useMutation({
        mutationFn: (payload: CourseProgressPayload) => saveCourseProgress(payload),
        onSuccess: () => {
            console.log("Đã đồng bộ tiến độ khóa học lên Firebase!");
        },
        onError: (error) => {
            console.error("Lỗi khi lưu tiến độ khóa học:", error);
        }
    });
}