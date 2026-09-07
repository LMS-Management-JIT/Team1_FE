import { ChevronLeft, ChevronRight, CornerUpLeft } from "lucide-react";
import type { LessonSummary } from "../../../types/lesson.ts";

interface LessonPaginationProps {
    lessons: LessonSummary[];
    currentLessonId: string;
    onSelectLesson: (lessonId: string) => void;
    onNavigateBack: () => void; // Thay onCompleteTopic bằng onNavigateBack
}

export function LessonPagination({ lessons, currentLessonId, onSelectLesson, onNavigateBack }: LessonPaginationProps) {
    const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
    
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    
    const isLastLesson = currentIndex === lessons.length - 1;

    return (
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            {/* Nút bài trước */}
            {prevLesson ? (
                <button
                    onClick={() => onSelectLesson(prevLesson.id)}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Bài trước</span>
                </button>
            ) : <div />}

            {/* Nếu là bài cuối cùng -> Nút xanh nước biển trở về */}
            {isLastLesson ? (
                <button
                    onClick={onNavigateBack}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:scale-105 shadow-md shadow-blue-500/30"
                >
                    <CornerUpLeft className="h-4 w-4" /> Trở về trang Topic
                </button>
            ) : nextLesson ? (
                <button
                    onClick={() => onSelectLesson(nextLesson.id)}
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                    <span className="hidden sm:inline">Bài tiếp theo</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            ) : (
                 <button
                    onClick={onNavigateBack}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:scale-105 shadow-md shadow-blue-500/30"
                >
                    <CornerUpLeft className="h-4 w-4" /> Trở về trang Topic
                </button>
            )}
        </div>
    );
}