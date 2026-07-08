import {PlayCircle} from "lucide-react";
import type {Lesson} from "../../../types/lesson.types";
import {SafeHtmlContent} from "../../../components/lesson/common/SafeHtmlContent";

interface LectureContentProps {
    lesson: Lesson;
}

export function LectureContent({lesson}: LectureContentProps) {
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

            <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-5">
                <p className="mb-2 text-sm font-semibold text-orange-600">✨ Tóm tắt bài giảng</p>
                <SafeHtmlContent html={lesson.content} fallback="Chưa có tóm tắt cho bài giảng này."/>
            </div>
        </div>
    );
}