import {ArrowRight, FileText, PenSquare, PlayCircle} from "lucide-react";
import {useNavigate} from "react-router-dom";
import type {Lesson} from "../../../types/topic.ts";

function LessonIcon({lesson}: { lesson: Lesson }) {
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
        <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorMap[lesson.type] ?? "bg-slate-100 text-slate-500 ring-1 ring-slate-200"}`}>
            <Icon size={17}/>
        </span>
    );
}

interface LessonRowProps {
    lesson: Lesson;
    topicId: string;
}

export function LessonRow({lesson, topicId}: LessonRowProps) {
    const navigate = useNavigate();

    const typeLabelMap: Record<string, string> = {
        READING: "BÀI ĐỌC",
        LECTURE: "BÀI GIẢNG",
        PRACTICE: "THỰC HÀNH",
    };

    const badgeClass = "text-slate-600";
    const label = typeLabelMap[lesson.type] ?? lesson.type;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/topics/${topicId}/lessons/${lesson.id}`)}
            onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/topics/${topicId}/lessons/${lesson.id}`);
            }}
            className="lesson-row cursor-pointer border-slate-200 bg-white transition-colors hover:bg-slate-50"
        >
            <LessonIcon lesson={lesson}/>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                    <p className="min-w-0 text-base font-semibold leading-6 text-slate-800">{lesson.lessonName}</p>
                    <span
                        className={`shrink-0 whitespace-nowrap text-sm font-semibold leading-6 ${badgeClass}`}>{label}</span>
                </div>
                <p className="mt-0.5 text-sm leading-5 text-slate-500">{lesson.meta}</p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-slate-400"/>
        </div>
    );
}
