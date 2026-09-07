import {useState} from "react";
import clsx from "clsx";
import type {Lesson} from "../../../types/lesson.ts";
import {FileSubmissionPanel} from "./FileSubmissionPanel.tsx";
import {SafeHtmlContent} from "../../../components/lesson/common/SafeHtmlContent";
import type {LessonSubmissionResponse} from "../../../services/lessonSubmissionService";
import {QuizContent} from "./QuizContent.tsx";
import type {QuizSubmissionResult} from "../../../types/quiz";

interface PracticeContentProps {
    lesson: Lesson;
    studentId: string;
    existingSubmission: LessonSubmissionResponse | null | undefined;
    onSubmit: (file: File) => void;
    onDeleteSubmission: () => void;
    isSubmitting: boolean;
    isDeleting: boolean;
    onQuizSubmitted?: (result: QuizSubmissionResult, attempts: number) => void;
    isCompleted?: boolean;
}

type Tab = "assignment" | "submission" | "quiz";

export function PracticeContent({
                                    lesson,
                                    studentId,
                                    existingSubmission,
                                    onSubmit,
                                    onDeleteSubmission,
                                    isSubmitting,
                                    isDeleting,
                                    onQuizSubmitted,
                                }: PracticeContentProps) {
    const [tab, setTab] = useState<Tab>("assignment");

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6">
            <div className="mb-4 flex gap-6 border-b border-gray-100 text-sm">
                {(
                    [
                        {key: "assignment", label: "Đề bài"},
                        {key: "submission", label: "Bài nộp của tôi"},
                        {key: "quiz", label: "Quiz"},
                    ] as const
                ).map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setTab(item.key)}
                        className={clsx(
                            "-mb-px border-b-2 pb-3 font-medium",
                            tab === item.key
                                ? "border-orange-500 text-orange-600"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        )}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {tab === "assignment" && (
                <SafeHtmlContent
                    html={lesson.content}
                    fallback="Đề bài đang được cập nhật."
                    defaultLanguage={lesson.language ?? undefined}
                />
            )}

            {tab === "submission" && (
                <FileSubmissionPanel
                    existingSubmission={existingSubmission}
                    onSubmit={onSubmit}
                    onDelete={onDeleteSubmission}
                    isSubmitting={isSubmitting}
                    isDeleting={isDeleting}
                />
            )}

            {tab === "quiz" && (
                <QuizContent
                    lessonId={lesson.id}
                    studentId={studentId}
                    onSubmitted={onQuizSubmitted}
                />
            )}
        </div>
    );
}
