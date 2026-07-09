import {PlayCircle, Sparkles} from "lucide-react";
import type {Lesson} from "../../../types/lesson.ts";
import {SafeHtmlContent} from "../../../components/lesson/common/SafeHtmlContent";
import {highlightTimestamps} from "../../../utils/highlightTimestamps";
import {formatDuration} from "../../../utils/formatDuration";

interface LectureContentProps {
    lesson: Lesson;
    showSummary: boolean;
}

export function LectureContent({lesson, showSummary}: LectureContentProps) {
    const enhancedContent = highlightTimestamps(lesson.content);

    return (
        <div className="flex flex-col gap-4">
            <div
                className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-indigo-900 to-purple-800">
                {lesson.videoUrl ? (
                    <video src={lesson.videoUrl} controls className="h-full w-full rounded-xl"/>
                ) : (
                    <PlayCircle className="h-14 w-14 text-white/80"/>
                )}
            </div>

            {showSummary && (
                <div className="rounded-xl border border-orange-200 bg-white p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-orange-600">
                            <Sparkles className="h-4 w-4"/>
                            Tóm tắt bởi AI
                        </div>
                        {lesson.duration != null && (
                            <span
                                className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-500">
                                {formatDuration(lesson.duration)} video
                            </span>
                        )}
                    </div>

                    <SafeHtmlContent
                        html={enhancedContent}
                        fallback="Chưa có tóm tắt cho bài giảng này."
                    />

                    <p className="mt-4 flex items-start gap-1.5 text-xs text-orange-500">
                        <span>⚠️</span>
                        Nội dung do AI tạo tự động, có thể chưa chính xác hoàn toàn.
                    </p>
                </div>
            )}
        </div>
    );
}
