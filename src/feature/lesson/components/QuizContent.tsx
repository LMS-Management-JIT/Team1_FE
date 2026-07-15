import {useState} from "react";
import {Check, RotateCcw, X} from "lucide-react";
import clsx from "clsx";
import {useQuizQuestions, useSubmitQuiz} from "../../../hooks/useQuiz.ts";
import type {QuizAnswerItem, QuizSubmissionResult} from "../../../types/quiz.ts";
import {Loading} from "../../../components/lesson/ui/Loading.tsx";

interface QuizContentProps {
    lessonId: string;
    studentId: string;
    onSubmitted?: (result: QuizSubmissionResult) => void;
}

export function QuizContent({lessonId, studentId, onSubmitted}: QuizContentProps) {
    const {data: questions, isLoading} = useQuizQuestions(lessonId);
    const {mutate: submitQuiz, isPending: isSubmitting} = useSubmitQuiz(studentId, lessonId);

    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<QuizSubmissionResult | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-gray-100 bg-white p-12">
                <Loading/>
            </div>
        );
    }

    const safeQuestions = questions ?? [];

    if (safeQuestions.length === 0) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-400">
                Bài quiz này chưa có câu hỏi nào.
            </div>
        );
    }

    const allAnswered = safeQuestions.every((q) => selectedAnswers[q.id] !== undefined);

    const handleSelect = (questionId: string, optionIndex: number) => {
        if (result) return; // đã nộp bài thì không cho đổi đáp án nữa
        setSelectedAnswers((prev) => ({...prev, [questionId]: optionIndex}));
    };

    const handleSubmit = () => {
        const answers: QuizAnswerItem[] = safeQuestions.map((q) => ({
            questionId: q.id,
            selectedOptionIndex: selectedAnswers[q.id],
        }));

        submitQuiz(answers, {
            onSuccess: (data) => {
                setResult(data);
                onSubmitted?.(data);
            },
        });
    };

    const handleRetry = () => {
        setResult(null);
        setSelectedAnswers({});
    };

    const getResultForQuestion = (questionId: string) =>
        result?.results.find((r) => r.questionId === questionId);

    return (
        <div className="flex flex-col gap-5">
            {result && (
                <div className="flex flex-col gap-3 rounded-xl border border-orange-200 bg-orange-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-orange-700">
                            Bạn đã trả lời đúng {result.correctCount}/{result.totalCount} câu
                        </p>
                        <p className="text-xs text-orange-500">Điểm: {result.scorePercent}%</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="flex w-fit items-center gap-1.5 rounded-lg border border-orange-300 bg-white px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-100"
                    >
                        <RotateCcw className="h-3.5 w-3.5"/>
                        Làm lại
                    </button>
                </div>
            )}

            {safeQuestions.map((question, index) => {
                const questionResult = getResultForQuestion(question.id);
                const selectedIndex = selectedAnswers[question.id];

                return (
                    <div key={question.id} className="rounded-xl border border-gray-100 bg-white p-6">
                        <p className="mb-4 text-sm font-semibold text-gray-900">
                            Câu {index + 1}: {question.questionText}
                        </p>

                        <div className="flex flex-col gap-2">
                            {question.options.map((option, optionIndex) => {
                                const isSelected = selectedIndex === optionIndex;
                                const isCorrectOption =
                                    questionResult?.correctOptionIndex === optionIndex;
                                const isWrongSelected =
                                    Boolean(questionResult) && isSelected && !questionResult!.correct;

                                return (
                                    <button
                                        key={optionIndex}
                                        type="button"
                                        disabled={Boolean(result)}
                                        onClick={() => handleSelect(question.id, optionIndex)}
                                        className={clsx(
                                            "flex items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                                            result
                                                ? isCorrectOption
                                                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                                    : isWrongSelected
                                                        ? "border-red-300 bg-red-50 text-red-700"
                                                        : "border-gray-100 text-gray-500"
                                                : isSelected
                                                    ? "border-orange-400 bg-orange-50 text-orange-700"
                                                    : "border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-gray-50"
                                        )}
                                    >
                                        <span>{option}</span>
                                        {result && isCorrectOption && <Check className="h-4 w-4 shrink-0"/>}
                                        {result && isWrongSelected && <X className="h-4 w-4 shrink-0"/>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {!result && (
                <button
                    type="button"
                    disabled={!allAnswered || isSubmitting}
                    onClick={handleSubmit}
                    className="self-end rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
                </button>
            )}
        </div>
    );
}
