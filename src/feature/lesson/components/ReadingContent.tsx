import type {Lesson} from "../../../types/lesson.ts";
import {SafeHtmlContent} from "../../../components/lesson/common/SafeHtmlContent";

interface ReadingContentProps {
    lesson: Lesson;
    lessonOrder: number | undefined;
}

export function ReadingContent({lesson, lessonOrder}: ReadingContentProps) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-500">
                Bài {lessonOrder ?? "?"} · Tài liệu đọc
            </p>
            <SafeHtmlContent html={lesson.content}/>
        </div>
    );
}