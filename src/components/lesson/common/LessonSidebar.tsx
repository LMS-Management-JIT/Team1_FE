import {PlayCircle} from "lucide-react";
import type {LessonSidebarData} from "../../../types/lessonSidebar";

interface Props {
    data: LessonSidebarData;
    currentLessonId: string;
}

const LessonSidebar = ({data, currentLessonId}: Props) => {

    const progress =
        data.totalLessons === 0
            ? 0
            : (data.completedLessons / data.totalLessons) * 100;

    return (
        <aside className="rounded-2xl bg-white p-6 shadow">

            <h2 className="text-xl font-semibold">
                {data.moduleName}
            </h2>

            <p className="text-sm text-gray-500">
                {data.topicName}
            </p>

            <div className="mt-4 h-2 rounded-full bg-gray-200">

                <div
                    className="h-2 rounded-full bg-orange-500"
                    style={{
                        width: `${progress}%`,
                    }}
                />

            </div>

            <p className="mt-2 text-sm text-gray-500">
                {data.completedLessons}/{data.totalLessons} bài học
            </p>

            <div className="mt-6 space-y-2">

                {data.lessons.map((lesson) => {

                    const active =
                        lesson.id === currentLessonId;

                    return (

                        <button
                            key={lesson.id}
                            className={`flex w-full gap-3 rounded-xl p-3 text-left transition ${
                                active
                                    ? "bg-orange-50 border border-orange-300"
                                    : "hover:bg-slate-100"
                            }`}
                        >

                            <PlayCircle
                                size={18}
                                className={
                                    active
                                        ? "text-orange-500"
                                        : "text-gray-400"
                                }
                            />

                            <div>
                                <p className="font-medium">
                                    {lesson.lessonOrder}. {lesson.lessonName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {lesson.type}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
};

export default LessonSidebar;