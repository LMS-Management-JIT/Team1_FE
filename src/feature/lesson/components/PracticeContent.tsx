import {useState} from "react";
import clsx from "clsx";
import type {Lesson} from "../../../types/lesson.ts";
import {FileSubmissionPanel} from "./FileSubmissionPanel.tsx";
import {SafeHtmlContent} from "../../../components/lesson/common/SafeHtmlContent";
import type {LessonSubmissionResponse} from "../../../services/lessonSubmissionService";

interface PracticeContentProps {
    lesson: Lesson;
    existingSubmission: LessonSubmissionResponse | null | undefined;
    onSubmit: (file: File) => void;
    onDeleteSubmission: () => void;
    isSubmitting: boolean;
    isDeleting: boolean;
}

type Tab = "assignment" | "submission";

export function PracticeContent({
                                    lesson,
                                    existingSubmission,
                                    onSubmit,
                                    onDeleteSubmission,
                                    isSubmitting,
                                    isDeleting,
                                }: PracticeContentProps) {
    const [tab, setTab] = useState<Tab>("assignment");

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6">
            <div className="mb-4 flex gap-6 border-b border-gray-100 text-sm">
                {(
                    [
                        {key: "assignment", label: "Đề bài"},
                        {key: "submission", label: "Bài nộp của tôi"},
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

            {tab === "assignment" ? (
                <SafeHtmlContent html={lesson.content} fallback="Đề bài đang được cập nhật."/>
            ) : (
                <FileSubmissionPanel
                    existingSubmission={existingSubmission}
                    onSubmit={onSubmit}
                    onDelete={onDeleteSubmission}
                    isSubmitting={isSubmitting}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
}