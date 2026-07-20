import {useMutation, useQuery} from "@tanstack/react-query";
import {getQuizQuestions, submitQuiz} from "../services/quizService";
import type {QuizAnswerItem} from "../types/quiz";

export function useQuizQuestions(lessonId: string | undefined) {
    return useQuery({
        queryKey: ["quiz-questions", lessonId],
        queryFn: () => getQuizQuestions(lessonId as string),
        enabled: Boolean(lessonId),
    });
}

export function useSubmitQuiz(studentId: string, lessonId: string | undefined) {
    return useMutation({
        mutationFn: (answers: QuizAnswerItem[]) =>
            submitQuiz(studentId, lessonId as string, answers),
    });
}