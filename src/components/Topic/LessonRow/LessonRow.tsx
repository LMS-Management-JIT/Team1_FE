import { ArrowRight, CheckCircle2, Code2, FileText, HelpCircle, PenSquare, PlayCircle } from "lucide-react";
import type { Lesson } from "../../../types/topic.ts";

function LessonIcon({ lesson }: { lesson: Lesson }) {
    if (lesson.status === "completed") {
        return (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                <CheckCircle2 size={17} />
            </span>
        );
    }
    if (lesson.status === "current") {
        return (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                <PlayCircle size={17} />
            </span>
        );
    }

    const iconMap: Record<string, typeof FileText> = {
        reading: FileText,
        video: PlayCircle,
        code: Code2,
        exercise: PenSquare,
        quiz: HelpCircle,
    };
    const Icon = iconMap[lesson.type] ?? FileText;

    return (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200">
            <Icon size={17} />
        </span>
    );
}

export function LessonRow({ lesson }: { lesson: Lesson }) {
    const isCurrent = lesson.status === "current";

    const badgeClass = lesson.status === "completed"
        ? "text-green-700"
        : isCurrent
            ? "text-orange-700"
            : "text-slate-600";

    const label = lesson.status === "completed"
        ? "Hoàn thành"
        : isCurrent
            ? "Đang học"
            : "Sắp tới";

    return (
        <div className={`lesson-row ${
            isCurrent ? "border-orange-200 bg-orange-50/55" : "border-slate-200 bg-white"
        }`}>
            <LessonIcon lesson={lesson} />
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                    <p className="min-w-0 text-base font-semibold leading-6 text-slate-800">{lesson.title}</p>
                    <span className={`shrink-0 whitespace-nowrap text-sm font-semibold leading-6 ${badgeClass}`}>{label}</span>
                </div>
                <p className="mt-0.5 text-sm leading-5 text-slate-500">{lesson.meta}</p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-slate-400" />
        </div>
    );
}
