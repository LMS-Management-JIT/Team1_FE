import {BookOpen, Check, ChevronLeft, Code2, PlayCircle,} from "lucide-react";
import {Link} from "react-router-dom";
import clsx from "clsx";
import type {LessonSummary} from "../../../types/lesson.ts";

interface LessonSidebarProps {
    topicName: string;
    lessons: LessonSummary[] | undefined | null;
    currentLessonId: string;
    completedLessonIds: Set<string>;
    onSelectLesson: (lessonId: string) => void;
    backToTopicsHref?: string;
}

const iconMap = {
    READING: BookOpen,
    LECTURE: PlayCircle,
    PRACTICE: Code2,
};

function getLessonMeta(lesson: LessonSummary) {
    if (lesson.type === "READING") return {label: "Bài đọc", unit: "phút"};
    if (lesson.type === "LECTURE") return {label: "Bài giảng", unit: "phút"};
    return {label: "Thực hành", unit: "câu"};
}

export function LessonSidebar({
                                  topicName,
                                  lessons,
                                  currentLessonId,
                                  completedLessonIds,
                                  onSelectLesson,
                                  backToTopicsHref,
                              }: LessonSidebarProps) {
    const safeLessons = lessons ?? [];
    const sortedLessons = [...safeLessons].sort((a, b) => a.lessonOrder - b.lessonOrder);
    const completedCount = safeLessons.filter((l) => completedLessonIds.has(l.id)).length;
    const progressPercent = safeLessons.length
        ? Math.round((completedCount / safeLessons.length) * 100)
        : 0;

    return (
        <aside
            className="flex w-full shrink-0 flex-col rounded-3xl border border-gray-100 bg-white p-5 shadow-[0px_14px_32px_-16px_#1e1e2d1a] lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:w-80">
            <div className="shrink-0">
                {backToTopicsHref && (
                    <Link
                        to={backToTopicsHref}
                        className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-orange-500"
                    >
                        <ChevronLeft className="h-3.5 w-3.5"/>
                        Quay lại danh sách chương
                    </Link>
                )}
                <h3 className="font-bold text-gray-900">{topicName}</h3>
                <p className="mb-2 text-xs text-gray-400">
                    {completedCount}/{safeLessons.length} bài học hoàn thành
                </p>
                <div className="mb-4 h-1.5 w-full rounded-full bg-gray-100">
                    <div
                        className="h-1.5 rounded-full bg-orange-500 transition-all"
                        style={{width: `${progressPercent}%`}}
                    />
                </div>
            </div>

            <ul className="sidebar-scroll flex flex-col gap-1.5 overflow-y-auto pr-1 lg:min-h-0 lg:flex-1">
                {sortedLessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId;
                    const isCompleted = completedLessonIds.has(lesson.id);
                    const meta = getLessonMeta(lesson);
                    const Icon = iconMap[lesson.type] ?? BookOpen;

                    // Màu icon theo TRẠNG THÁI (giống Figma), không theo loại bài học:
                    // xanh lá = đã hoàn thành · cam đặc = đang xem · xám nhạt = chưa học tới
                    // (không dùng icon khoá vì bài vẫn bấm được, tránh hiển thị sai hành vi thật)
                    const iconBoxClass = isCompleted
                        ? "bg-emerald-50 text-emerald-500"
                        : isActive
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-400";

                    return (
                        <li key={lesson.id}>
                            <button
                                type="button"
                                onClick={() => onSelectLesson(lesson.id)}
                                className={clsx(
                                    "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                                    isActive ? "bg-orange-50 ring-1 ring-orange-200" : "hover:bg-gray-50"
                                )}
                            >
                                <span
                                    className={clsx(
                                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                        iconBoxClass
                                    )}
                                >
                                    {isCompleted ? <Check size={17}/> : <Icon size={17}/>}
                                </span>
                                <span className="min-w-0">
                                    <p
                                        className={clsx(
                                            "text-sm",
                                            isActive ? "font-semibold text-orange-600" : "font-medium text-gray-700"
                                        )}
                                    >
                                        {lesson.lessonOrder}. {lesson.lessonName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {meta.label}
                                        {lesson.duration ? ` · ${lesson.duration} ${meta.unit}` : ""}
                                    </p>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
