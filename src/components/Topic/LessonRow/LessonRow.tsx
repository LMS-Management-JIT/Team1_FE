import { ArrowRight, FileText, PenSquare, PlayCircle } from "lucide-react";
import type { Lesson } from "../../../types/topic.ts";

function LessonIcon({ lesson }: { lesson: Lesson }) {
    const iconMap: Record<string, typeof FileText> = {
        READING: FileText,
        LECTURE: PlayCircle,
        PRACTICE: PenSquare,
    };

    const Icon = iconMap[lesson.type] ?? FileText;
    const colorMap: Record<string, string> = {
        READING: "bg-sky-500 text-white",
        LECTURE: "bg-orange-500 text-white",
        PRACTICE: "bg-emerald-500 text-white",
    };

    return (
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorMap[lesson.type] ?? "bg-slate-100 text-slate-500 ring-1 ring-slate-200"}`}>
            <Icon size={17} />
        </span>
    );
}

export function LessonRow({ lesson }: { lesson: Lesson }) {
    const typeLabelMap: Record<string, string> = {
        READING: "BÀI ĐỌC",
        LECTURE: "BÀI GIẢNG",
        PRACTICE: "THỰC HÀNH",
    };

    const badgeClass = "text-slate-600";
    const label = typeLabelMap[lesson.type] ?? lesson.type;

    return (
        <div className="lesson-row border-slate-200 bg-white">
            <LessonIcon lesson={lesson} />
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                    <p className="min-w-0 text-base font-semibold leading-6 text-slate-800">{lesson.lessonName}</p>
                    <span className={`shrink-0 whitespace-nowrap text-sm font-semibold leading-6 ${badgeClass}`}>{label}</span>
                </div>
                <p className="mt-0.5 text-sm leading-5 text-slate-500">{lesson.meta}</p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-slate-400" />
        </div>
    );
}
