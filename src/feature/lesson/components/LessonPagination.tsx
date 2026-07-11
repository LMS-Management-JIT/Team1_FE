import {ChevronLeft, ChevronRight} from "lucide-react";
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
    const safeLessons = lessons ?? [];
    const sorted = [...safeLessons].sort((a, b) => a.lessonOrder - b.lessonOrder);
    const currentIndex = sorted.findIndex((lesson) => lesson.id === currentLessonId);

    if (!sorted.length) return null;

    const previousLesson = currentIndex > 0 ? sorted[currentIndex - 1] : null;
    const nextLesson = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

    return (
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-gray-100 pt-6">
            <button
                onClick={() => previousLesson && onSelectLesson(previousLesson.id)}
                disabled={!previousLesson}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft size={16}/>
                Bài trước
            </button>

            <button
                onClick={() => nextLesson && onSelectLesson(nextLesson.id)}
                disabled={!nextLesson}
                className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
                Bài tiếp theo
                <ChevronRight size={16}/>
            </button>
        </div>
    );
}
