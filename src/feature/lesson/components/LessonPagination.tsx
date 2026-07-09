import {useState} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import clsx from "clsx";
import type {LessonSummary} from "../../../types/lesson.ts";

interface LessonPaginationProps {
    lessons: LessonSummary[] | undefined | null;
    currentLessonId: string;
    onSelectLesson: (lessonId: string) => void;
}

export function LessonPagination({
                                     lessons,
                                     currentLessonId,
                                     onSelectLesson,
                                 }: LessonPaginationProps) {
    const [jumpValue, setJumpValue] = useState("");
    const safeLessons = lessons ?? [];
    const sorted = [...safeLessons].sort((a, b) => a.lessonOrder - b.lessonOrder);
    const currentIndex = sorted.findIndex((l) => l.id === currentLessonId);

    const goTo = (index: number) => {
        if (index < 0 || index >= sorted.length) return;
        onSelectLesson(sorted[index].id);
    };

    const handleJump = () => {
        const targetOrder = Number(jumpValue);
        const target = sorted.find((l) => l.lessonOrder === targetOrder);
        if (target) onSelectLesson(target.id);
        setJumpValue("");
    };

    return (
        <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1">
                <button onClick={() => goTo(currentIndex - 1)} className="rounded p-1.5 hover:bg-gray-100">
                    <ChevronLeft className="h-4 w-4"/>
                </button>
                {sorted.map((lesson, index) => (
                    <button
                        key={lesson.id}
                        onClick={() => goTo(index)}
                        className={clsx(
                            "h-7 w-7 rounded-md text-xs font-medium",
                            lesson.id === currentLessonId
                                ? "bg-orange-500 text-white"
                                : "text-gray-500 hover:bg-gray-100"
                        )}
                    >
                        {lesson.lessonOrder}
                    </button>
                ))}
                <button onClick={() => goTo(currentIndex + 1)} className="rounded p-1.5 hover:bg-gray-100">
                    <ChevronRight className="h-4 w-4"/>
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-gray-400">
        <span>
          Trang {currentIndex + 1} / {sorted.length}
        </span>
                <span>Đến trang:</span>
                <input
                    value={jumpValue}
                    onChange={(e) => setJumpValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJump()}
                    placeholder="VD:5"
                    className="w-16 rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-orange-400"
                />
            </div>
        </div>
    );
}