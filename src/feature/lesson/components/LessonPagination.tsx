import {useEffect, useState} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import clsx from "clsx";
import type {LessonSummary} from "../../../types/lesson";

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
    const sorted = [...safeLessons].sort(
        (a, b) => a.lessonOrder - b.lessonOrder
    );

    const currentIndex = sorted.findIndex(
        (lesson) => lesson.id === currentLessonId
    );

    useEffect(() => {
        setJumpValue("");
    }, [currentLessonId]);

    const goTo = (index: number) => {
        if (index < 0 || index >= sorted.length) return;
        onSelectLesson(sorted[index].id);
    };

    const handleJump = () => {
        const targetOrder = Number(jumpValue);

        const target = sorted.find(
            (lesson) => lesson.lessonOrder === targetOrder
        );

        if (target) {
            onSelectLesson(target.id);
        }

        setJumpValue("");
    };

    if (!sorted.length) return null;

    return (
        <div
            className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-gray-100 pt-6 lg:flex-row">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => goTo(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronLeft size={16}/>
                </button>

                {sorted.map((lesson, index) => (
                    <button
                        key={lesson.id}
                        onClick={() => goTo(index)}
                        className={clsx(
                            "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                            lesson.id === currentLessonId
                                ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        {lesson.lessonOrder}
                    </button>
                ))}

                <button
                    onClick={() => goTo(currentIndex + 1)}
                    disabled={currentIndex === sorted.length - 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronRight size={16}/>
                </button>
            </div>

            <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                <span>
                    Trang {currentIndex + 1} / {sorted.length}
                </span>

                <div className="flex items-center gap-2">
                    <span>Đến trang:</span>

                    <input
                        type="text"
                        value={jumpValue}
                        onChange={(e) =>
                            setJumpValue(
                                e.target.value.replace(/[^0-9]/g, "")
                            )
                        }
                        onKeyDown={(e) =>
                            e.key === "Enter" && handleJump()
                        }
                        placeholder="VD: 5"
                        className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm text-gray-700 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                </div>
            </div>
        </div>
    );
}