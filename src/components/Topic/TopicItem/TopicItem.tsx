import { useState } from "react";
import { AlignJustify, ChevronDown } from "lucide-react";
import type { TopicWithLessons } from "../../../types/topic.ts";
import { LessonRow } from "../LessonRow/LessonRow.tsx";

export function TopicItem({ topic, defaultOpen = false }: { topic: TopicWithLessons; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <article
            className={`w-full overflow-hidden rounded-[18px] border bg-white shadow-sm transition ${
                open ? "border-orange-200" : "border-slate-200"
            }`}
        >
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`topic-item__button ${
                    open ? "bg-orange-50/55" : "bg-white hover:bg-slate-50"
                }`}
            >
                <span className="topic-item__main">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                        <AlignJustify size={19} />
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-base font-semibold leading-6 text-slate-900">{topic.topicName}</span>
                        <span className="mt-0.5 block text-sm leading-5 text-slate-500">{topic.lessons.length} bài học</span>
                    </span>
                </span>

                <ChevronDown
                    size={21}
                    className={`shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && topic.lessons.length > 0 && (
                <div className="topic-item__content">
                    {topic.lessons.map((lesson) => (
                        <LessonRow key={lesson.id} lesson={lesson} />
                    ))}
                </div>
            )}
        </article>
    );
}
