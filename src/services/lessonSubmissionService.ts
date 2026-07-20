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

export async function submitLessonFile(params: {
    studentId: string;
    studentName: string;
    topicId: string;
    topicName: string;
    lessonId: string;
    lessonName: string;
    file: File;
}): Promise<LessonSubmissionResponse> {
    const { studentId, studentName, topicId, topicName, lessonId, lessonName, file } = params;

    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("studentName", studentName);
    formData.append("topicId", topicId);
    formData.append("topicName", topicName);
    formData.append("lessonId", lessonId);
    formData.append("lessonName", lessonName);
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

export async function deleteSubmission(submissionId: string): Promise<void> {
    await apiClient.delete(`/lesson-submissions/${submissionId}`);
}