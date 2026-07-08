import {useState} from "react";
import clsx from "clsx";
import type {Lesson} from "../../../types/lesson.types";
import {CodeEditorPanel} from "./CodeEditorPanel.tsx";
import {SafeHtmlContent} from "../../../components/lesson/common/SafeHtmlContent";

interface PracticeContentProps {
    lesson: Lesson;
    onSubmit: (code: string) => void;
    isSubmitting: boolean;
}

type Tab = "assignment" | "submission";

export function PracticeContent({lesson, onSubmit, isSubmitting}: PracticeContentProps) {
    const [tab, setTab] = useState<Tab>("submission");

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
                // ⚠️ Đổi từ lesson.description -> lesson.content (đề bài dạng HTML đầy đủ)
                <SafeHtmlContent html={lesson.content} fallback="Đề bài đang được cập nhật."/>
            ) : (
                <CodeEditorPanel
                    initialCode={lesson.starterCode ?? ""}
                    language={lesson.language ?? "text"}
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}