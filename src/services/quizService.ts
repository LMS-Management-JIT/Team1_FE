import { apiClient } from "./apiClient";
import type {
    QuizAnswerItem,
    QuizQuestionPublic,
    QuizSubmissionResult,
} from "../types/quiz";

export async function getQuizQuestions(lessonId: string): Promise<QuizQuestionPublic[]> {
    const { data } = await apiClient.get<QuizQuestionPublic[]>(
        `/quiz-questions/lesson/${lessonId}`
    );
    return data;
}

export async function submitQuiz(
    studentId: string,
    lessonId: string,
    answers: QuizAnswerItem[]
): Promise<QuizSubmissionResult> {
    const { data } = await apiClient.post<QuizSubmissionResult>(
        "/quiz-questions/submit",
        { studentId, lessonId, answers }
    );
    return data;
}