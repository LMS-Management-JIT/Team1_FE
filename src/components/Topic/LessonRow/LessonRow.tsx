import { CheckCircle2, PlayCircle, FileText, Code2, PenSquare, HelpCircle } from "lucide-react";
import type { Lesson } from "../../../types/topic.ts";

function LessonIcon({ lesson }: { lesson: Lesson }) {
    if (lesson.status === "completed") {
        return (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
        <CheckCircle2 size={16} />
      </span>
        );
    }
    if (lesson.status === "current") {
        return (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
        <PlayCircle size={16} />
      </span>
        );
    }
    const iconMap = {
        reading: FileText,
        video: PlayCircle,
        code: Code2,
        exercise: PenSquare,
        quiz: HelpCircle,
    };
    const Icon = iconMap[lesson.type];
    return (
        <span className="flex h-6 w-6 items-center justify-center text-gray-400">
      <Icon size={16} />
    </span>
    );
}

export function LessonRow({ lesson }: { lesson: Lesson }) {
    const isCurrent = lesson.status === "current";
    return (
        <div
            className={`flex items-center gap-3 rounded-md px-3 py-2 ml-6 border-l-4 space-y-5 mt-14 ${
                lesson.status === "completed"
                    ? "border-green-500"
                    : isCurrent
                        ? "border-orange-500 bg-orange-50"
                        : "border-transparent"
            }`}
        >
            <LessonIcon lesson={lesson} />
            <div>
                <p className="text-sm font-medium text-gray-800">{lesson.title}</p>
                <p className="text-xs text-gray-400">{lesson.meta}</p>
            </div>
        </div>
    );
}