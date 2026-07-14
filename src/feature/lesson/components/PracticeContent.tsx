import {useState} from "react";
import clsx from "clsx";
import type {Lesson} from "../../../types/lesson.ts";
import {FileSubmissionPanel} from "./FileSubmissionPanel.tsx";
import {SafeHtmlContent} from "../../../components/lesson/common/SafeHtmlContent";
import {autoFormatHeadings} from "../../../utils/autoFormatHeadings";

interface PracticeContentProps {
    lesson: Lesson;
    onSubmit: (file: File) => void;
    isSubmitting: boolean;
}

type Tab = "assignment" | "submission";

export function PracticeContent({lesson, onSubmit, isSubmitting}: PracticeContentProps) {
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
                <SafeHtmlContent html={autoFormatHeadings(lesson.content)} fallback="Đề bài đang được cập nhật."/>
            ) : (
                <FileSubmissionPanel
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}