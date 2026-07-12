import { apiClient } from "./apiClient";

export interface LessonSubmissionResponse {
    id: string;
    studentId: string;
    lessonId: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    downloadUrl: string | null;
    submittedAt: string;
}

// Gửi file thật lên Backend — Backend sẽ tự upload lên Firebase Storage và lưu metadata.
// Dùng FormData (multipart/form-data), KHÔNG phải JSON như các API khác.
export async function submitLessonFile(
    studentId: string,
    lessonId: string,
    file: File
): Promise<LessonSubmissionResponse> {
    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("lessonId", lessonId);
    formData.append("file", file);

    const { data } = await apiClient.post<LessonSubmissionResponse>(
        "/lesson-submissions",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );

    return data;
}

export async function getLatestSubmission(
    studentId: string,
    lessonId: string
): Promise<LessonSubmissionResponse | null> {
    const { data } = await apiClient.get<LessonSubmissionResponse | null>(
        `/lesson-submissions/student/${studentId}/lesson/${lessonId}`
    );
    return data;
}
