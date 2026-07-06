import { useState } from "react";
import { AlignJustify, ChevronDown } from "lucide-react";
import type { Topic } from "../../../types/topic.ts";
import { LessonRow } from "../LessonRow/LessonRow.tsx";

export function TopicItem({ topic, defaultOpen = false }: { topic: Topic; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="w-full rounded-lg border border-gray-200 space-y-6">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
            >
        <span className="flex items-center gap-3 font-semibold text-gray-800">
          <AlignJustify size={16} className="text-gray-500" />
            {topic.title}
        </span>
                <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && topic.lessons.length > 0 && (
                <div className="w-full space-y-1 pb-3">
                    {topic.lessons.map((lesson) => (
                        <LessonRow key={lesson.id} lesson={lesson} />
                    ))}
                </div>
            )}
        </div>
    );
}