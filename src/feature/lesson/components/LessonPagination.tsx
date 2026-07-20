import { ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import type { LessonSummary } from "../../../types/lesson.ts";

interface LessonPaginationProps {
    lessons: LessonSummary[];
    currentLessonId: string;
    onSelectLesson: (lessonId: string) => void;
    onCompleteTopic?: () => void; // Khai báo prop này để sửa lỗi ts(2322)
}

export function LessonPagination({ lessons, currentLessonId, onSelectLesson, onCompleteTopic }: LessonPaginationProps) {
    const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
    
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    
    // Kiểm tra xem đây có phải là bài học cuối cùng trong danh sách không
    const isLastLesson = currentIndex === lessons.length - 1;

    return (
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            {/* Nút bài trước */}
            {prevLesson ? (
                <button
                    onClick={() => onSelectLesson(prevLesson.id)}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Bài trước</span>
                </button>
            ) : <div />}

            {/* Nút bài tiếp theo hoặc nút Hoàn thành Topic nếu là bài cuối cùng */}
            {isLastLesson ? (
                <button
                    onClick={onCompleteTopic}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 hover:scale-105 shadow-md shadow-emerald-500/30"
                >
                    <CheckSquare className="h-4 w-4" /> Hoàn thành Topic
                </button>
            ) : nextLesson ? (
                <button
                    onClick={() => onSelectLesson(nextLesson.id)}
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                    <span className="hidden sm:inline">Bài tiếp theo</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            ) : <div />}
        </div>
    );
}