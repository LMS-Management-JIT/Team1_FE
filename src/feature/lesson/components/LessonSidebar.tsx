import {BookOpen, Check, ChevronLeft, Code2, HelpCircle, PlayCircle} from "lucide-react";
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

// Icon riêng cho từng loại bài học (dùng khi bài chưa hoàn thành / chưa phải bài đang xem)
const typeIconMap = {
    READING: BookOpen,
    LECTURE: PlayCircle,
    PRACTICE: Code2,
    QUIZ: HelpCircle,
};

function getLessonMeta(lesson: LessonSummary) {
    if (lesson.type === "READING") return {label: "Bài đọc", unit: "phút"};
    if (lesson.type === "LECTURE") return {label: "Bài giảng", unit: "phút"};
    if (lesson.type === "QUIZ") return {label: "Kiểm tra", unit: "câu"};
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
            className="flex w-full shrink-0 flex-col rounded-3xl border border-gray-100 bg-white p-[23px] shadow-[0px_14px_32px_-16px_#1e1e2d1a] lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:w-[300px]"
        >
            <div className="shrink-0">
                {backToTopicsHref && (
                    <Link
                        to={backToTopicsHref}
                        className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-orange-500"
                    >
                        <ChevronLeft className="h-3.5 w-3.5"/>
                        Quay lại
                    </Link>
                )}

                <h2 className="text-[15px] font-bold leading-normal text-gray-900">
                    {topicName}
                </h2>
                <p className="mb-3 mt-1 text-xs font-medium text-gray-500">
                    {completedCount}/{safeLessons.length} bài học hoàn thành
                </p>

                <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={safeLessons.length}
                    aria-valuenow={completedCount}
                    className="mb-4 flex h-2 w-full overflow-hidden rounded-md bg-gray-100"
                >
                    <div
                        className="h-full rounded-md bg-orange-500 transition-all"
                        style={{width: `${progressPercent}%`}}
                    />
                </div>
            </div>

            <ol className="sidebar-scroll m-0 flex list-none flex-col gap-1.5 overflow-y-auto p-0 pr-1 lg:min-h-0 lg:flex-1">
                {sortedLessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLessonId;
                    const isCompleted = completedLessonIds.has(lesson.id);
                    const meta = getLessonMeta(lesson);
                    const TypeIcon = typeIconMap[lesson.type] ?? BookOpen;

                    // Đã hoàn thành = xanh lá rõ · đang xem = cam đặc · còn lại = xám, icon riêng theo loại bài
                    const iconBoxClass = isCompleted
                        ? "bg-emerald-100 text-emerald-600"
                        : isCurrent
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-400";

                    const titleClass = isCurrent
                        ? "text-orange-600"
                        : isCompleted
                            ? "text-gray-900"
                            : "text-gray-500";

                    return (
                        <li key={lesson.id}>
                            <button
                                type="button"
                                onClick={() => onSelectLesson(lesson.id)}
                                aria-current={isCurrent ? "step" : undefined}
                                className={clsx(
                                    "flex w-full items-center gap-3 rounded-2xl border border-solid p-3 text-left transition-colors",
                                    isCurrent
                                        ? "border-orange-300 bg-orange-50"
                                        : "border-transparent hover:bg-gray-50"
                                )}
                            >
                                <span
                                    className={clsx(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]",
                                        iconBoxClass
                                    )}
                                >
                                    {isCompleted ? <Check size={15}/> : <TypeIcon size={16}/>}
                                </span>

                                <span className="min-w-0">
                                    <p className={clsx("text-[12.5px] font-semibold leading-[16.2px]", titleClass)}>
                                        {lesson.lessonOrder}. {lesson.lessonName}
                                    </p>
                                    <p className="text-[10.5px] font-normal leading-normal text-gray-400">
                                        {meta.label}
                                        {lesson.duration ? ` · ${lesson.duration} ${meta.unit}` : ""}
                                    </p>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </aside>
    );
}
