import {CheckCircle2, Lock, PlayCircle} from "lucide-react";
import clsx from "clsx";
import type {LessonSummary} from "../../../types/lesson.ts";

interface LessonSidebarProps {
    topicName: string;
    lessons: LessonSummary[] | undefined | null;
    currentLessonId: string;
    completedLessonIds: Set<string>;
    onSelectLesson: (lessonId: string) => void;
}

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
                              }: LessonSidebarProps) {
    const safeLessons = lessons ?? [];
    const completedCount = safeLessons.filter((l) => completedLessonIds.has(l.id)).length;
    const progressPercent = safeLessons.length
        ? Math.round((completedCount / safeLessons.length) * 100)
        : 0;

    return (
        <aside className="w-80 shrink-0 rounded-xl border border-gray-100 bg-white p-5">
            <h3 className="font-semibold text-gray-900">{topicName}</h3>
            <p className="mb-2 text-xs text-gray-400">
                {completedCount}/{safeLessons.length} bài học hoàn thành
            </p>
            <div className="mb-4 h-1.5 w-full rounded-full bg-gray-100">
                <div
                    className="h-1.5 rounded-full bg-orange-500 transition-all"
                    style={{width: `${progressPercent}%`}}
                />
            </div>

            <ul className="flex flex-col gap-1">
                {safeLessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId;
                    const isCompleted = completedLessonIds.has(lesson.id);
                    const meta = getLessonMeta(lesson);

                    return (
                        <li key={lesson.id}>
                            <button
                                type="button"
                                onClick={() => onSelectLesson(lesson.id)}
                                className={clsx(
                                    "flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                                    isActive ? "bg-orange-50 ring-1 ring-orange-200" : "hover:bg-gray-50"
                                )}
                            >
                <span className="mt-0.5">
                  {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500"/>
                  ) : isActive ? (
                      <PlayCircle className="h-4 w-4 text-orange-500"/>
                  ) : (
                      <Lock className="h-4 w-4 text-gray-300"/>
                  )}
                </span>
                                <span>
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